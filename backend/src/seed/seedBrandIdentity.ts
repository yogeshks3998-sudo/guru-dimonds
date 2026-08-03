import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

const BRAND_FOOTER = {
  aboutText:
    'Guru Diamonds is a trusted gemstone and precious stone destination in Mysuru, offering genuine diamonds, pearls, rubies, emeralds, sapphires, coral, crystals, silver jewellery, and personalized customer assistance.',
  phone: '+91 78991 25449',
  email: 'infi@gurudimonds.in',
  address: 'No. 1108, 1st Cross, Kurubageri, Lashkar Mohalla, Mysuru - 570001, Karnataka, India',
  whatsapp: '+91 78991 25449',
};

const adminUsers = [
  { id: 'adm-super', name: 'Guru Diamonds Super Admin', email: 'superadmin@gurudimonds.in', role: 'SUPER_ADMIN' },
  { id: 'adm-owner', name: 'Guru Diamonds Owner', email: 'owner@gurudimonds.in', role: 'OWNER' },
  { id: 'adm-product', name: 'Product Manager', email: 'product.manager@gurudimonds.in', role: 'PRODUCT_MANAGER' },
  { id: 'adm-inventory', name: 'Inventory Manager', email: 'inventory.manager@gurudimonds.in', role: 'INVENTORY_MANAGER' },
  { id: 'adm-order', name: 'Order Manager', email: 'order.manager@gurudimonds.in', role: 'ORDER_MANAGER' },
  { id: 'adm-content', name: 'Content Manager', email: 'content.manager@gurudimonds.in', role: 'CONTENT_MANAGER' },
  { id: 'adm-finance', name: 'Finance Manager', email: 'finance.manager@gurudimonds.in', role: 'FINANCE' },
  { id: 'adm-staff', name: 'Store Staff', email: 'staff@gurudimonds.in', role: 'STAFF' },
];

async function seedBrandIdentity() {
  const passwordHash = await bcrypt.hash('admin123', 12);
  const avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';

  for (const admin of adminUsers) {
    await prisma.adminUser.upsert({
      where: { id: admin.id },
      create: {
        ...admin,
        passwordHash,
        avatar,
        active: true,
        lastLogin: null,
      },
      update: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        passwordHash,
        active: true,
      },
    });
  }

  const existingCMS = await prisma.cMSContent.findUnique({ where: { id: 'default' } });
  if (existingCMS) {
    await prisma.cMSContent.update({
      where: { id: 'default' },
      data: {
        footer: {
          ...((existingCMS.footer as Record<string, unknown>) || {}),
          ...BRAND_FOOTER,
        },
      },
    });
  }

  console.log('Guru Diamonds brand identity updated in PostgreSQL.');
}

seedBrandIdentity()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
