const mongoose = require('mongoose');

const search = async (FarmExpenseModel, FarmModel, req, res) => {
  const { searchValue } = req.query;

  // Define criteria for searching in farmExpense
  const criteria = {};

  try {
    // If searchValue is provided, search for matching farm by id or farmName
    let farmCriteria = {};
    if (searchValue) {
      farmCriteria = {
        $or: [
          { id: { $regex: new RegExp(`^${searchValue}`, 'i') } },  // Search by farm id starting with searchValue
          { farmName: { $regex: new RegExp(`^${searchValue}`, 'i') } }  // Search by farm name starting with searchValue
        ]
      };
    }

    console.log("farmCriteria", farmCriteria);

    // Find farms matching the search criteria
    const matchingFarms = await FarmModel.find(farmCriteria).select('id farmName');
    
    // If matching farms are found, use their ids to filter the farm expense records
    if (matchingFarms.length > 0) {
      criteria.farmId = { $in: matchingFarms.map(farm => farm._id) };
    } else {
      return res.status(404).json({
        success: false,
        message: 'No farms found matching the search criteria.'
      });
    }

    // Find the farm expense records matching the criteria, and populate farm details
    const result = await FarmExpenseModel.find(criteria)
      .populate({
        path: 'farmId', 
        select: 'id farmName', // Select only these fields from the farm model
      });

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error searching entries: ' + error.message,
    });
  }
};

module.exports = search;
