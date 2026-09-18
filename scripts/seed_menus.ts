import { PrismaService } from '../src/prisma/prisma.service.js';

const prisma = new PrismaService();

const menus = [
  { id: '11111111-1111-1111-1111-111111111111', label: 'Home', route: '/', icon: 'Home', parent_id: null, sequence: 1 },
  { id: '22222222-2222-2222-2222-222222222222', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', parent_id: null, sequence: 2 },
  { id: '33333333-3333-3333-3333-333333333333', label: 'Settings', route: '/settings', icon: 'Settings', parent_id: null, sequence: 3 },
  { id: '44444444-4444-4444-4444-444444444444', label: 'Admin Panel', route: null, icon: 'Shield', parent_id: null, sequence: 4 },
  { id: '55555555-5555-5555-5555-555555555555', label: 'Menu', route: '/admin/menus', icon: 'Menu', parent_id: '44444444-4444-4444-4444-444444444444', sequence: 1 },
  { id: '66666666-6666-6666-6666-666666666666', label: 'Role & Privilege', route: '/admin/roles', icon: 'Key', parent_id: '44444444-4444-4444-4444-444444444444', sequence: 2 },
  { id: '77777777-7777-7777-7777-777777777777', label: 'User', route: '/admin/users', icon: 'Users', parent_id: '44444444-4444-4444-4444-444444444444', sequence: 3 },
];

async function main() {
  console.log('Upserting menus...');
  
  for (const menu of menus) {
    await prisma.menus.upsert({
      where: { id: menu.id },
      update: menu,
      create: menu,
    });
  }

  console.log('Menus successfully upserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
