const createCRUDController = require('../middlewaresControllers/createCRUDController');
const { routesList } = require('../../modelList/utils');

const { globSync } = require('glob');
const path = require('path');

console.log("routesList:", routesList)
const pattern = './controllers/appControllers/*/**/';
const controllerDirectories = globSync(pattern).map((filePath) => {
  return path.basename(filePath);
});

const appControllers = () => {
  const controllers = {};
  const hasCustomControllers = [];

  controllerDirectories.forEach((controllerName) => {
    try {
      const customController = require('../../controllers/appControllers/' + controllerName);

      if (customController) {
        hasCustomControllers.push(controllerName);
        controllers[controllerName] = customController;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  });

  routesList.forEach(({ modelName, controllerName }) => {
    if (!hasCustomControllers.includes(controllerName)) {
      controllers[controllerName] = createCRUDController(modelName);
    }
  });

  return controllers;
};

module.exports = appControllers();
