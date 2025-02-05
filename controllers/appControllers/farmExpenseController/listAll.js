const listAll = async (farmExpenseModel, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;


  const { filter, equal } = req.query;
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  // Construct the query object for feed inventory
  const farmExpense = {};

  if (req.query.q) {
    const regex = new RegExp(req.query.q, 'i');
    farmExpense.$or = fieldsArray.length > 0
      ? fieldsArray.map(field => ({ [field]: regex }))
      : [{ feedType: regex }, { addedBy: regex }];
  }

  if (filter && equal) {
    farmExpense[filter] = equal;
  }

  try {
    // Query feed inventory
    const resultsPromise = farmExpenseModel.find(farmExpense)
      .skip(skip)
      .limit(limit)
      .exec();

    const countPromise = farmExpenseModel.countDocuments(farmExpense);

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
      addedBy: result.addedBy,
      createdAt: result.createdAt,
    }));

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result: formattedResults,
        pagination,
        message: 'Successfully found  farmExpense records',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No feed farmExpense records found',
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching  farmExpense: ' + error.message,
    });
  }
};

module.exports = listAll;
