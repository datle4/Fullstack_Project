import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const seedProductSlugs = [
  "macbook-air-13-m3-8gb-256gb",
  "dell-xps-13-core-ultra-7-16gb-512gb",
  "asus-rog-strix-g16-i7-rtx-4060",
  "lenovo-thinkpad-x1-carbon-gen-12",
];

async function main() {
  const result = await prisma.product.updateMany({
    where: {
      slug: {
        in: seedProductSlugs,
      },
    },
    data: {
      isActive: false,
    },
  });

  console.log(`Archived ${result.count} seed products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });