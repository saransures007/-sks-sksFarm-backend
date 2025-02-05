const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const mongoose = require('mongoose');
const Setting = mongoose.model('setting');

dayjs.extend(utc);
dayjs.extend(timezone);

const summaryMilkProduction = async (Model, req, res) => {
  try {
    const istTimeZone = 'Asia/Kolkata'; // IST Timezone

    // Time boundaries
    const todayStart = dayjs().tz(istTimeZone).startOf('day').toDate();
    const todayEnd = dayjs().tz(istTimeZone).endOf('day').toDate();
    const weekStart = dayjs().tz(istTimeZone).startOf('week').toDate();
    const monthStart = dayjs().tz(istTimeZone).startOf('month').toDate();
    const yearStart = dayjs().tz(istTimeZone).startOf('year').toDate();
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      return dayjs(weekStart).add(i, 'day').toDate();
    });

    // Aggregate total milk and feed usage data
    const summaryData = await Model.aggregate([
      {
        $facet: {
          totalToday: [
            { $match: { entryDate: { $gte: todayStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
                totalTMR: { $sum: '$tmrFeed' },
                totalPellets: { $sum: '$pelletsFeed' },
              },
            },
          ],
          totalThisWeek: [
            { $match: { entryDate: { $gte: weekStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
                totalTMR: { $sum: '$tmrFeed' },
                totalPellets: { $sum: '$pelletsFeed' },
              },
            },
          ],
          totalThisMonth: [
            { $match: { entryDate: { $gte: monthStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
                totalTMR: { $sum: '$tmrFeed' },
                totalPellets: { $sum: '$pelletsFeed' },
              },
            },
          ],
          totalThisYear: [
            { $match: { entryDate: { $gte: yearStart, $lte: todayEnd } } },
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
                totalTMR: { $sum: '$tmrFeed' },
                totalPellets: { $sum: '$pelletsFeed' },
              },
            },
          ],
          totalOverall: [
            {
              $group: {
                _id: null,
                totalMilk: { $sum: '$liter' },
                totalSilage: { $sum: '$silage' },
                totalTMR: { $sum: '$tmrFeed' },
                totalPellets: { $sum: '$pelletsFeed' },
              },
            },
          ],
        },
      },
    ]);

    const totalMilkProductionByCow = await Model.aggregate([
      {
        $group: {
          _id: "$cowId", // Group by cow ID
          totalMilk: { $sum: '$liter' },
          totalSilage: { $sum: '$silage' },
          totalTMR: { $sum: '$tmrFeed' },
          totalPellets: { $sum: '$pelletsFeed' },
          todayMilk: {
            $sum: { $cond: [{ $gte: ['$entryDate', todayStart] }, '$liter', 0] },
          },
          weekMilk: {
            $sum: { $cond: [{ $gte: ['$entryDate', weekStart] }, '$liter', 0] },
          },
          monthMilk: {
            $sum: { $cond: [{ $gte: ['$entryDate', monthStart] }, '$liter', 0] },
          },
          yearMilk: {
            $sum: { $cond: [{ $gte: ['$entryDate', yearStart] }, '$liter', 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'cows', // Replace with your cows collection name
          localField: '_id',
          foreignField: '_id',
          as: 'cowDetails',
        },
      },
      { $unwind: '$cowDetails' },
      {
        $project: {
          uid: '$_id',
          id: '$cowDetails.id',
          name: '$cowDetails.name',
          totalMilk: '$totalMilk',
          totalSilage: '$totalSilage',
          totalTMR: '$totalTMR',
          totalPellets: '$totalPellets',
          milkProduction: {
            today: '$todayMilk',
            week: '$weekMilk',
            month: '$monthMilk',
            year: '$yearMilk',
            total: '$totalMilk',
          },
        },
      },
    ]);

    const expectedMilkPerDayValue = await Setting.findOne({ settingKey: 'expected_milk_per_day' })
      .select('settingValue')
      .lean();
    const expectedSilagePerDayValue = await Setting.findOne({ settingKey: 'expected_silage_per_day' })
      .select('settingValue')
      .lean();

      const expectedTmrPerDayValue = await Setting.findOne({ settingKey: 'expected_feed_tmr_per_day' })
      .select('settingValue')
      .lean();

      const expectedPelletsPerDayValue = await Setting.findOne({ settingKey: 'expected_feed_pellets_per_day' })
      .select('settingValue')
      .lean();

    const expectedMilkPerDay = expectedMilkPerDayValue?.settingValue || 0;
    const expectedSilagePerDay = expectedSilagePerDayValue?.settingValue || 0;
    const expectedTmrPerDay = expectedTmrPerDayValue?.settingValue || 0;
    const expectedPelletsPerDay = expectedPelletsPerDayValue?.settingValue || 0;

    const dailyMilkProductionPromises = daysOfWeek.map(async (day) => {
      const dayStart = dayjs(day).tz(istTimeZone).startOf('day').toDate();
      const dayEnd = dayjs(day).tz(istTimeZone).endOf('day').toDate();

      const dailyData = await Model.aggregate([
        {
          $match: { entryDate: { $gte: dayStart, $lte: dayEnd } },
        },
        {
          $group: {
            _id: null,
            totalMilk: { $sum: '$liter' },
          },
        },
      ]);

      return dailyData.length > 0 ? dailyData[0].totalMilk : 0;
    });

    const dailyMilkProductionData = await Promise.all(dailyMilkProductionPromises);

        const daysInMonth = dayjs().tz(istTimeZone).daysInMonth();

    const dailyMilkProductionThisMonthPromises = Array.from({ length: daysInMonth }, (_, day) => {
      const dayStart = dayjs().tz(istTimeZone).date(day + 1).startOf('day').toDate();
      const dayEnd = dayjs().tz(istTimeZone).date(day + 1).endOf('day').toDate();

      return Model.aggregate([
        {
          $match: { entryDate: { $gte: dayStart, $lte: dayEnd } },
        },
        {
          $group: {
            _id: null,
            totalMilk: { $sum: '$liter' },
            totalSilage: { $sum: '$silage' },
          },
        },
      ]).then((dailyData) => (dailyData.length > 0 ? dailyData[0] : { totalMilk: 0, totalSilage: 0 }));
    });

    const dailyMilkProductionThisMonthData = await Promise.all(dailyMilkProductionThisMonthPromises);

    // Compile response
    const result = {
      bar: {
      totalToday: {
        ...summaryData[0].totalToday[0],
        expectedMilk: expectedMilkPerDay,
        expectedSilage: expectedSilagePerDay,
        expectedTmr:expectedTmrPerDay,
        expectedPellets:expectedPelletsPerDay,
      },
      totalThisWeek:{ 
        ...summaryData[0].totalThisWeek[0],
        expectedMilk: expectedMilkPerDay*7,
        expectedSilage: expectedSilagePerDay*7,
        expectedTmr:expectedTmrPerDay*7,
        expectedPellets:expectedPelletsPerDay*7,
      },
      totalThisMonth: summaryData[0].totalThisMonth[0],
      // totalThisYear: summaryData[0].totalThisYear[0],
      // totalOverall: summaryData[0].totalOverall[0],
    },
    chart: {
      milkProductionByCow: totalMilkProductionByCow,
      dailyMilkProduction: dailyMilkProductionData,
      dailyMilkProductionThisMonth: dailyMilkProductionThisMonthData, 
    },

    };

    return res.status(200).json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error('Error summarizing milk production:', error);
    res.status(500).json({ error: 'Failed to summarize milk production' });
  }
};

module.exports = summaryMilkProduction;
