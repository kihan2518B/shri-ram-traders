const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
 

  console.log("✅ Database seeded successfully.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding data:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
