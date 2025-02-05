const paginatedList = async (FeedInventoryUsageModel, req, res) => {
    console.log("List paginated feed inventory usage");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("List paginated feed inventory usage");

  const { filter, equal } = req.query;
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  // Construct the query object for feed inventory usage
  const feedInventoryUsageQuery = {};

  if (req.query.q) {
    const regex = new RegExp(req.query.q, 'i');
    feedInventoryUsageQuery.$or = fieldsArray.length > 0
      ? fieldsArray.map(field => ({ [field]: regex }))
      : [{ feedType: regex }, { usedBy: regex }];
  }

  if (filter && equal) {
    feedInventoryUsageQuery[filter] = equal;
  }

  try {
    console.log("FeedInventoryUsageModel", FeedInventoryUsageModel)
    // Query feed inventory usage
    const resultsPromise = FeedInventoryUsageModel.find(feedInventoryUsageQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    const countPromise = FeedInventoryUsageModel.countDocuments(feedInventoryUsageQuery);

    const [results, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    // Restructure results
    const formattedResults = results.map(result => ({
      id: result._id,
      feedType: result.feedType,
      quantityUsed: result.quantityUsed,
      remainingQuantity: result.remainingQuantity,
      usedBy: result.usedBy,
      date: result.date,
      lastUpdated: result.lastUpdated,
      createdAt: result.createdAt,
    }));

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result: formattedResults,
        pagination,
        message: 'Successfully found feed inventory usage records',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No feed inventory usage records found',
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching feed inventory usage: ' + error.message,
    });
  }
};

module.exports = paginatedList;
