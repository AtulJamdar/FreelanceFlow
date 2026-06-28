const clientService = require('./client.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Create a new client profile
 */
const createClient = async (req, res) => {
  const result = await clientService.createClient(req.user._id, req.body);
  return sendSuccess(res, result, 201);
};

/**
 * Retrieve all client profiles (paginated & filtered)
 */
const getClients = async (req, res) => {
  const result = await clientService.getAllClients(req.user._id, req.query);
  return sendSuccess(res, result, 200);
};

/**
 * Retrieve a specific client profile with project count summaries
 */
const getClient = async (req, res) => {
  const result = await clientService.getClientById(req.user._id, req.params.id);
  return sendSuccess(res, result, 200);
};

/**
 * Update an existing client profile details
 */
const updateClient = async (req, res) => {
  const result = await clientService.updateClient(req.user._id, req.params.id, req.body);
  return sendSuccess(res, result, 200);
};

/**
 * Soft delete / archive a client profile
 */
const deleteClient = async (req, res) => {
  const result = await clientService.archiveClient(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Client archived successfully', client: result }, 200);
};

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient
};
