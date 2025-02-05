const paginatedList = async (Model, CowModel, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("list");

  const { filter, equal } = req.query;
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  // Construct the query object for cow records
  const cowQuery = {};

  // Adding search fields if specified for cow records
  if (req.query.q) {
    const regex = new RegExp(req.query.q, 'i'); // Case insensitive search
    console.log("Searching with regex:", regex); // Log the regex pattern

    // Initialize the $or array
    cowQuery.$or = [];

    // If specific fields are provided, search only in those fields
    if (fieldsArray.length > 0) {
      fieldsArray.forEach(field => {
        cowQuery.$or.push({ [field]: regex }); // Use the field directly
        console.log(`Field: ${field}, Regex: ${regex}`); // Log each field and regex
      });
    } else {
      // If no fields are provided, search in the necessary fields directly
      cowQuery.$or = [
        { 'id': regex },
        { 'earTagNumber': regex },
        { 'rfidKey': regex },
      ];
    }
  }

  console.log("Constructed cow query:", JSON.stringify(cowQuery, null, 2)); // Log the cow query

  try {
    // Step 1: Find matching cows
    const matchingCows = await CowModel.find(cowQuery).select('_id').exec(); // Assuming Model is for cowmilkproductions

    // Step 2: Extract ObjectIds of the matching cows
    const cowIds = matchingCows.map(cow => cow._id);

    // Step 3: Construct query for cowmilkproductions
    const milkQuery = {
      ...(cowIds.length > 0 ? { cowId: { $in: cowIds } } : { cowId: null }) // Handle no matches
    };

    // Step 4: Querying the cowmilkproductions
    const resultsPromise = Model.find(milkQuery)
      .populate('cowId', 'earTagNumber rfidKey id') // Populate cow details
      .skip(skip)
      .limit(limit)
      .exec();

    // Counting the total documents
    const countPromise = Model.countDocuments(milkQuery);

    // Resolving both promises
    const [results, count] = await Promise.all([resultsPromise, countPromise]);

    // Log the results before formatting
    console.log("Raw results from DB:", results);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    // Restructure the results to include cowId details at the main level
    const formattedResults = results.map(result => ({
      _id: result._id,
      liter: result.liter,
      entryDate: result.entryDate,
      snf: result.snf,
      fat: result.fat,
      silage: result.silage,
      pelletsFeed: result.pelletsFeed, 
      dryFodder: result.dryFodder, 
      tmrFeed: result.tmrFeed,
      addedBy: result.addedBy,
      createdAt: result.createdAt,
      lastUpdated: result.lastUpdated,
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
    console.error("Error fetching data:", error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: 'Error fetching data: ' + error.message,
    });
  }
};


module.exports = paginatedList;
