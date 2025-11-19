import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSMTPConfig, sendEmailToLead } from '@/lib/emailSender'
import { buildSegmentFilter } from '@/lib/segmenter'

const BATCH_SIZE = 20 // Small batches to avoid Gmail rate limits (20 emails per batch)
const DAILY_EMAIL_LIMIT = 700 // Maximum emails per day
const EMAIL_DELAY_MS = 3000 // 3 seconds delay between each email (Gmail allows ~20 emails/minute)
const BATCH_DELAY_MS = 10000 // 10 seconds delay between batches to avoid rate limits
const MAX_RETRIES = 3 // Maximum retry attempts for failed emails
const RETRY_DELAY_MS = 5000 // 5 seconds delay before retry

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Allow sending if status is 'sending' (already in progress), 'active' (can send daily), or 'draft'
    // Only block if currently sending
    if (campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Campaign is already being sent' },
        { status: 400 }
      )
    }
    
    // If status is 'completed', change it to 'active' to allow daily sending
    if (campaign.status === 'completed') {
      await prisma.campaign.update({
        where: { id },
        data: { status: 'active' },
      })
    }

    // Check daily email limit (campaign emails only, follow-ups don't count)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count campaign emails sent today (follow-ups are NOT counted in daily limit)
    const emailsSentToday = await prisma.emailLog.count({
      where: {
        status: 'sent',
        sentAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const remainingQuota = DAILY_EMAIL_LIMIT - emailsSentToday

    if (remainingQuota <= 0) {
      return NextResponse.json(
        {
          error: `Daily campaign email limit reached. You've sent ${emailsSentToday} campaign emails today. Maximum is ${DAILY_EMAIL_LIMIT} campaign emails per day. Follow-up emails are sent separately and don't count towards this limit. Please try again tomorrow.`,
          emailsSentToday,
          dailyLimit: DAILY_EMAIL_LIMIT,
        },
        { status: 429 }
      )
    }

    // Get SMTP config
    const smtpConfig = await getSMTPConfig()

    // Build segment filter (including group if specified)
    const segmentFilter = buildSegmentFilter(
      campaign.segmentCity,
      campaign.segmentState,
      campaign.segmentCategory,
      campaign.segmentGroupId || null
    )

    // Get leads matching segment
    const allMatchingLeads = await prisma.lead.findMany({
      where: segmentFilter,
    })

    // Get leads that already received an email from THIS campaign (don't send to same leads again)
    const leadsSentFromThisCampaign = await prisma.emailLog.findMany({
      where: {
        campaignId: id,
        status: 'sent',
      },
      select: {
        leadId: true,
      },
      distinct: ['leadId'],
    })

    // Only skip leads that already got this specific campaign (allow daily sending to new leads)
    const sentLeadIds = new Set(
      leadsSentFromThisCampaign.map((log) => log.leadId)
    )

    // Filter out leads that already received an email from this campaign
    const availableLeads = allMatchingLeads.filter((lead) => !sentLeadIds.has(lead.id))
    
    console.log(`\n📊 Lead Filtering:`)
    console.log(`   Total matching leads: ${allMatchingLeads.length}`)
    console.log(`   Already sent from this campaign: ${leadsSentFromThisCampaign.length}`)
    console.log(`   Available to send: ${availableLeads.length}`)
    console.log(`   Daily campaign quota: ${emailsSentToday}/${DAILY_EMAIL_LIMIT} used, ${remainingQuota} remaining`)
    console.log(`   Note: Follow-up emails are sent separately and don't count towards daily limit`)

    // Limit to remaining quota
    const leads = availableLeads.slice(0, remainingQuota)

    if (leads.length === 0) {
      return NextResponse.json(
        {
          error: 'No available leads to send to. All matching leads have already received an email from this campaign.',
          matchingLeads: allMatchingLeads.length,
          alreadySentFromCampaign: sentLeadIds.size,
          dailyQuota: {
            used: emailsSentToday,
            limit: DAILY_EMAIL_LIMIT,
            remaining: remainingQuota,
          },
        },
        { status: 400 }
      )
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id },
      data: { status: 'sending' },
    })

    // Get base URL for tracking
    // Priority: Production URL first, then request origin, then localhost
    let baseUrl = 'http://localhost:3000'
    
    // Check for production URLs first (even when running locally, we want production URLs in emails)
    if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
      baseUrl = process.env.NEXTAUTH_URL
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    } else if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL
    } else if (request.nextUrl.origin && !request.nextUrl.origin.includes('localhost')) {
      // Only use request origin if it's not localhost
      baseUrl = request.nextUrl.origin
    } else {
      // Fallback: try to detect production URL from environment
      // If running locally but want production URLs, set NEXTAUTH_URL in .env
      baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }
    
    console.log('Using baseUrl for tracking:', baseUrl)
    console.log('Request origin was:', request.nextUrl.origin)
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('VERCEL_URL:', process.env.VERCEL_URL)

    // Process in batches
    let sent = 0
    let failed = 0
    const totalLeads = leads.length
    const startTime = Date.now()

    console.log(`\n🚀 Starting campaign send: ${totalLeads} emails to send`)
    console.log(`📊 Batch size: ${BATCH_SIZE}, Email delay: ${EMAIL_DELAY_MS}ms, Batch delay: ${BATCH_DELAY_MS}ms\n`)

    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      // Check if campaign was paused (with retry for connection issues)
      let currentCampaign = null
      let retries = 3
      while (retries > 0) {
        try {
          currentCampaign = await prisma.campaign.findUnique({
            where: { id },
            select: { status: true },
          })
          break
        } catch (error: any) {
          retries--
          if (retries === 0) {
            console.error('Failed to check campaign status after retries:', error)
            throw error
          }
          console.warn(`Database connection error, retrying... (${retries} retries left)`)
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
      
      if (currentCampaign?.status === 'paused') {
        console.log(`\n⏸️  Campaign paused. Stopping at ${sent} sent, ${failed} failed.`)
        break
      }
      
      const batch = leads.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(totalLeads / BATCH_SIZE)

      console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} emails)...`)

      // Process emails sequentially within batch to avoid rate limits
      for (let j = 0; j < batch.length; j++) {
        const lead = batch[j]
        const currentIndex = i + j + 1
        const progress = ((currentIndex / totalLeads) * 100).toFixed(1)

        // Create email log entry (with retry for connection issues)
        let emailLog = null
        let createRetries = 3
        while (createRetries > 0 && !emailLog) {
          try {
            emailLog = await prisma.emailLog.create({
              data: {
                leadId: lead.id,
                campaignId: id,
                status: 'pending',
              },
            })
            break
          } catch (error: any) {
            createRetries--
            if (createRetries === 0) {
              console.error(`Failed to create email log for ${lead.email} after retries:`, error)
              failed++
              continue // Skip this email
            }
            console.warn(`Database error creating log, retrying... (${createRetries} retries left)`)
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }
        
        if (!emailLog) {
          continue // Skip this email if we couldn't create the log
        }

        let retryCount = 0
        let emailSent = false

        // Check if campaign was paused before processing each email (with retry)
        let checkCampaign = null
        let statusRetries = 3
        while (statusRetries > 0) {
          try {
            checkCampaign = await prisma.campaign.findUnique({
              where: { id },
              select: { status: true },
            })
            break
          } catch (error: any) {
            statusRetries--
            if (statusRetries === 0) {
              console.warn('Failed to check campaign status, continuing...')
              break
            }
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }
        
        if (checkCampaign?.status === 'paused') {
          console.log(`\n⏸️  Campaign paused. Stopping at ${sent} sent, ${failed} failed.`)
          break
        }

        // Retry logic for transient failures
        while (retryCount <= MAX_RETRIES && !emailSent) {
          try {
            // Add delay between emails to avoid Gmail rate limits
            if (currentIndex > 1) {
              await new Promise((resolve) => setTimeout(resolve, EMAIL_DELAY_MS))
            }

            // Send email
            const result = await sendEmailToLead(
              smtpConfig,
              lead,
              campaign,
              baseUrl
            )

            if (result.success) {
              // Update email log with retry
              let updateSuccess = false
              let updateRetries = 3
              while (updateRetries > 0 && !updateSuccess) {
                try {
                  await prisma.emailLog.update({
                    where: { id: emailLog.id },
                    data: {
                      status: 'sent',
                      sentAt: new Date(),
                    },
                  })
                  updateSuccess = true
                } catch (error: any) {
                  updateRetries--
                  if (updateRetries === 0) {
                    console.error(`Failed to update email log after retries:`, error)
                    // Continue anyway - email was sent successfully
                  } else {
                    await new Promise((resolve) => setTimeout(resolve, 500))
                  }
                }
              }
              
              sent++
              emailSent = true
              
              // Show progress
              const elapsed = Math.round((Date.now() - startTime) / 1000)
              const rate = sent / (elapsed / 60) // emails per minute
              console.log(`✅ [${currentIndex}/${totalLeads}] (${progress}%) Sent to ${lead.email} | Total: ${sent} sent, ${failed} failed | Rate: ${rate.toFixed(1)}/min`)

              // Schedule follow-ups if configured (with error handling)
              try {
                if (campaign.followUp1Days && campaign.followUp1Subject && campaign.followUp1Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup1',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp1Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch((err) => {
                    console.warn(`Failed to create followup1 for ${lead.email}:`, err.message)
                  })
                }

                if (campaign.followUp2Days && campaign.followUp2Subject && campaign.followUp2Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup2',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp2Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch((err) => {
                    console.warn(`Failed to create followup2 for ${lead.email}:`, err.message)
                  })
                }

                if (campaign.followUp3Days && campaign.followUp3Subject && campaign.followUp3Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup3',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp3Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch((err) => {
                    console.warn(`Failed to create followup3 for ${lead.email}:`, err.message)
                  })
                }

                if (campaign.followUp4Days && campaign.followUp4Subject && campaign.followUp4Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup4',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp4Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch((err) => {
                    console.warn(`Failed to create followup4 for ${lead.email}:`, err.message)
                  })
                }
              } catch (error: any) {
                // Non-critical error - email was sent, follow-up scheduling can fail
                console.warn(`Failed to schedule follow-ups for ${lead.email}:`, error.message)
              }
            } else {
              // Check if error is retryable (rate limit, temporary connection issues)
              const errorMsg = result.error || 'Unknown error'
              const isRetryable = 
                errorMsg.includes('rate limit') ||
                errorMsg.includes('timeout') ||
                errorMsg.includes('connection') ||
                errorMsg.includes('temporary') ||
                errorMsg.includes('ECONNRESET') ||
                errorMsg.includes('ETIMEDOUT')

              if (isRetryable && retryCount < MAX_RETRIES) {
                retryCount++
                console.log(`⚠️  [${currentIndex}/${totalLeads}] Retry ${retryCount}/${MAX_RETRIES} for ${lead.email}: ${errorMsg}`)
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * retryCount)) // Exponential backoff
                continue // Retry
              } else {
                // Permanent failure or max retries reached
                console.error(`❌ [${currentIndex}/${totalLeads}] Failed: ${lead.email} - ${errorMsg}`)
                // Update email log with retry
                let updateSuccess = false
                let updateRetries = 3
                while (updateRetries > 0 && !updateSuccess) {
                  try {
                    await prisma.emailLog.update({
                      where: { id: emailLog.id },
                      data: {
                        status: 'failed',
                        errorMessage: errorMsg,
                      },
                    })
                    updateSuccess = true
                  } catch (error: any) {
                    updateRetries--
                    if (updateRetries === 0) {
                      console.warn(`Failed to update failed status after retries:`, error.message)
                    } else {
                      await new Promise((resolve) => setTimeout(resolve, 500))
                    }
                  }
                }
                failed++
                emailSent = true // Stop retrying
              }
            }
          } catch (error: any) {
            const errorMsg = error.message || 'Unknown error'
            const isRetryable = 
              errorMsg.includes('timeout') ||
              errorMsg.includes('connection') ||
              errorMsg.includes('ECONNRESET') ||
              errorMsg.includes('ETIMEDOUT')

            if (isRetryable && retryCount < MAX_RETRIES) {
              retryCount++
              console.log(`⚠️  [${currentIndex}/${totalLeads}] Exception retry ${retryCount}/${MAX_RETRIES} for ${lead.email}: ${errorMsg}`)
              await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * retryCount))
              continue // Retry
            } else {
              console.error(`❌ [${currentIndex}/${totalLeads}] Exception failed: ${lead.email} - ${errorMsg}`)
              // Update email log with retry
              let updateSuccess = false
              let updateRetries = 3
              while (updateRetries > 0 && !updateSuccess) {
                try {
                  await prisma.emailLog.update({
                    where: { id: emailLog.id },
                    data: {
                      status: 'failed',
                      errorMessage: errorMsg,
                    },
                  })
                  updateSuccess = true
                } catch (updateError: any) {
                  updateRetries--
                  if (updateRetries === 0) {
                    console.warn(`Failed to update exception status after retries:`, updateError.message)
                  } else {
                    await new Promise((resolve) => setTimeout(resolve, 500))
                  }
                }
              }
              failed++
              emailSent = true // Stop retrying
            }
          }
        }
      }

      // Delay between batches to avoid Gmail rate limits
      if (i + BATCH_SIZE < leads.length) {
        const remainingBatches = totalBatches - batchNumber
        const estimatedTimeRemaining = Math.round((remainingBatches * (BATCH_SIZE * EMAIL_DELAY_MS + BATCH_DELAY_MS)) / 1000 / 60)
        console.log(`\n⏸️  Batch ${batchNumber} completed: ${sent} sent, ${failed} failed`)
        console.log(`   Waiting ${BATCH_DELAY_MS / 1000}s before next batch... (${remainingBatches} batches remaining, ~${estimatedTimeRemaining} min)`)
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000 / 60)
    console.log(`\n${'='.repeat(80)}`)
    console.log(`✅ Campaign sending completed!`)
    console.log(`   Total sent: ${sent}`)
    console.log(`   Total failed: ${failed}`)
    console.log(`   Success rate: ${((sent / totalLeads) * 100).toFixed(2)}%`)
    console.log(`   Total time: ${totalTime} minutes`)
    console.log(`   Average rate: ${(sent / (totalTime || 1)).toFixed(1)} emails/minute`)
    console.log(`${'='.repeat(80)}\n`)

    // Update campaign status to 'active' to allow daily sending (not 'completed')
    // Status will remain 'active' so it can be sent daily
    const finalStatus = sent > 0 ? 'active' : 'draft'
    await prisma.campaign.update({
      where: { id },
      data: { status: finalStatus },
    })

    // Calculate remaining quota for the day (campaign emails only)
    const finalEmailsSentToday = emailsSentToday + sent
    const remainingQuotaAfter = DAILY_EMAIL_LIMIT - finalEmailsSentToday

    return NextResponse.json({
      message: `Campaign sent successfully`,
      sent,
      failed,
      total: leads.length,
      dailyStats: {
        campaignEmailsSentToday: finalEmailsSentToday,
        dailyLimit: DAILY_EMAIL_LIMIT,
        remainingQuota: remainingQuotaAfter,
        note: 'Follow-up emails are sent separately and do not count towards the daily limit',
      },
      note: allMatchingLeads.length > leads.length
        ? `${allMatchingLeads.length - leads.length} leads were skipped (already received email from this campaign)`
        : `Campaign is now active and can be sent daily. ${remainingQuotaAfter} campaign emails remaining in today's quota. Follow-ups will be sent separately.`,
    })
  } catch (error: any) {
    console.error('Error sending campaign:', error)

    // Update campaign status on error
    try {
      const { id } = await params
      await prisma.campaign.update({
        where: { id },
        data: { status: 'draft' },
      })
    } catch (updateError) {
      // Ignore update errors if campaign doesn't exist
      console.error('Failed to update campaign status:', updateError)
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 500 }
    )
  }
}

