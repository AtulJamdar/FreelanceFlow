const express = require('express');

const clientController = require('./client.controller');
const Client = require('./client.model');
const { createClientValidators, updateClientValidators } = require('./client.validator');
const validate = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');
const checkOwnership = require('../../middleware/checkOwnership');
const asyncHandler = require('../../middleware/asyncHandler');

const router = express.Router();

// Apply auth protection globally to all client routes
router.use(protect);

// CRUD client routes
router.post('/', createClientValidators, validate, asyncHandler(clientController.createClient));
router.get('/', asyncHandler(clientController.getClients));

// Single client operations guarded by checkOwnership
router.get('/:id', checkOwnership(Client), asyncHandler(clientController.getClient));
router.put('/:id', checkOwnership(Client), updateClientValidators, validate, asyncHandler(clientController.updateClient));
router.delete('/:id', checkOwnership(Client), asyncHandler(clientController.deleteClient));

module.exports = router;
