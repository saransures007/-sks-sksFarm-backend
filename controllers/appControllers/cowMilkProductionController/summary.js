const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const summaryMilkProduction = async (Model, req, res) => {
  try {
    // Get the current time in IST
    const istTimeZone = 'Asia/Kolkata'; // IST Timezone
    const todayStart = dayjs().tz(istTimeZone).startOf('day').toDate(); // Start of today
    const todayEnd = dayjs().tz(istTimeZone).endOf('day').toDate(); // End of today

    const weekStart = dayjs().tz(istTimeZone).startOf('week').toDate(); // Start of this week

    const morningStart = dayjs().tz(istTimeZone).startOf('day').toDate(); // Start of today morning
    const morningEnd = dayjs().tz(istTimeZone).hour(11).minute(59).second(59).toDate(); // End of today morning

    const eveningStart = dayjs().tz(istTimeZone).hour(12).toDate(); // Start of today evening
    const eveningEnd = dayjs().tz(istTimeZone).endOf('day').toDate(); // End of today evening

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      return dayjs(weekStart).add(i, 'day').toDate();
    });

    const dailySilageUsagePromises = daysOfWeek.map(async (day) => {
      const dayStart = dayjs(day).tz(istTimeZone).startOf('day').toDate();
      const dayEnd = dayjs(day).tz(istTimeZone).endOf('day').toDate();

      const dailyData = await Model.aggregate([
        {
          $match: { entryDate: { $gte: dayStart, $lte: dayEnd } },
        },
        {
          $group: {
            _id: null,
            totalSilage: { $sum: '$silage' },
          },
        },
      ]);

      return dailyData.length > 0 ? dailyData[0].totalSilage : 0;
    });

    const dailySilageUsagedata = await Promise.all(dailySilageUsagePromises);

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

    // New logic to calculate daily milk production for this month
    const currentMonth = dayjs().tz(istTimeZone).month();
    const currentYear = dayjs().tz(istTimeZone).year();
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

    // Calculating totalMilk and totalSilage for this month
    const totalMilkThisMonth = dailyMilkProductionThisMonthData.reduce((acc, day) => acc + day.totalMilk, 0);
    const totalSilageThisMonth = dailyMilkProductionThisMonthData.reduce((acc, day) => acc + day.totalSilage, 0);

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
      bar: {
        totalToday: {
          ...totalToday,
          expectedMilk: expectedMilkPerDay,
          expectedSilage: expectedSilagePerDay,
        },
        totalThisWeek: {
          ...totalThisWeek,
          expectedMilk: totalThisWeek.totalMilk > 0 ? (expectedMilkPerDay * Math.min(7, dayjs().tz(istTimeZone).day() + 1)) : 0, // Adjusted based on days in the week
          expectedSilage: totalThisWeek.totalSilage > 0 ? (expectedSilagePerDay * Math.min(7, dayjs().tz(istTimeZone).day() + 1)) : 0,
        },
        totalMorning: summaryData[0].totalMorning.length > 0 ? { ...summaryData[0].totalMorning[0], expectedMilk: expectedMilkPerDay / 2, expectedSilage: expectedSilagePerDay / 2 } : { totalMilk: 0, totalSilage: 0, expectedMilk: expectedMilkPerDay / 2, expectedSilage: expectedSilagePerDay / 2 },
        totalEvening: summaryData[0].totalEvening.length > 0 ? { ...summaryData[0].totalEvening[0], expectedMilk: expectedMilkPerDay / 2, expectedSilage: expectedSilagePerDay / 2 } : { totalMilk: 0, totalSilage: 0, expectedMilk: expectedMilkPerDay / 2, expectedSilage: expectedSilagePerDay / 2 },
        totalThisMonth: {
          totalMilk: totalMilkThisMonth,
          totalSilage: totalSilageThisMonth,
          expectedMilk: expectedMilkPerDay * daysInMonth,
          expectedSilage: expectedSilagePerDay * daysInMonth,
        }
      },
      chart: {
        dailyMilkProduction: dailyMilkProductionData, // Daily production data for the week
        dailyMilkProductionThisMonth: dailyMilkProductionThisMonthData, // Daily production data for the month
        dailySilageUsage: dailySilageUsagedata,
      }
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
