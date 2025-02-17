const { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,addMonths 
} = require('date-fns');

const summary = async (Model, req, res) => {
  try {
    const istTimeZone = "Asia/Kolkata";
    const now = new Date();

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const firstDayOfNextMonth = startOfMonth(addMonths(now, 1));
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    const summaryData = await Model.aggregate([
      {
        $facet: {
          // Today's Summary
          today: [
            { $match: { entryDate: { $gte: todayStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            }
          ],
          // Weekly Summary
          thisWeek: [
            { $match: { entryDate: { $gte: weekStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            }
          ],
          // Monthly Summary
          thisMonth: [
            { $match: { entryDate: { $gte: monthStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            }
          ],
          // Yearly Summary
          thisYear: [
            { $match: { entryDate: { $gte: yearStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            }
          ],
          // Overall Summary
          overall: [
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            }
          ],
          // Day-by-day breakdown for this month
          dayByDayThisMonth: [
            { $match: { entryDate: { $gte: monthStart, $lte: todayEnd } } },
            {
              $group: {
                _id: {$dateToString: { format: "%Y-%m-%d", date: "$entryDate", timezone: "Asia/Kolkata" } },
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
            { $sort: { _id: 1 } }
          ],
          // Month-by-month breakdown for this year
          monthByMonthThisYear: [
            { $match: { entryDate: { $gte: yearStart, $lte: todayEnd } } },
            {
              $group: {
                _id: {
                  month: { $month: "$entryDate" },
                  year: { $year: "$entryDate" }
                },
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ],
          // Morning & Evening Data
          morningEveningData: [
            {
              $match: {
                entryDate: {
                  $gte: monthStart, // Start of the current month
                  $lt: firstDayOfNextMonth // Start of next month
                }
              }
            },
            {
              $addFields: {
                entryDateIST: {
                  $dateToParts: { date: "$entryDate", timezone: "Asia/Kolkata" }
                }
              }
            },
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$entryDate", timezone: "Asia/Kolkata" }
                  },
                  session: {
                    $cond: [{ $lt: ["$entryDateIST.hour", 12] }, "morning", "evening"]
                  }
                },
                totalMilk: { $sum: "$totalMilk" },
                avgSnf: { $avg: "$avgSnf" },
                avgFat: { $avg: "$avgFat" },
                income: { $sum: { $multiply: ["$totalMilk", "$ratePerLiter"] } },
                ratePerLiter: { $avg: "$ratePerLiter" }
              }
            },
            {
              $group: {
                _id: "$_id.date",
                morning: {
                  $push: {
                    $cond: [
                      { $eq: ["$_id.session", "morning"] },
                      {
                        totalMilk: "$totalMilk",
                        avgSnf: "$avgSnf",
                        avgFat: "$avgFat",
                        income: "$income",
                        ratePerLiter: "$ratePerLiter"
                      },
                      "$$REMOVE"
                    ]
                  }
                },
                evening: {
                  $push: {
                    $cond: [
                      { $eq: ["$_id.session", "evening"] },
                      {
                        totalMilk: "$totalMilk",
                        avgSnf: "$avgSnf",
                        avgFat: "$avgFat",
                        income: "$income",
                        ratePerLiter: "$ratePerLiter"
                      },
                      "$$REMOVE"
                    ]
                  }
                }
              }
            },
            { $sort: { _id: 1 } }
          ]
          
          
        }
      }
    ]);
    const [result] = summaryData;
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No summary data available.',
      });
    }

    const formatData = (data) => ({
      totalMilk: data.totalMilk?.toFixed(2) || '0.00',
      avgSnf: data.avgSnf?.toFixed(2) || '0.00',
      avgFat: data.avgFat?.toFixed(2) || '0.00',
      income: data.income?.toFixed(2) || '0.00',
      ratePerLiter: data.ratePerLiter?.toFixed(2) || '0.00',
    });
    console.log("result",result.morningEveningData)

    return res.status(200).json({
      success: true,
      result: {
        today: formatData(result.today[0] || {}),
        thisWeek: formatData(result.thisWeek[0] || {}),
        thisMonth: formatData(result.thisMonth[0] || {}),
        thisYear: formatData(result.thisYear[0] || {}),
        overall: formatData(result.overall[0] || {}),
        dayByDayThisMonth: result.dayByDayThisMonth.map((item) => ({
          date: item._id,
          totalMilk: item.totalMilk?.toFixed(2) || '0.00',
          avgSnf: item.avgSnf?.toFixed(2) || '0.00',
          avgFat: item.avgFat?.toFixed(2) || '0.00',
          income: (item.totalMilk * item.ratePerLiter).toFixed(2) || '0.00',
          ratePerLiter: item.ratePerLiter?.toFixed(2) || '0.00',
        })),
        monthByMonthThisYear: result.monthByMonthThisYear || [],
        morningEveningData : result.morningEveningData.map((item) => ({
          date: item._id,
          morning: item.morning.length > 0
            ? {
                totalMilk: item.morning[0]?.totalMilk.toFixed(2) || "0.00",
                avgSnf: item.morning[0]?.avgSnf.toFixed(2) || "0.00",
                avgFat: item.morning[0]?.avgFat.toFixed(2) || "0.00",
                income: (item.morning[0]?.totalMilk * item.morning[0]?.ratePerLiter).toFixed(2) || "0.00",
                ratePerLiter: item.morning[0]?.ratePerLiter.toFixed(2) || "0.00",
              }
            : {
                totalMilk: "0.00",
                avgSnf: "0.00",
                avgFat: "0.00",
                income: "0.00",
                ratePerLiter: "0.00",
              },
          evening: item.evening.length > 0
            ? {
                totalMilk: item.evening[0]?.totalMilk.toFixed(2) || "0.00",
                avgSnf: item.evening[0]?.avgSnf.toFixed(2) || "0.00",
                avgFat: item.evening[0]?.avgFat.toFixed(2) || "0.00",
                income: (item.evening[0]?.totalMilk * item.evening[0]?.ratePerLiter).toFixed(2) || "0.00",
                ratePerLiter: item.evening[0]?.ratePerLiter.toFixed(2) || "0.00",
              }
            : {
                totalMilk: "0.00",
                avgSnf: "0.00",
                avgFat: "0.00",
                income: "0.00",
                ratePerLiter: "0.00",
              },
        }))
             
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating summary: ' + error.message,
    });
  }
};

module.exports = summary;
