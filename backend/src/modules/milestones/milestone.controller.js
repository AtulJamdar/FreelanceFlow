const milestoneService = require('./milestone.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Create a new milestone under a project
 */
const createMilestone = async (req, res) => {
  const result = await milestoneService.createMilestone(req.user._id, req.params.projectId, req.body);
  return sendSuccess(res, result, 201);
};

/**
 * Retrieve all milestones for a project
 */
const getMilestones = async (req, res) => {
  const result = await milestoneService.getMilestonesForProject(req.user._id, req.params.projectId);
  return sendSuccess(res, result, 200);
};

/**
 * Retrieve a specific milestone
 */
const getMilestone = async (req, res) => {
  const result = await milestoneService.getMilestoneById(req.user._id, req.params.id);
  return sendSuccess(res, result, 200);
};

/**
 * Update milestone details
 */
const updateMilestone = async (req, res) => {
  const result = await milestoneService.updateMilestone(req.user._id, req.params.id, req.body);
  return sendSuccess(res, result, 200);
};

/**
 * Complete a milestone (one-way operation)
 */
const completeMilestone = async (req, res) => {
  const result = await milestoneService.completeMilestone(req.user._id, req.params.id);
  return sendSuccess(res, result, 200);
};

/**
 * Delete an incomplete milestone
 */
const deleteMilestone = async (req, res) => {
  const result = await milestoneService.deleteMilestone(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Milestone deleted successfully', id: result.id }, 200);
};

module.exports = {
  createMilestone,
  getMilestones,
  getMilestone,
  updateMilestone,
  completeMilestone,
  deleteMilestone
};
