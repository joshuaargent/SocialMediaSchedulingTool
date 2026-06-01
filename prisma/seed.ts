import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default organization
  const org = await prisma.organization.create({
    data: {
      id: 'default-org',
      name: 'My Content Hub',
      plan: 'free',
      settings: {},
      defaultTimezone: 'America/New_York',
    },
  });

  // Create default user
  const user = await prisma.user.create({
    data: {
      id: 'default-user',
      organizationId: org.id,
      email: 'user@contenthub.local',
      name: 'Content Creator',
      role: 'owner',
      settings: {},
      timezone: 'America/New_York',
    },
  });

  // Create default cooldown settings for all platforms
  const platforms = ['tiktok', 'facebook', 'instagram', 'youtube'];
  for (const platform of platforms) {
    await prisma.cooldownSettings.create({
      data: {
        organizationId: org.id,
        platform,
        minMinutes: platform === 'facebook' ? 30 : platform === 'youtube' ? 120 : 60,
      },
    });
  }

  // Create default algorithm health entries
  for (const platform of platforms) {
    await prisma.algorithmHealth.create({
      data: {
        organizationId: org.id,
        platform,
        shadowbanRisk: 'low',
        postingFrequencyScore: 100,
        engagementScore: 50,
        contentDiversityScore: 50,
        issues: [],
      },
    });
  }

  console.log('Seed completed!');
  console.log(`Created organization: ${org.id}`);
  console.log(`Created user: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });