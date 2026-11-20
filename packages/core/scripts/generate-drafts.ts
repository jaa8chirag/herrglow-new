import { generateServiceCityDrafts } from "../src/seo/drafts";
import { prisma } from "@herrglow/db";

const r = await generateServiceCityDrafts(Number(process.argv[2] ?? 15));
console.log(`drafts generated: ${r.generated.length}`);
console.log(`skipped (<2 pros): ${r.skippedBelowThreshold.length}\n  ${r.skippedBelowThreshold.join("\n  ")}`);
console.log(`kept published: ${r.keptPublished.length}`);
await prisma.$disconnect();
