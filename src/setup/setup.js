require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE)
  .then(() => {
    console.log('MongoDB connection established');
    setupApp(); // Call setupApp after connection is established
  })
  .catch(e => {
    console.error('MongoDB connection error:', e);
    process.exit(1);
  });

async function setupApp() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const newAdminPassword = new AdminPassword();
    const salt = uniqueId();
    const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

    const demoAdmin = {
      email: 'admin@demo.com',
      name: 'IDURAR',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    const result = await new Admin(demoAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: result._id,
    };
    await new AdminPassword(AdminPasswordData).save();

    console.log('👍 Admin created : Done!');

      const Setting = require('../models/coreModels/Setting');

      // Debugging: Check if the Setting model is loaded correctly
      console.log('Setting model:', Setting);

    // new settings sksFarm
    const FarmsettingFiles = [];
    const FarmsettingsFiles = globSync('./src/setup/sksFarmSettings/**/*.json');

    for (const filePath of FarmsettingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      FarmsettingFiles.push(...file);
    }

    await Setting.insertMany(FarmsettingFiles);
    console.log('👍 Farm Settings created : Done!');

    console.log('🥳 Setup completed : Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}
