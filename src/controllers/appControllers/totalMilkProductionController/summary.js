const summary = async (Model, req, res) => {
  try {
    const summaryData = await Model.aggregate([
      {
        $group: {
          _id: null,
          totalMilk: { $sum: '$totalMilk' },
          avgSnf: { $avg: '$avgSnf' },
          avgFat: { $avg: '$avgFat' },
        },
      },
    ]);

    if (!summaryData.length) {
      return res.status(404).json({
        success: false,
        message: 'No summary data available.',
      });
    }

    return res.status(200).json({
      success: true,
      summary: summaryData[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating summary: ' + error.message,
    });
  }
};

module.exports = summary;
