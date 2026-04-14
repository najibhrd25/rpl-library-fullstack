const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database di Next.js App Router...');

  // Cek apakah admin sudah ada
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log(`Admin sudah tersedia: ${existingAdmin.email}`);
    process.exit(0);
  }

  // Buat akun Admin utama
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@library.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Akun Admin berhasil dibuat!');
  console.log('-----------------------------------');
  console.log(`Email    : ${admin.email}`);
  console.log(`Password : admin123`);
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
