const Milestone = require('./milestone.model');
const Project = require('../projects/project.model');

/**
 * Create a new milestone under a project
 */
const createMilestone = async (freelancerId, projectId, milestoneData) => {
  // Verify project exists, belongs to this freelancer, and is not completed or archived
  const project = await Project.findOne({
    _id: projectId,
    freelancerId,
    isArchived: false
  });

  if (!project) {
    const error = new Error('Project not found or archived');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (project.status === 'completed') {
    const error = new Error('Cannot add milestones to a completed project');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  const milestone = new Milestone({
    projectId,
    freelancerId,
    ...milestoneData,
    isCompleted: false,
    completedAt: null
  });

  await milestone.save();
  return milestone;
};

/**
 * Get all milestones for a specific project
 */
const getMilestonesForProject = async (freelancerId, projectId) => {
  // Check if project exists to prevent empty returns on invalid IDs
  const projectExists = await Project.exists({ _id: projectId, freelancerId, isArchived: false });
  if (!projectExists) {
    const error = new Error('Project not found or archived');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const milestones = await Milestone.find({ projectId, freelancerId }).sort({ createdAt: 1 });
  return milestones;
};

/**
 * Get a specific milestone details
 */
const getMilestoneById = async (freelancerId, milestoneId) => {
  const milestone = await Milestone.findOne({ _id: milestoneId, freelancerId });
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return milestone;
};

/**
 * Update an incomplete milestone details
 */
const updateMilestone = async (freelancerId, milestoneId, updateData) => {
  const milestone = await Milestone.findOne({ _id: milestoneId, freelancerId });
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Guard: Block editing of completed milestones
  if (milestone.isCompleted) {
    const error = new Error('Cannot update a completed milestone');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  // Strip immutable / state fields
  const filteredData = { ...updateData };
  const disallowed = ['_id', 'projectId', 'freelancerId', 'isCompleted', 'completedAt', 'createdAt', 'updatedAt'];
  disallowed.forEach(field => delete filteredData[field]);

  const updatedMilestone = await Milestone.findOneAndUpdate(
    { _id: milestoneId, freelancerId },
    { $set: filteredData },
    { new: true, runValidators: true }
  );

  return updatedMilestone;
};

/**
 * Mark a milestone as completed (one-way state transition)
 */
const completeMilestone = async (freelancerId, milestoneId) => {
  const milestone = await Milestone.findOne({ _id: milestoneId, freelancerId });
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Guard: Block if already completed (prevent resetting completedAt or duplicate calls)
  if (milestone.isCompleted) {
    const error = new Error('Milestone is already complete');
    error.statusCode = 400;
    error.code = 'MILESTONE_ALREADY_COMPLETE';
    throw error;
  }

  milestone.isCompleted = true;
  milestone.completedAt = new Date();
  
  await milestone.save();
  return milestone;
};

/**
 * Delete an incomplete milestone
 */
const deleteMilestone = async (freelancerId, milestoneId) => {
  const milestone = await Milestone.findOne({ _id: milestoneId, freelancerId });
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Guard: Block deletion of completed milestones
  if (milestone.isCompleted) {
    const error = new Error('Cannot delete a completed milestone');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  await Milestone.deleteOne({ _id: milestoneId, freelancerId });
  return { id: milestoneId };
};

module.exports = {
  createMilestone,
  getMilestonesForProject,
  getMilestoneById,
  updateMilestone,
  completeMilestone,
  deleteMilestone
};
