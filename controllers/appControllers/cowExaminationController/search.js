const mongoose = require('mongoose');

const search = async (CowMilkProductionModel, CowModel, req, res) => {
  const { searchValue } = req.query;

  // Define criteria for searching in cowMilkProduction
  const criteria = {};

  try {
    // If searchValue is provided, search for matching cow by id, earTagNumber, or rfidKey
    let cowCriteria = {};
    if (searchValue) {
      cowCriteria = {
        $or: [
          { id: { $regex: new RegExp(`^${searchValue}`, 'i') } },  // Search by cow id starting with searchValue
          { earTagNumber: { $regex: new RegExp(`^${searchValue}`, 'i') } },  // Search by ear tag number starting with searchValue
          { rfidKey: { $regex: new RegExp(`^${searchValue}`, 'i') } }  // Search by RFID key starting with searchValue
        ]
      };
    }

    console.log("cowCriteria", cowCriteria);

    // Find cows matching the search criteria
    const matchingCows = await CowModel.find(cowCriteria).select('id earTagNumber rfidKey');
    
    // If matching cows are found, use their ids to filter the milk production records
    if (matchingCows.length > 0) {
      criteria.cowId = { $in: matchingCows.map(cow => cow._id) };
    } else {
      return res.status(404).json({
        success: false,
        message: 'No cows found matching the search criteria.'
      });
    }

    // Find the milk production records matching the criteria, and populate cow details
    const result = await CowMilkProductionModel.find(criteria)
      .populate({
        path: 'cowId', 
        select: 'id earTagNumber rfidKey', // Select only these fields from the cow model
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
