const serverless = require('serverless-http');
const mongoose = require('mongoose');
require('module-alias/register');
const path = require('path');
const fs = require('fs');
/////----------------------------------

// Function to log the directory structure
const logDirectoryStructure = (dirPath, indent = '') => {
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



// Call this function at the start of your script
console.log(`Checking models directory at: ${path.join(__dirname, '../../src')}`);
logDirectoryStructure(path.join(__dirname, '../../'));

////-------------------------------------------
let isConnected; // Track the connection state

// Function to connect to MongoDB
const connectToDatabase = async () => {
  if (isConnected) {
    return require('../../src/app'); // Return app if already connected
  }

  try {
    // Connect to MongoDB (no deprecated options)
    await mongoose.connect(process.env.DATABASE);
    isConnected = true; // Set connected status
    console.log('Connected to MongoDB');

    // Function to register all models in a given directory
    const registerModels = (dir) => {
      fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Recursively register models in subdirectories
          registerModels(filePath);
        } else if (file.endsWith('.js')) {
          try {
            require(filePath); // Register each model
            console.log(`Model registered: ${filePath}`);
          } catch (error) {
            console.error(`Error loading model from ${filePath}:`, error.message);
          }
        }
      });
    };

    // Register models from both coreModels and sksModels directories
    registerModels(path.join(__dirname, '../../src/models/coreModels'));
    registerModels(path.join(__dirname, '../../src/models/sksModels'));
    registerModels(path.join(__dirname, '../../src/models/utils'));

    // Debugging: Check if a specific model is registered
    try {
      const setting = mongoose.model('setting'); // Ensure the model is defined
      console.log('setting model:', setting);
    } catch (error) {
      console.error('Error: setting model is not registered:', error.message);
    }

    // Now we can import the app since the connection is established
    const app = require('../../src/app');
    return app; // Return the app to be used in serverless handler

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw new Error('MongoDB connection failed');
  }
};

// Export the handler using the promise
const appPromise = connectToDatabase()
  .then(app => serverless(app))
  .catch(error => {
    console.error(`Initial connection error: ${error.message}`);
    // Provide a fallback function to handle requests in case of failure
    return async (event, context) => {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to connect to database' }),
      };
    };
  });

module.exports.handler = async (event, context) => {
  const handler = await appPromise;
  return handler(event, context);
};
