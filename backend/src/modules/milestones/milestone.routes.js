const express = require('express');

const milestoneController = require('./milestone.controller');
const Milestone = require('./milestone.model');
const { createMilestoneValidators, updateMilestoneValidators } = require('./milestone.validator');
const validate = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');
const checkOwnership = require('../../middleware/checkOwnership');
const asyncHandler = require('../../middleware/asyncHandler');

// Router is mounted at /api/v1 directly to easily define both nested and flat routes
const router = express.Router();

// Apply auth protection globally
router.use(protect);

// Nested milestone routes: /projects/:projectId/milestones
router.post('/projects/:projectId/milestones', createMilestoneValidators, validate, asyncHandler(milestoneController.createMilestone));
router.get('/projects/:projectId/milestones', asyncHandler(milestoneController.getMilestones));

// Standalone milestone routes: /milestones/:id
router.get('/milestones/:id', checkOwnership(Milestone), asyncHandler(milestoneController.getMilestone));
router.put('/milestones/:id', checkOwnership(Milestone), updateMilestoneValidators, validate, asyncHandler(milestoneController.updateMilestone));
router.patch('/milestones/:id/complete', checkOwnership(Milestone), asyncHandler(milestoneController.completeMilestone));
router.delete('/milestones/:id', checkOwnership(Milestone), asyncHandler(milestoneController.deleteMilestone));

module.exports = router;
