const { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear 
} = require('date-fns');

const summary = async (Model, req, res) => {
  try {
    const now = new Date();

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    const summaryData = await Model.aggregate([
      {
        $facet: {
          today: [
            {
              $match: { entryDate: { $gte: todayStart, $lte: todayEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
          ],
          thisWeek: [
            {
              $match: { entryDate: { $gte: weekStart, $lte: weekEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
          ],
          thisMonth: [
            {
              $match: { entryDate: { $gte: monthStart, $lte: monthEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
          ],
          thisYear: [
            {
              $match: { entryDate: { $gte: yearStart, $lte: yearEnd } },
            },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                income: { $sum: { $multiply: ['$totalMilk', '$ratePerLiter'] } },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
          ],
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
            },
          ],
          dayByDayThisMonth: [
            {
              $match: { entryDate: { $gte: monthStart, $lte: monthEnd } },
            },
            {
              $group: {
                _id: { 
                  date: { 
                    $dateToString: { format: "%b %d", date: "$entryDate" } 
                  }
                },
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
            {
              $sort: { '_id.date': 1 },
            },
          ],
          monthByMonthThisYear: [
            {
              $match: { entryDate: { $gte: yearStart, $lte: yearEnd } },
            },
            {
              $group: {
                _id: { month: { $month: '$entryDate' }, year: { $year: '$entryDate' } },
                totalMilk: { $sum: '$totalMilk' },
                avgSnf: { $avg: '$avgSnf' },
                avgFat: { $avg: '$avgFat' },
                ratePerLiter: { $avg: '$ratePerLiter' },
              },
            },
            {
              $sort: { '_id.month': 1 },
            },
          ],
        },
      },
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

    return res.status(200).json({
      success: true,
      result: {
        today: formatData(result.today[0] || {}),
        thisWeek: formatData(result.thisWeek[0] || {}),
        thisMonth: formatData(result.thisMonth[0] || {}),
        thisYear: formatData(result.thisYear[0] || {}),
        overall: formatData(result.overall[0] || {}),
        dayByDayThisMonth: result.dayByDayThisMonth.map((item) => ({
          date: item._id.date,
          totalMilk: item.totalMilk?.toFixed(2) || '0.00',
          avgSnf: item.avgSnf?.toFixed(2) || '0.00',
          avgFat: item.avgFat?.toFixed(2) || '0.00',
          income: (item.totalMilk * item.ratePerLiter).toFixed(2) || '0.00',
          ratePerLiter: item.ratePerLiter?.toFixed(2) || '0.00',
        })),
        monthByMonthThisYear: result.monthByMonthThisYear || [],
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
