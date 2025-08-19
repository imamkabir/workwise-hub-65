import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create regular users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        password: hashedPassword,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        firstName: 'Jane',
        lastName: 'Smith',
        password: hashedPassword,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@example.com',
        username: 'bobwilson',
        firstName: 'Bob',
        lastName: 'Wilson',
        password: hashedPassword,
        role: 'USER',
      },
    }),
  ]);

  // Create sample applications
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        name: 'Mobile App Development',
        description: 'Building a cross-platform mobile application',
        status: 'APPROVED',
        userId: users[0].id,
      },
    }),
    prisma.application.create({
      data: {
        name: 'Web Dashboard',
        description: 'Creating a comprehensive admin dashboard',
        status: 'IN_REVIEW',
        userId: users[0].id,
      },
    }),
    prisma.application.create({
      data: {
        name: 'API Integration',
        description: 'Integrating with third-party APIs',
        status: 'PENDING',
        userId: users[1].id,
      },
    }),
    prisma.application.create({
      data: {
        name: 'Database Migration',
        description: 'Migrating legacy database to new system',
        status: 'REJECTED',
        userId: users[2].id,
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Created:');
  console.log(`   • ${1} Super Admin`);
  console.log(`   • ${1} Admin`);
  console.log(`   • ${users.length} Users`);
  console.log(`   • ${applications.length} Applications`);
  
  console.log('\n🔑 Demo Accounts:');
  console.log('   Super Admin: superadmin@example.com / password123');
  console.log('   Admin: admin@example.com / password123');
  console.log('   User: john.doe@example.com / password123');
  console.log('   User: jane.smith@example.com / password123');
  console.log('   User: bob.wilson@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });