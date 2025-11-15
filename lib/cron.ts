import cron from 'node-cron'

/**
 * Sets up cron job to process follow-up emails
 * Runs every hour
 */
export function setupCronJob() {
  // Run every hour at minute 0
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
      console.error('Error in cron job:', error)
    }
  })

  console.log('Cron job scheduled: Follow-up emails will be processed every hour')
}


