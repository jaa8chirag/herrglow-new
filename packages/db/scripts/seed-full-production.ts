import { prisma, Status } from '../src/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Seeding full 105-service production catalogue to database...');
  const jsonPath = path.join(__dirname, 'full-production-seed.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const { categories, services } = data;

  const catMap = new Map<string, string>();

  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        sort: c.sort,
        shortDescription: c.shortDescription,
        seoDescription: c.seoDescription,
        heroBadge: c.heroBadge,
        heroTitle: c.heroTitle,
        heroSubtitle: c.heroSubtitle,
      },
      create: {
        slug: c.slug,
        name: c.name,
        sort: c.sort,
        shortDescription: c.shortDescription,
        seoDescription: c.seoDescription,
        heroBadge: c.heroBadge,
        heroTitle: c.heroTitle,
        heroSubtitle: c.heroSubtitle,
      },
    });
    catMap.set(c.slug, cat.id);
  }

  console.log(`Synced ${categories.length} categories.`);

  let inserted = 0;
  for (const s of services) {
    const categoryId = catMap.get(s.category.slug);
    if (!categoryId) {
      console.warn(`Category not found for service ${s.slug}: ${s.category.slug}`);
      continue;
    }

    const srv = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        categoryId,
        price: s.price,
        offerPrice: s.offerPrice,
        priceLabel: s.priceLabel,
        duration: s.duration,
        shortDescription: s.shortDescription,
        seoDescription: s.seoDescription,
        features: s.features,
        image: s.image,
        imageAlt: s.imageAlt,
        isPackage: s.isPackage,
        status: (s.status as Status) || Status.ACTIVE,
        sort: s.sort ?? 0,
      },
      create: {
        slug: s.slug,
        title: s.title,
        categoryId,
        price: s.price,
        offerPrice: s.offerPrice,
        priceLabel: s.priceLabel,
        duration: s.duration,
        shortDescription: s.shortDescription,
        seoDescription: s.seoDescription,
        features: s.features,
        image: s.image,
        imageAlt: s.imageAlt,
        isPackage: s.isPackage,
        status: (s.status as Status) || Status.ACTIVE,
        sort: s.sort ?? 0,
      },
    });

    if (s.variants && s.variants.length > 0) {
      for (const v of s.variants) {
        await prisma.serviceVariant.upsert({
          where: { serviceId_name: { serviceId: srv.id, name: v.name } },
          update: {
            price: v.price,
            offerPrice: v.offerPrice,
            description: v.description,
            sortOrder: v.sortOrder ?? v.sort ?? 0,
          },
          create: {
            serviceId: srv.id,
            name: v.name,
            price: v.price,
            offerPrice: v.offerPrice,
            description: v.description,
            sortOrder: v.sortOrder ?? v.sort ?? 0,
          },
        });
      }
    }

    inserted++;
  }

  console.log(`Synced ${inserted} services with variants successfully!`);
}

main().catch(console.error).finally(() => process.exit(0));
