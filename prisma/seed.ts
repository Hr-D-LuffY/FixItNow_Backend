import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma";
import { env } from "../src/config/env";

async function main() {
  const adminEmail = env.adminEmail;
  const adminPassword = env.adminPassword;

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log(`Admin user already exists (${adminEmail}), skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: "FixItNow Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin user created:");
  console.log(`  email:    ${adminEmail}`);
  console.log(`  password: ${adminPassword}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0); 
  });