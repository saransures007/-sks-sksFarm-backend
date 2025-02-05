const paginatedList = async (FeedInventoryModel, FarmModel, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("List paginated feed inventory");

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

    // Step 2: Construct query for feed inventory
    const feedInventoryQuery = {
      ...(farmIds.length > 0 ? { farmId: { $in: farmIds } } : { farmId: null }),
    };

    // Step 3: Query feed inventory
    const resultsPromise = FeedInventoryModel.find(feedInventoryQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    const countPromise = FeedInventoryModel.countDocuments(feedInventoryQuery);

    const [results, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    // Restructure results
    const formattedResults = results.map(result => ({
      feedId: result._id,
      feedType: result.feedType,
      quantity: result.quantity,
      unit: result.unit,
      costPerUnit: result.costPerUnit,
      totalCost: result.totalCost,
      lastUpdated: result.lastUpdated,
      addedBy: result.addedBy,
      createdAt: result.createdAt,
    }));

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result: formattedResults,
        pagination,
        message: 'Successfully found feed inventory records',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No feed inventory records found',
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching feed inventory: ' + error.message,
    });
  }
};

module.exports = paginatedList;
