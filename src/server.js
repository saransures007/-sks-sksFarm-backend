// src/server.js
require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Ensure we are running node 20+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version to at least 20 or greater. 👌\n');
  process.exit();
}

// Import environmental variables from our .env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Register models once the connection is open
mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');

  // Import models after connection is established
  const modelsFiles = globSync('./src/models/**/*.js');
  for (const filePath of modelsFiles) {
    require(path.resolve(filePath)); // This will register all models
  }

  // Debugging: Check if the Setting model is registered
  const Setting = mongoose.model('Setting'); // Use mongoose.model to check if it's registered
  console.log('Setting model:', Setting);

  // Import and run your setup function here
  const setupApp = require('./setup/setup');
  try {
    await setupApp(); // Call the setup function after connection is established
  } catch (error) {
    console.error('Error running setup:', error);
  }

  // Start our app
  const app = require('./app');
  const PORT = process.env.PORT || 8888;
  const server = app.listen(PORT, () => {
    console.log(`Express running → On PORT : ${server.address().port}`);
  });
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (error) => {
  console.error(`MongoDB connection error: ${error.message}`);
});
