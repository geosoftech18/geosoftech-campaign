import cron from 'node-cron'

/**
 * Sets up cron jobs for automated email sending
 * - Follow-up emails: Runs every hour
 * - Daily campaigns: Runs once per day at 9:00 AM
 */
export function setupCronJob() {
  // Run follow-up emails every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

      const response = await fetch(`${baseUrl}/api/cron/followup`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Follow-up emails processed:', data)
      } else {
        console.error('Failed to process follow-ups:', await response.text())
      }
    } catch (error) {
      console.error('Error in follow-up cron job:', error)
    }
  })

  // Run daily campaigns once per day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

      console.log('Starting daily campaign sending...')
      const response = await fetch(`${baseUrl}/api/cron/daily-campaigns`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Daily campaigns processed:', data)
      } else {
        console.error('Failed to process daily campaigns:', await response.text())
      }
    } catch (error) {
      console.error('Error in daily campaign cron job:', error)
    }
  })

  console.log('Cron jobs scheduled:')
  console.log('  - Follow-up emails: Every hour at minute 0')
  console.log('  - Daily campaigns: Every day at 9:00 AM')
}


