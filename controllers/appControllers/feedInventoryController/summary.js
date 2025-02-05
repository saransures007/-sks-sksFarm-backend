const summaryFeedInventory = async (Model, req, res) => {
  try {
    const summaryData = await Model.aggregate([
      {
        $group: {
          _id: '$feedType', // Group by feed type
          totalFeedExpense: { $sum: '$totalCost' }, // Sum total cost for each feed type
        },
      },
    ]);

    // Calculate total overall feed expense
    const totalOverallFeedExpense = summaryData.reduce(
      (acc, curr) => acc + curr.totalFeedExpense,
      0
    );

    // Format the result into an object
    const formattedSummary = {
      TotalSilageFeedExpense: 0,
      TotalTmrFeedExpense: 0,
      TotalPelletsFeedExpense: 0,
      TotalOverallFeedExpense: totalOverallFeedExpense,
    };

    // Populate the expenses for each feed type
    summaryData.forEach((data) => {
      if (data._id === 'Silage') {
        formattedSummary.TotalSilageFeedExpense = data.totalFeedExpense;
      } else if (data._id === 'TMR Feed') {
        formattedSummary.TotalTmrFeedExpense = data.totalFeedExpense;
      } else if (data._id === 'Pellet Feed') {
        formattedSummary.TotalPelletsFeedExpense = data.totalFeedExpense;
      }
    });

    if (!summaryData.length) {
      return res.status(404).json({
        success: false,
        message: 'No summary data available.',
      });
    }

    return res.status(200).json({
      success: true,
      result: formattedSummary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating summary: ' + error.message,
    });
  }
};

module.exports = summaryFeedInventory;
