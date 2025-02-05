const paginatedList = async (ExaminationModel, CowModel, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("Listing paginated examinations");

  const { filter, equal } = req.query;
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  // Construct the query object for cow records

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
  try {
    // Step 1: Find matching cows
    const matchingCows = await CowModel.find(cowQuery).select('_id').exec(); // Assuming Model is for cowmilkproductions

    console.log("matchingCows", matchingCows)
    // Step 2: Extract ObjectIds of the matching cows
    const cowIds = matchingCows.map(cow => cow._id);


    // Step 2: Construct query for examinations
    const examinationQuery = {
      ...(cowIds.length > 0 ? { cowId: { $in: cowIds } } : { cowId: null }),
    };

    // Step 3: Query examinations
    const resultsPromise = ExaminationModel.find(examinationQuery)
      .populate('cowId', 'earTagNumber rfidKey id') // Populate cow details
      .skip(skip)
      .limit(limit)
      .exec();

    const countPromise = ExaminationModel.countDocuments(examinationQuery);

    const [results, count] = await Promise.all([resultsPromise, countPromise]);
    console.log("results", results)

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    // Restructure results
    const formattedResults = results.map(result => ({
      _id: result._id,
      examinationId: result.id,
      disease: result.disease,
      entryDate: result.entryDate,
      symptoms: result.symptoms,
      treatment: result.treatment,
      nextCheckupDate: result.nextCheckupDate,
      notes: result.notes,
      lastUpdated: result.lastUpdated,
      createdAt: result.createdAt,
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
        message: 'Successfully found examination records',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No examination records found',
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching examinations: ' + error.message,
    });
  }
};

module.exports = paginatedList;

