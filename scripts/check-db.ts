import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  });

  console.log("=== DB DUMP ===");
  users.forEach(u => {
    console.log(`User ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`);
    console.log("  Accounts:");
    if (u.accounts.length === 0) console.log("    None");
    u.accounts.forEach(a => {
      console.log(`    - Provider: ${a.provider} | ProviderAccountId: ${a.providerAccountId}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
