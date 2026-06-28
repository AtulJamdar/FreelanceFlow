const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Retrieve business metrics dashboard summary
 */
const getDashboard = async (req, res) => {
  const result = await dashboardService.getDashboardStats(req.user._id);
  return sendSuccess(res, result, 200);
};

module.exports = {
  getDashboard
};
