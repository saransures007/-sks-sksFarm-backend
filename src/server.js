require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');
const fs = require('fs');

console.log("starting app")
// Function to log the directory structure
async function logDirectoryStructure (dirPath, indent = '') {
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      console.log(`${indent}- ${file}`);
      if (fs.statSync(fullPath).isDirectory()) {
        logDirectoryStructure(fullPath, `${indent}  `); // Recursive call for subdirectories
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}: ${error.message}`);
  }
};






// Check Node.js version
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your Node.js version to 20 or greater. 👌');
  process.exit();
}

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const dbUri = process.env.DATABASE;

// Function to load models after connecting to MongoDB
async function loadModels() {
  const modelFiles = globSync('./src/models/**/*.js');
  console.log('Registering models:', modelFiles);

  modelFiles.forEach(filePath => {
    require(path.resolve(filePath));  // Register each model
  });

  console.log('✅ All models registered.');
}

// Start the Express app
function startApp() {
  const app = require('./app');
  app.set('port', process.env.PORT || 8888);

  const server = app.listen(app.get('port'), () => {
    console.log(`🚀 Express running → PORT: ${server.address().port}`);
  });
}

// Connect to MongoDB, then register models, and finally start the app
async function initializeApp() {
  try {

    // Call this function at the start of your script
    console.log(`Checking models directory at: ${path.join(__dirname, './')}`);
    await logDirectoryStructure(path.join(__dirname, './')); 
     console.log('✔️ directory Loadeded successfully!');
    // 1. Connect to MongoDB
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✔️ MongoDB connected successfully!');

    // 2. Register models after successful DB connection
    await loadModels();

    // 3. Start the Express server after models are loaded
    startApp();
  } catch (err) {
    console.error('❌ Initialization failed:', err);
    process.exit(1);  // Exit on failure
  }
}

// Start the initialization process
initializeApp();
