import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  brand: z.string().min(1),
  price: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  cpu: z.string().nullable(),
  ram: z.string().nullable(),
  storage: z.string().nullable(),
  gpu: z.string().nullable(),
  screen: z.string().nullable(),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
});

const productsSchema = z.array(productSchema);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const filePath = path.join(process.cwd(), "data", "laptops.json");
  const fileContent = await readFile(filePath, "utf8");
  const products = productsSchema.parse(JSON.parse(fileContent));

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: product,
      create: product,
    });
  }

  console.log(`Imported ${products.length} products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
