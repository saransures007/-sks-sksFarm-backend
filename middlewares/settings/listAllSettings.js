const mongoose = require('mongoose');

const Model = mongoose.model('setting');

const listAllSettings = async () => {
  try {
    //  Query the database for a list of all results
    const result = await Model.find({
      removed: false,
    }).exec();

    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

module.exports = listAllSettings;
