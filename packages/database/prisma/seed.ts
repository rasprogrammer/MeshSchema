import { prisma } from "../src/prisma";
import { starterTemplates } from "./seed-data/starterTemplates";

async function main() {
  for (const template of starterTemplates) {
    const existing = await prisma.starterTemplateSchema.findFirst({ where: { name: template.name } });

    if (existing) {
      await prisma.starterTemplateSchema.update({ where: { id: existing.id }, data: template });
    } else {
      await prisma.starterTemplateSchema.create({ data: template });
    }
  }

  console.log(`Seeded ${starterTemplates.length} starter templates.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
