require('dotenv').config();

const { User, ROLES } = require('../models/User');


const seedAdmin = async () => {

  try {
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('ℹ️  Admin already exists. Skipping seed.');
      return;
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: ROLES.ADMIN,
      isActive: true,
    });

    console.log('✅ Admin user seeded successfully!');
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
};

module.exports = seedAdmin;
