import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { accounts: true },
  });

  const adminUser = users.find(u => u.email === 'rajondeyofficial@gmail.com');
  if (adminUser && adminUser.accounts.length > 1) {
    // We assume the first account is the original admin account, and the second is the newly linked one.
    // Let's delete the one that was added most recently.
    // We don't have createdAt on the Account model, so we'll just delete the second one
    const secondAccount = adminUser.accounts[1];
    
    await prisma.account.delete({
      where: {
        provider_providerAccountId: {
          provider: secondAccount.provider,
          providerAccountId: secondAccount.providerAccountId
        }
      }
    });

    console.log(`Deleted linked account: ${secondAccount.providerAccountId}`);
  } else {
    console.log("No linked accounts found to delete.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
