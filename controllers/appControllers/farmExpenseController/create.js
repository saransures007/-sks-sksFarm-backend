const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const createCowExpense = async (Model, req, res) => {
  const {  date, type, description, cost, addedBy } = req.body;

  console.log("Creating cow expense");
  // Ensure all required fields are provided
  if (  !date || !type || !description || !cost || !addedBy) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    // Convert date to UTC using dayjs
    const utcDate = dayjs(date).utc().toISOString(); // Convert to ISO string in UTC format

    // Create a new expense entry
    const expenseEntry = new Model({
      date: utcDate, // Use the converted UTC date
      type,
      description,
      cost,
      addedBy,
      lastUpdated: Date.now(),
    });

    const result = await expenseEntry.save();

    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully created expense entry.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating expense entry: ' + error.message,
    });
  }
};

module.exports = createCowExpense;
