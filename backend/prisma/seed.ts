import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error("SEED_ADMIN_PASSWORD is required");

  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);
  const id = crypto.randomUUID();

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id,
      name: "Admin",
      email,
      emailVerified: true,
      role: Role.admin,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: id,
          providerId: "credential",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  });

  console.log(`Seeded admin: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
