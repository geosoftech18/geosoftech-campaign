import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.lead.count()
  console.log(`\n✅ Total unique leads in database: ${count.toLocaleString()}\n`)
  
  // Get some stats
  const byCity = await prisma.lead.groupBy({
    by: ['city'],
    _count: true,
    orderBy: {
      _count: {
        city: 'desc'
      }
    },
    take: 5
  })
  
  const byState = await prisma.lead.groupBy({
    by: ['state'],
    _count: true,
    orderBy: {
      _count: {
        state: 'desc'
      }
    },
    take: 5
  })
  
  console.log('Top 5 Cities:')
  byCity.forEach(item => {
    if (item.city) {
      console.log(`  - ${item.city}: ${item._count}`)
    }
  })
  
  console.log('\nTop 5 States:')
  byState.forEach(item => {
    if (item.state) {
      console.log(`  - ${item.state}: ${item._count}`)
    }
  })
  
  await prisma.$disconnect()
}

main()


