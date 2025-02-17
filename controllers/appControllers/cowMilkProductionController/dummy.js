const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

const mongoose = require('mongoose');
const Setting = mongoose.model('setting');

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
    const totalMilkProductionByCow = await Model.aggregate([
      {
        $group: {
          _id: "$cowId", // Assuming you have a cowId field to group by
          totalMilk: { $sum: '$liter' }, // Lifetime total milk production
          today: { 
            $sum: { 
              $cond: [
                { $gte: ['$entryDate', todayStart] }, // Milk produced from start of today onwards
                '$liter', 
                0 
              ] 
            }
          },
          week: { 
            $sum: { 
              $cond: [
                { $gte: ['$entryDate', weekStart] }, // Milk produced from start of this week onwards
                '$liter', 
                0 
              ] 
            }
          },
          month: { 
            $sum: { 
              $cond: [
                { $gte: ['$entryDate', dayjs().tz(istTimeZone).startOf('month').toDate()] }, // Milk produced from start of this month onwards
                '$liter', 
                0 
              ] 
            }
          },
          year: { 
            $sum: { 
              $cond: [
                { $gte: ['$entryDate', dayjs().tz(istTimeZone).startOf('year').toDate()] }, // Milk produced from start of this year onwards
                '$liter', 
                0 
              ] 
            }
          },
        },
      },
      {
        $lookup: {
          from: 'cows', // Replace 'cows' with your actual collection name for cows
          localField: '_id',
          foreignField: '_id',
          as: 'cowDetails',
        },
      },
      {
        $unwind: '$cowDetails',
      },
      {
        $project: {
          uid: '$_id',
          id: '$cowDetails.id',
          name: '$cowDetails.name', // Assuming there's a name field in your cows collection
          totalMilk: {
            today: '$today',
            week: '$week',
            month: '$month',
            year: '$year',
            total: '$totalMilk', // Overall lifetime milk production
          },
        },
      },
    ]);
    

    // Fetch only the settingValue field for both settings
    const expectedMilkPerDayValue = await Setting.findOne({ settingKey: 'expected_milk_per_day' })
      .select('settingValue')
      .lean()
      .exec();

    const expectedSilagePerDayValue = await Setting.findOne({ settingKey: 'expected_silage_per_day' })
      .select('settingValue')
      .lean()
      .exec();
      const expectedMilkPerDay = expectedMilkPerDayValue.settingValue;
      const expectedSilagePerDay = expectedSilagePerDayValue.settingValue;

    console.log("expectedMilkPerDay", expectedMilkPerDay);
    console.log("expectedMilkPerDay", expectedMilkPerDay);
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
          expectedMilk: expectedMilkPerDay * 7, // Adjusted based on days in the week
          expectedSilage: expectedSilagePerDay * 7,
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
        totalMilkProductionByCow: totalMilkProductionByCow,
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
