import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

async function seedBrandAdmins() {
  const passwordHash = await bcrypt.hash('admin123', 12);
  const avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
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

  console.log('Guru Diamonds admin credentials updated.');
}

seedBrandAdmins()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
