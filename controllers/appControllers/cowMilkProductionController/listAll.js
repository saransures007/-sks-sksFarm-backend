const paginatedList = async (Model, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("list all")
  
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
    // Querying the database for a list of results with populated cow details
    const resultsPromise = Model.find(query)
      .populate('cowId', 'earTagNumber rfidKey id') // Populate cow details
      .skip(skip)
      .limit(limit)
      .exec();

    // Counting the total documents
    const countPromise = Model.countDocuments(query);

    // Resolving both promises
    const [results, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result: results,
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
