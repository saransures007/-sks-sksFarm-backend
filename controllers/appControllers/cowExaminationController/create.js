const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { v4: uuidv4 } = require('uuid'); // Import UUID library
dayjs.extend(utc);

const createCowExamination = async (Model, req, res) => {
  const {
    disease,
    entryDate,
    cowId,
    addedBy,
    symptoms = [],
    treatment,
    nextCheckupDate,
    notes,
  } = req.body;

  console.log("Creating cow examination");

  // Ensure all required fields are provided
  if (!disease || !entryDate || !cowId || !addedBy) {
    return res.status(400).json({
      success: false,
      message: 'All required fields (id, disease, entryDate, cowId, addedBy) must be provided.',
    });
  }

  try {

    // Generate a unique UUID for the id
    const id = uuidv4();

    // Convert entryDate and nextCheckupDate to UTC
    const utcEntryDate = dayjs(entryDate).utc().toISOString();
    const utcNextCheckupDate = nextCheckupDate
      ? dayjs(nextCheckupDate).utc().toISOString()
      : undefined;

    // Create a new examination entry
    const examinationEntry = new Model({
      id,
      disease,
      entryDate: utcEntryDate,
      cowId,
      addedBy,
      symptoms,
      treatment,
      nextCheckupDate: utcNextCheckupDate,
      notes,
      lastUpdated: Date.now(),
    });

    const result = await examinationEntry.save();

    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully created examination entry.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating examination entry: ' + error.message,
    });
  }
};

module.exports = createCowExamination;
