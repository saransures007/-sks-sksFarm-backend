const paginatedList = async (ExpenseModel, FarmModel, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("List paginated expenses");

  const { filter, equal } = req.query;
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  // Construct the query object for farm records
  const farmQuery = {};

  if (req.query.q) {
    const regex = new RegExp(req.query.q, 'i');
    farmQuery.$or = fieldsArray.length > 0
      ? fieldsArray.map(field => ({ [field]: regex }))
      : [{ id: regex }, { farmName: regex }];
  }

  try {
    // Step 1: Find matching farms
    const matchingFarms = await FarmModel.find(farmQuery).select('_id').exec();
    const farmIds = matchingFarms.map(farm => farm._id);

    // Step 2: Construct query for expenses
    const expenseQuery = {
      ...(farmIds.length > 0 ? { farmId: { $in: farmIds } } : { farmId: null }),
    };

    // Step 3: Query expenses
    const resultsPromise = ExpenseModel.find(expenseQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Sort by createdAt descending
      .exec();

    const countPromise = ExpenseModel.countDocuments(expenseQuery);

    const [results, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    // Restructure results
    const formattedResults = results.map(result => ({
      eid: result._id,
      date: result.date,
      type: result.type,
      description: result.description,
      cost: result.cost,
      createdAt: result.createdAt,
      addedBy: result.addedBy,
      // farm field removed as no longer part of schema
    }));

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result: formattedResults,
        pagination,
        message: 'Successfully found expense records',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No expense records found',
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching expenses: ' + error.message,
    });
  }
};

module.exports = paginatedList;
