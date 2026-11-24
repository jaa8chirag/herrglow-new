import { prisma } from "../src/index.js";
import fs from "node:fs";
import path from "node:path";

const webPublic = path.resolve(process.cwd(), "../../apps/web/public");

async function check() {
  console.log("=== CHECKING ALL MEDIA IN DATABASE VS DISK ===");
  console.log(`Public dir: ${webPublic}`);

  // 1. Services
  const services = await prisma.service.findMany({
    select: { slug: true, title: true, image: true, isPackage: true },
  });
  console.log(`Total Services: ${services.length}`);
  const missingSvc = services.filter(
    (s) => !s.image || !fs.existsSync(path.join(webPublic, s.image.replace(/^\//, "")))
  );
  console.log(`Services with missing or broken image on disk: ${missingSvc.length}`);
  if (missingSvc.length) console.log(missingSvc.slice(0, 10));

  // 2. Packages
  const packages = await prisma.package.findMany({
    select: { slug: true, title: true, image: true },
  });
  console.log(`Total Packages: ${packages.length}`);
  const missingPkg = packages.filter(
    (p) => !p.image || !fs.existsSync(path.join(webPublic, p.image.replace(/^\//, "")))
  );
  console.log(`Packages with missing/broken image: ${missingPkg.length}`);
  if (missingPkg.length) console.log(missingPkg);

  // 3. Pros
  const pros = await prisma.pro.findMany({
    select: { id: true, name: true, photo: true },
  });
  console.log(`Total Pros: ${pros.length}`);
  const missingPros = pros.filter(
    (p) => !p.photo || !fs.existsSync(path.join(webPublic, p.photo.replace(/^\//, "")))
  );
  console.log(`Pros with missing/broken photo: ${missingPros.length}`);
  if (missingPros.length) console.log(missingPros);

  // 4. Blogs
  const blogs = await prisma.blog.findMany({
    select: { slug: true, title: true, image: true },
  });
  console.log(`Total Blogs: ${blogs.length}`);
  for (const b of blogs) {
    const exists = b.image
      ? fs.existsSync(path.join(webPublic, b.image.replace(/^\//, "")))
      : false;
    console.log(`  Blog "${b.slug}": image="${b.image}" exists=${exists}`);
  }

  // 5. Gallery Items (for Looks / Before & After)
  const gallery = await prisma.galleryItem.findMany({
    select: { id: true, title: true, mediaPath: true, mediaType: true },
  });
  console.log(`Total Gallery Items: ${gallery.length}`);
  for (const g of gallery) {
    const exists = g.mediaPath
      ? fs.existsSync(path.join(webPublic, g.mediaPath.replace(/^\//, "")))
      : false;
    console.log(`  Gallery "${g.title}": path="${g.mediaPath}" exists=${exists}`);
  }

  // 6. Testimonials
  const testimonials = await prisma.testimonial.findMany({
    select: { id: true, name: true, photo: true },
  });
  console.log(`Total Testimonials: ${testimonials.length}`);
  const withPhoto = testimonials.filter((t) => t.photo);
  console.log(`Testimonials with photo: ${withPhoto.length} out of ${testimonials.length}`);
  for (const t of testimonials) {
    const exists = t.photo
      ? fs.existsSync(path.join(webPublic, t.photo.replace(/^\//, "")))
      : false;
    console.log(`  Testimonial "${t.name}": photo="${t.photo}" exists=${exists}`);
  }

  // 7. SiteSettings (site_logo)
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["site_logo", "site_logo_dark"] } },
  });
  console.log("Logo settings:", settings);
}

check().finally(() => prisma.$disconnect());
