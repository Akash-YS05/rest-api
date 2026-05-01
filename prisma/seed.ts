import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const userEmail = "user@example.com";
  const passwordHash = await bcrypt.hash("Admin@1234", 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Platform Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      name: "Standard User",
      email: userEmail,
      passwordHash,
      role: "USER",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
