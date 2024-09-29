const summaryMilkProduction = async (Model, req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Start of today
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // End of today

    const weekStart = new Date();
    weekStart.setDate(todayStart.getDate() - todayStart.getDay()); // Start of this week
    weekStart.setHours(0, 0, 0, 0);

    const morningStart = new Date();
    morningStart.setHours(0, 0, 0, 0); // Start of today morning

    const morningEnd = new Date();
    morningEnd.setHours(11, 59, 59, 999); // End of today morning

    const eveningStart = new Date();
    eveningStart.setHours(12, 0, 0, 0); // Start of today evening

    const eveningEnd = new Date();
    eveningEnd.setHours(23, 59, 59, 999); // End of today evening

    const summaryData = await Model.aggregate([
      {
        $facet: {
          totalToday: [
            {
              $match: { entryDate: { $gte: todayStart, $lte: todayEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
              },
            },
          ],
          totalThisWeek: [
            {
              $match: { entryDate: { $gte: weekStart, $lte: todayEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
              },
            },
          ],
          totalMorning: [
            {
              $match: { entryDate: { $gte: morningStart, $lte: morningEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
              },
            },
          ],
          totalEvening: [
            {
              $match: { entryDate: { $gte: eveningStart, $lte: eveningEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
              },
            },
          ],
        },
      },
    ]);

    const expectedMilkPerDay = 80; // Dummy value for expected milk per day
    const expectedSilagePerDay = 200; // Dummy value for expected silage per day

    const totalToday = summaryData[0].totalToday.length > 0 ? summaryData[0].totalToday[0] : { totalMilk: 0, totalSilage: 0 };
    const totalThisWeek = summaryData[0].totalThisWeek.length > 0 ? summaryData[0].totalThisWeek[0] : { totalMilk: 0, totalSilage: 0 };

    const result = {
      totalToday: {
        ...totalToday,
        expectedMilk: expectedMilkPerDay,
        expectedSilage: expectedSilagePerDay,
      },
      totalThisWeek: {
        ...totalThisWeek,
        expectedMilk: totalThisWeek.totalMilk > 0 ? (expectedMilkPerDay * Math.min(7, new Date().getDay() + 1)) : 0, // Adjusted based on days in the week
        expectedSilage: totalThisWeek.totalSilage > 0 ? (expectedSilagePerDay * Math.min(7, new Date().getDay() + 1)) : 0,
      },
      totalMorning: summaryData[0].totalMorning.length > 0 ? { ...summaryData[0].totalMorning[0], expectedMilk: expectedMilkPerDay/2, expectedSilage: expectedSilagePerDay/2 } : { totalMilk: 0, totalSilage: 0, expectedMilk: expectedMilkPerDay/2, expectedSilage: expectedSilagePerDay/2 },
      totalEvening: summaryData[0].totalEvening.length > 0 ? { ...summaryData[0].totalEvening[0], expectedMilk: expectedMilkPerDay/2, expectedSilage: expectedSilagePerDay/2 } : { totalMilk: 0, totalSilage: 0, expectedMilk: expectedMilkPerDay/2, expectedSilage: expectedSilagePerDay/2 },
    };

    return res.status(200).json({
      success: true,
      result: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating summary: ' + error.message,
    });
  }
};

module.exports = summaryMilkProduction;
