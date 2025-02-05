require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
mongoose.connect(process.env.PROD_DATABASE);

async function deleteData() {
  const admin = require('../models/admin');
  const adminPassword = require('../models/adminPassword');
  const setting = require('../models/setting');


  const cowExamination = require('../models/cowExamination');
  await cowExamination.deleteMany();
  console.log('👍 cowExamination Deleted. To setup demo cowExamination data, run\n\n\t npm run setup\n\n');
   

  const cowExpense = require('../models/cowExpense');
  await cowExpense.deleteMany();
  console.log('👍 cowExpense Deleted. To setup demo cowExpense data, run\n\n\t npm run setup\n\n');
   

  const totalMilkProduction = require('../models/totalMilkProduction');
  await totalMilkProduction.deleteMany();
  console.log('👍 totalMilkProduction Deleted. To setup demo totalMilkProduction data, run\n\n\t npm run setup\n\n');
   
  const milk = require('../models/cowMilkProduction');
  await milk.deleteMany();
  console.log('👍 milk Deleted. To setup demo milk data, run\n\n\t npm run setup\n\n');

  const cow = require('../models/cow');
  await cow.deleteMany();
  console.log('👍 cow. To setup demo cow data, run\n\n\t npm run setup\n\n');

  await admin.deleteMany();
  await adminPassword.deleteMany();
  console.log('👍 admin Deleted. To setup demo admin data, run\n\n\t npm run setup\n\n');
  await setting.deleteMany();
  console.log('👍 setting Deleted. To setup setting data, run\n\n\t npm run setup\n\n');

  process.exit();
}

deleteData();
