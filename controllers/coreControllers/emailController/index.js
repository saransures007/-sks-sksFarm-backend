const createCRUDController = require('../../middlewaresControllers/createCRUDController');
const crudController = createCRUDController('email');

const emailMethods = {
  create:crudController.create,
  read: crudController.read,
  update: crudController.update,
  list: crudController.list,
  listAll: crudController.listAll,
  filter: crudController.filter,
  search: crudController.search,
};

module.exports = emailMethods;
