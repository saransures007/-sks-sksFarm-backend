const { result } = require('lodash');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const mongoose = require('mongoose');

dayjs.extend(utc);
dayjs.extend(timezone);

const feedInventoryModel = mongoose.model('feedInventory');
const cowExpenseModel = mongoose.model('cowExpense');

const summaryFarmExpense = async (model, req, res) => {
  try {
    const istTimeZone = 'Asia/Kolkata'; // IST Timezone

    // Time Boundaries using startOf
    const startOfWeek = dayjs().tz(istTimeZone).startOf('week').toDate();
    const startOfMonth = dayjs().tz(istTimeZone).startOf('month').toDate();
    const startOfYear = dayjs().tz(istTimeZone).startOf('year').toDate();

    // Aggregate function for expenses
    const aggregateExpense = async (Model, filter) => {
      return await Model.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$cost" } } }
      ]);
    };

    // Get expenses for different periods
    const getExpense = async (Model) => {
      const overall = await aggregateExpense(Model, {});
      const yearly = await aggregateExpense(Model, { date: { $gte: startOfYear } });
      const monthly = await aggregateExpense(Model, { date: { $gte: startOfMonth } });
      const weekly = await aggregateExpense(Model, { date: { $gte: startOfWeek } });

      return {
        overall: overall.length ? overall[0].total : 0,
        yearly: yearly.length ? yearly[0].total : 0,
        monthly: monthly.length ? monthly[0].total : 0,
        weekly: weekly.length ? weekly[0].total : 0,
      };
    };

    // Get expenses for each model
    const cowExpense = await getExpense(cowExpenseModel);
    const feedInventoryExpense = await getExpense(feedInventoryModel,'create');
    const farmExpense = await getExpense(model,'lastUpdated');

    // Calculate total expenses
    const totalExpense = {
      overall: cowExpense.overall + feedInventoryExpense.overall + farmExpense.overall,
      yearly: cowExpense.yearly + feedInventoryExpense.yearly + farmExpense.yearly,
      monthly: cowExpense.monthly + feedInventoryExpense.monthly + farmExpense.monthly,
      weekly: cowExpense.weekly + feedInventoryExpense.weekly + farmExpense.weekly,
    };

    return res.status(200).json({
      success: true,
      result: {
        cowExpense,
        feedInventoryExpense,
        farmExpense,
        totalExpense,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating farm expense summary: ' + error.message,
    });
  }
};

module.exports = summaryFarmExpense;
