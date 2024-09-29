require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function deleteData() {
  const Admin = require('../models/utils/Admin');
  const AdminPassword = require('../models/utils/AdminPassword');
  const Setting = require('../models/utils/Setting');

  const TotalMilkProduction = require('../models/utils/TotalMilkProduction');
  await TotalMilkProduction.deleteMany();
  console.log('👍 TotalMilkProduction Deleted. To setup demo TotalMilkProduction data, run\n\n\t npm run setup\n\n');
   
  const milk = require('../models/utils/CowMilkProduction');
  await milk.deleteMany();
  console.log('👍 milk Deleted. To setup demo milk data, run\n\n\t npm run setup\n\n');

  const Cow = require('../models/utils/Cow');
  await Cow.deleteMany();
  console.log('👍 Cow. To setup demo Cow data, run\n\n\t npm run setup\n\n');

  await Admin.deleteMany();
  await AdminPassword.deleteMany();
  console.log('👍 Admin Deleted. To setup demo admin data, run\n\n\t npm run setup\n\n');
  await Setting.deleteMany();
  console.log('👍 Setting Deleted. To setup Setting data, run\n\n\t npm run setup\n\n');

  process.exit();
}

deleteData();
