import { prisma } from "../src/index.js";

async function main() {
  console.log("Updating SiteSetting table with new phone and email...");

  const updates = [
    { key: "whatsapp_number", value: "9319260069" },
    { key: "contact_phone", value: "9319260069" },
    { key: "contact_email", value: "herrglow77@gmail.com" },
  ];

  for (const s of updates) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
    console.log(`Updated setting: ${s.key} -> ${s.value}`);
  }

  const all = await prisma.siteSetting.findMany();
  console.log("Current DB SiteSettings:", all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
