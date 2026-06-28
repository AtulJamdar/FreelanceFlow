const projectService = require('./project.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Create a new project record
 */
const createProject = async (req, res) => {
  const result = await projectService.createProject(req.user._id, req.body);
  return sendSuccess(res, result, 201);
};

/**
 * Retrieve all projects (paginated & filterable)
 */
const getProjects = async (req, res) => {
  const result = await projectService.getAllProjects(req.user._id, req.query);
  return sendSuccess(res, result, 200);
};

/**
 * Retrieve details for a specific project
 */
const getProject = async (req, res) => {
  const result = await projectService.getProjectById(req.user._id, req.params.id);
  return sendSuccess(res, result, 200);
};

/**
 * Update project details
 */
const updateProject = async (req, res) => {
  const result = await projectService.updateProject(req.user._id, req.params.id, req.body);
  return sendSuccess(res, result, 200);
};

/**
 * Archive a project (soft delete)
 */
const deleteProject = async (req, res) => {
  const result = await projectService.archiveProject(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Project archived successfully', project: result }, 200);
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};
