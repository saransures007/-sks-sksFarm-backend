const paginatedList = async (Model, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  const { filter, equal } = req.query;
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  // Construct the query object
  const query = {
    ...(filter && equal ? { [filter]: equal } : {}),
  };

  // Adding search fields if specified
  if (req.query.q) {
    const regex = new RegExp(req.query.q, 'i');
    if (fieldsArray.length > 0) {
      query.$or = fieldsArray.map(field => ({ [field]: regex }));
    }
  }

  try {
    // Querying the database for a list of results
    const resultsPromise = Model.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ entryDate: -1 })
      .exec();

      
    // Counting the total documents
    const countPromise = Model.countDocuments(query);

    // Resolving both promises
    const [results, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    if (count > 0) {
      const migratedData = results.map((x) => migrate(x));
      return res.status(200).json({
        success: true,
        result: migratedData,
        pagination,
        message: 'Successfully found all documents',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'Collection is empty',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching data: ' + error.message,
    });
  }
};

module.exports = paginatedList;
