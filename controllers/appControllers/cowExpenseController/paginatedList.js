const paginatedList = async (ExpenseModel, CowModel, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("List paginated expenses");

  const { filter, equal } = req.query;
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  // Construct the query object for cow records
  const cowQuery = {};

  if (req.query.q) {
    const regex = new RegExp(req.query.q, 'i');
    cowQuery.$or = fieldsArray.length > 0
      ? fieldsArray.map(field => ({ [field]: regex }))
      : [{ id: regex }, { earTagNumber: regex }, { rfidKey: regex }];
  }

  try {
    // Step 1: Find matching cows
    const matchingCows = await CowModel.find(cowQuery).select('_id').exec();
    const cowIds = matchingCows.map(cow => cow._id);

    // Step 2: Construct query for expenses
    const expenseQuery = {
      ...(cowIds.length > 0 ? { cowId: { $in: cowIds } } : { cowId: null }),
    };

    // Step 3: Query expenses
    const resultsPromise = ExpenseModel.find(expenseQuery)
      .populate('cowId', 'earTagNumber rfidKey id') // Populate cow details
      .skip(skip)
      .limit(limit)
      .exec();

    const countPromise = ExpenseModel.countDocuments(expenseQuery);

    const [results, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    // Restructure results
    const formattedResults = results.map(result => ({
      _id: result._id,
      date: result.date,
      type: result.type,
      description: result.description,
      cost: result.cost,
      createdAt: result.createdAt,
      lastUpdated: result.lastUpdated,
      addedBy: result.addedBy,
      id: result.cowId.id,
      earTagNumber: result.cowId.earTagNumber,
      rfidKey: result.cowId.rfidKey,
      cowId: {
        _id: result.cowId._id,
        id: result.cowId.id,
        earTagNumber: result.cowId.earTagNumber,
        rfidKey: result.cowId.rfidKey,
      },
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
