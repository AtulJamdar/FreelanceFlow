const express = require('express');

const projectController = require('./project.controller');
const Project = require('./project.model');
const { createProjectValidators, updateProjectValidators } = require('./project.validator');
const validate = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');
const checkOwnership = require('../../middleware/checkOwnership');
const asyncHandler = require('../../middleware/asyncHandler');

const router = express.Router();

// Apply auth protection globally to all project routes
router.use(protect);

// CRUD routes for projects
router.post('/', createProjectValidators, validate, asyncHandler(projectController.createProject));
router.get('/', asyncHandler(projectController.getProjects));

// Single project operations guarded by checkOwnership
router.get('/:id', checkOwnership(Project), asyncHandler(projectController.getProject));
router.put('/:id', checkOwnership(Project), updateProjectValidators, validate, asyncHandler(projectController.updateProject));
router.delete('/:id', checkOwnership(Project), asyncHandler(projectController.deleteProject));

module.exports = router;
