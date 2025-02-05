const paginatedList = async (ExaminationModel, CowModel, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = (page - 1) * limit;

  console.log("Listing paginated examinations");

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

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    // Restructure results
    const formattedResults = results.map(result => ({
      id: result.cowId.id,
      examinationId: result._id,
      disease: result.disease,
      entryDate: result.entryDate,
      symptoms: result.symptoms,
      treatment: result.treatment,
      nextCheckupDate: result.nextCheckupDate,
      notes: result.notes,
      createdAt: result.createdAt,
      addedBy: result.addedBy,
      cow: result.cowId ? {
        _id: result.cowId._id,
        id: result.cowId.id,
        earTagNumber: result.cowId.earTagNumber,
        rfidKey: result.cowId.rfidKey,
      } : null,
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

