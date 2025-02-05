const summaryFeedInventoryUsage = async (Model, req, res) => {
  try {
    const summaryData = await Model.aggregate([
      {
        $group: {
          _id: '$feedType', // Group by feed type
          totalFeedUsed: { $sum: '$quantityUsed' }, // Sum total feed used
        },
      },
    ]);

    // Calculate total overall feed usage
    const totalOverallFeedUsage = summaryData.reduce(
      (acc, curr) => acc + curr.totalFeedUsed,
      0
    );

    // Format the result into an object
    const formattedSummary = {
      TotalSilageFeedUsed: 0,
      TotalTmrFeedUsed: 0,
      TotalPelletsFeedUsed: 0,
      TotalOverallFeedUsed: totalOverallFeedUsage,
    };

    // Populate the usage for each feed type
    summaryData.forEach((data) => {
      if (data._id === 'Silage') {
        formattedSummary.TotalSilageFeedUsed = data.totalFeedUsed;
      } else if (data._id === 'TMR Feed') {
        formattedSummary.TotalTmrFeedUsed = data.totalFeedUsed;
      } else if (data._id === 'Pellet Feed') {
        formattedSummary.TotalPelletsFeedUsed = data.totalFeedUsed;
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

module.exports = summaryFeedInventoryUsage;
