import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function seed() {
  console.log("Seeding database...");

  // 1. Create or fetch demo User
  let user = await prisma.user.findFirst({ where: { email: "demo@shriramtraders.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@shriramtraders.com",
        username: "demouser",
        password: "demo123",
      },
    });
  }

  // 2. Create Organization
  let org = await prisma.organization.findFirst({ where: { userId: user.id } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Shri Ram Timber & Saw Mill",
        gstNumber: "24AAAAA0000A1Z5",
        address: "Plot 42, GIDC Industrial Estate, Gujarat",
        bankName: "State Bank of India",
        accountNumber: "12345678901",
        ifscCode: "SBIN0001234",
        userId: user.id,
      },
    });
  }

  // 3. Create Customers
  const customerNames = ["Ramesh Wood Works", "Patel Furniture Mart", "Gujarat Timber Suppliers", "Apex Construction Supplies"];
  const customerList = [];

  for (const name of customerNames) {
    let customer = await prisma.customer.findFirst({ where: { name, userId: user.id } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name,
          gstNumber: `24${Math.floor(1000000000 + Math.random() * 9000000000)}Z1`,
          address: "Sector 15, Industrial Zone",
          userId: user.id,
        },
      });
    }
    customerList.push(customer);
  }

  // 4. Create Invoices (CREDIT - Purchase / DEBIT - Sales)
  const sampleItemsList = [
    [{ name: "WoodenSize", hsnCode: "4407", quantity: 15.5, price: 9096, unit: "CBM", amount: 140988 }],
    [{ name: "FireWood", hsnCode: "4401", quantity: 500, price: 12, unit: "KG", amount: 6000 }],
    [{ name: "Limdo", hsnCode: "4407", quantity: 8.2, price: 11200, unit: "CBM", amount: 91840 }],
    [{ name: "WoodenDust", hsnCode: "4401", quantity: 1200, price: 5, unit: "KG", amount: 6000 }],
  ];

  for (let i = 0; i < 8; i++) {
    const isCredit = i % 2 === 0;
    const items = sampleItemsList[i % sampleItemsList.length];
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = Math.round(totalAmount * 0.18);
    const grandTotal = totalAmount + gstAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-00${i + 1}`,
        organizationId: org.id,
        userId: user.id,
        customerId: customerList[i % customerList.length].id,
        invoiceType: isCredit ? "CREDIT" : "DEBIT",
        items: items,
        totalAmount,
        gstPercentage: 18,
        gstAmount,
        grandTotal,
        vehicalNumber: "GJ01XX1234",
        status: i % 3 === 0 ? "COMPLETED" : "PENDING",
      },
    });

    if (invoice.status === "COMPLETED") {
      await prisma.paymentLog.create({
        data: {
          invoiceId: invoice.id,
          amount: String(grandTotal),
          note: "Full Payment Received",
          paymentDate: new Date(),
        },
      });
    }
  }

  console.log("Seeding finished successfully!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
