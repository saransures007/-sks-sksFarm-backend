require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');
const mongoose = require('mongoose');

mongoose.connect(process.env.DEV_DATABASE)
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
    const admin = require('../models/admin');
    const adminPassword = require('../models/adminPassword');
    const newAdminPassword = new adminPassword();
    const salt = uniqueId();
    const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

    const demoAdmin = {
      email: 'saransuresh1999@gmail.com',
      name: 'Saran',
      surname: 'admin',
      enabled: true,
      role: 'owner',
    };
    const result = await new admin(demoAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: result._id,
    };
    await new adminPassword(AdminPasswordData).save();

    console.log('👍 admin created : Done!');

      const setting = require('../models/setting');

      // Debugging: Check if the setting model is loaded correctly
      console.log('setting model:', setting);

    // new settings sksFarm
    const FarmsettingFiles = [];
    const FarmsettingsFiles = globSync('./setup/sksFarmSettings/**/*.json');

    for (const filePath of FarmsettingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      FarmsettingFiles.push(...file);
    }

    await setting.insertMany(FarmsettingFiles);
    console.log('👍 Farm Settings created : Done!');

    console.log('🥳 Setup completed : Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}
