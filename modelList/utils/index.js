const { basename, extname } = require('path');
const { globSync } = require('glob');

// Define the pattern for model files
const pattern = './models/**/*.js';

// Get all model files while excluding index.js
const appModelsFiles = globSync(pattern).filter(filePath => basename(filePath) !== 'index.js');

// Extract model names from all model files
const modelsFiles = appModelsFiles.map((filePath) => {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  return fileNameWithoutExtension;
});

console.log("modelsFiles", modelsFiles)

const controllersList = [];
const appModelsList = [];
const sksModelsList = [];
const entityList = [];
const routesList = [];

// Process appModelsFiles
for (const filePath of appModelsFiles) {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  const firstChar = fileNameWithoutExtension.charAt(0);
  const modelName = fileNameWithoutExtension.replace(firstChar, firstChar.toLowerCase());
  const fileNameLowerCaseFirstChar = fileNameWithoutExtension.replace(
    firstChar,
    firstChar.toLowerCase()
  );
  const entity = fileNameWithoutExtension.toLowerCase();

  const controllerName = fileNameLowerCaseFirstChar + 'Controller';
  controllersList.push(controllerName);
  appModelsList.push(modelName); // Push to appModelsList
  sksModelsList.push(modelName); // Push to sksModelsList
  entityList.push(entity);

  const route = {
    entity: entity,
    modelName: modelName,
    controllerName: controllerName,
  };
  routesList.push(route);
}

// Export lists and model names
module.exports = { controllersList, appModelsList, sksModelsList, modelsFiles, entityList, routesList };
