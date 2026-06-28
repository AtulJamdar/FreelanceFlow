const Project = require('./project.model');
const Client = require('../clients/client.model');
const Milestone = require('../milestones/milestone.model');
const Invoice = require('../invoices/invoice.model');

/**
 * Create a new project linked to a client
 */
const createProject = async (freelancerId, projectData) => {
  // Verify client exists, is not archived, and belongs to this freelancer
  const client = await Client.findOne({
    _id: projectData.clientId,
    freelancerId,
    isArchived: false
  });

  if (!client) {
    const error = new Error('Client not found or archived');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Validate dates: start date and deadline logic
  if (projectData.startDate && projectData.deadline) {
    const startDateVal = new Date(projectData.startDate);
    const deadlineVal = new Date(projectData.deadline);
    if (deadlineVal < startDateVal) {
      const error = new Error('Deadline must be on or after the start date');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      error.field = 'deadline';
      throw error;
    }
  }

  const project = new Project({
    freelancerId,
    ...projectData
  });

  await project.save();
  return project;
};

/**
 * Get all projects for a freelancer (paginated and filterable)
 */
const getAllProjects = async (freelancerId, queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    status,
    clientId,
    isArchived = 'false'
  } = queryParams;

  const query = {
    freelancerId,
    isArchived: isArchived === 'true'
  };

  if (status) {
    query.status = status;
  }

  if (clientId) {
    query.clientId = clientId;
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const sortDirection = order === 'desc' ? -1 : 1;

  const projects = await Project.find(query)
    .populate('clientId', 'name email company')
    .sort({ [sort]: sortDirection })
    .skip(skip)
    .limit(parseInt(limit, 10));

  const total = await Project.countDocuments(query);

  return {
    projects,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

/**
 * Get a specific project decorated with client details, milestone counts, and invoice count
 */
const getProjectById = async (freelancerId, projectId) => {
  const project = await Project.findOne({ _id: projectId, freelancerId }).populate(
    'clientId',
    'name email company'
  );

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Count milestones associated with this project
  const milestonesCount = await Milestone.countDocuments({ projectId, freelancerId });
  const completedMilestonesCount = await Milestone.countDocuments({
    projectId,
    freelancerId,
    isCompleted: true
  });

  // Count invoices associated with this project
  const invoicesCount = await Invoice.countDocuments({ projectId, freelancerId });

  return {
    ...project.toObject(),
    milestonesCount,
    completedMilestonesCount,
    invoicesCount
  };
};

/**
 * Update an existing project
 */
const updateProject = async (freelancerId, projectId, updateData) => {
  const project = await Project.findOne({ _id: projectId, freelancerId });
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Guard: Block editing of completed projects
  if (project.status === 'completed') {
    const error = new Error('Cannot modify a completed project');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  // Guard: Enforce terminal completion status (cannot transition away from completed)
  if (updateData.status && updateData.status !== 'completed' && project.status === 'completed') {
    const error = new Error('Cannot change status of a completed project');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  // Validate dates: start date and deadline logic
  const startDateVal = updateData.startDate ? new Date(updateData.startDate) : new Date(project.startDate);
  const deadlineVal = updateData.deadline ? new Date(updateData.deadline) : (project.deadline ? new Date(project.deadline) : null);

  if (deadlineVal && deadlineVal < startDateVal) {
    const error = new Error('Deadline must be on or after the start date');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    error.field = 'deadline';
    throw error;
  }

  // Strip immutable / safety fields
  const filteredData = { ...updateData };
  const disallowed = ['_id', 'freelancerId', 'isArchived', 'createdAt', 'updatedAt'];
  disallowed.forEach(field => delete filteredData[field]);

  const updatedProject = await Project.findOneAndUpdate(
    { _id: projectId, freelancerId },
    { $set: filteredData },
    { new: true, runValidators: true }
  ).populate('clientId', 'name email company');

  return updatedProject;
};

/**
 * Soft delete / archive a project
 */
const archiveProject = async (freelancerId, projectId) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, freelancerId },
    { $set: { isArchived: true } },
    { new: true }
  );

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return project;
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  archiveProject
};
