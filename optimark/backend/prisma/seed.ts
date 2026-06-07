import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SELLERS = [
  { name: 'TechStore TN', email: 'techstore@optimark.tn', isVerified: true },
  { name: 'Artisanat Sfax', email: 'artisanat-sfax@optimark.tn', isVerified: true },
  { name: 'Menuiserie Nabeul', email: 'menuiserie-nabeul@optimark.tn', isVerified: false },
  { name: 'Ferme Bio Sfax', email: 'ferme-bio-sfax@optimark.tn', isVerified: true },
  { name: 'SportZone TN', email: 'sportzone@optimark.tn', isVerified: true },
];

const PRODUCTS = [
  { title: 'Smartphone Samsung Galaxy A54', description: "Écran Super AMOLED 6.4\", triple caméra 50MP, batterie 5000mAh. Disponible en noir, blanc et violet.", price: 1299.99, category: 'Électronique', stock: 25, seller: 'TechStore TN', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80'] },
  { title: 'Laptop HP 15 Core i5 8Go RAM', description: 'Ordinateur portable performant pour le travail et les études, SSD 512Go, écran Full HD 15.6".', price: 2199.00, category: 'Électronique', stock: 12, seller: 'TechStore TN', images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'] },
  { title: 'Montre connectée Xiaomi Band 8', description: 'Suivi de la fréquence cardiaque, du sommeil et des activités sportives. Autonomie 14 jours.', price: 149.00, category: 'Électronique', stock: 40, seller: 'TechStore TN', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'] },
  { title: 'Robe traditionnelle brodée à la main', description: "Robe artisanale brodée à la main par des artisanes tunisiennes, tissu de qualité supérieure.", price: 189.00, category: 'Mode', stock: 8, seller: 'Artisanat Sfax', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80'] },
  { title: 'Tapis berbère fait main 200x300', description: 'Tapis berbère traditionnel tissé à la main à Kairouan, motifs authentiques, laine naturelle.', price: 780.00, category: 'Décoration', stock: 5, seller: 'Artisanat Sfax', images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80'] },
  { title: "Chaise en bois d'olivier artisanale", description: "Chaise sculptée à la main dans du bois d'olivier tunisien, finition artisanale unique.", price: 450.00, category: 'Maison', stock: 6, seller: 'Menuiserie Nabeul', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'] },
  { title: 'Tajine en céramique de Nabeul', description: 'Tajine artisanal en céramique peinte à la main, parfait pour la cuisine traditionnelle tunisienne.', price: 85.00, category: 'Maison', stock: 30, seller: 'Menuiserie Nabeul', images: ['https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80'] },
  { title: "Huile d'olive extra vierge 5L", description: 'Huile d\'olive extra vierge pressée à froid, issue de la première récolte, certifiée bio.', price: 65.00, category: 'Alimentation', stock: 100, seller: 'Ferme Bio Sfax', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80'] },
  { title: 'Nike Air Max 270 React', description: 'Baskets de sport confortables et stylées, semelle amortissante Air Max, plusieurs coloris disponibles.', price: 299.00, category: 'Sport', stock: 18, seller: 'SportZone TN', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'] },
];

async function main() {
  console.log('🌱 Seeding database...');

  const sellerMap: Record<string, string> = {};
  for (const s of SELLERS) {
    const existing = await prisma.user.findUnique({ where: { email: s.email } });
    const user = existing
      ? existing
      : await prisma.user.create({
          data: {
            name: s.name,
            email: s.email,
            password: await bcrypt.hash('password123', 10),
            role: 'SELLER',
            isVerified: s.isVerified,
          },
        });
    sellerMap[s.name] = user.id;
    console.log(`  ✓ Vendeur: ${s.name}`);
  }

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { title: p.title } });
    if (existing) {
      console.log(`  – Produit déjà présent: ${p.title}`);
      continue;
    }
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        images: p.images,
        sellerId: sellerMap[p.seller],
      },
    });
    console.log(`  ✓ Produit: ${p.title}`);
  }

  console.log('✅ Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
