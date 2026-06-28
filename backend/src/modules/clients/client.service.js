const Client = require('./client.model');
const Project = require('../projects/project.model');

/**
 * Create a new client record
 */
const createClient = async (freelancerId, clientData) => {
  try {
    const client = new Client({
      freelancerId,
      ...clientData
    });
    await client.save();
    return client;
  } catch (error) {
    // Catch MongoDB duplicate index error (11000) for compound freelancerId + email index
    if (error.code === 11000) {
      const conflictError = new Error('A client with this email already exists in your account');
      conflictError.statusCode = 409;
      conflictError.code = 'CONFLICT';
      conflictError.field = 'email';
      throw conflictError;
    }
    throw error;
  }
};

/**
 * Get all clients for a freelancer with pagination and filters
 */
const getAllClients = async (freelancerId, queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    isArchived = 'false'
  } = queryParams;

  const query = {
    freelancerId,
    isArchived: isArchived === 'true'
  };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const sortDirection = order === 'desc' ? -1 : 1;

  const clients = await Client.find(query)
    .sort({ [sort]: sortDirection })
    .skip(skip)
    .limit(parseInt(limit, 10));

  const total = await Client.countDocuments(query);

  return {
    clients,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

/**
 * Get a single client record with associated project metrics
 */
const getClientById = async (freelancerId, clientId) => {
  const client = await Client.findOne({ _id: clientId, freelancerId });
  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Count active/open projects linked to this client
  const activeProjectsCount = await Project.countDocuments({
    clientId,
    freelancerId,
    status: { $ne: 'completed' },
    isArchived: false
  });

  // Count total projects linked to this client
  const totalProjectsCount = await Project.countDocuments({
    clientId,
    freelancerId,
    isArchived: false
  });

  return {
    ...client.toObject(),
    activeProjectsCount,
    projectCount: totalProjectsCount
  };
};

/**
 * Update an existing client profile
 */
const updateClient = async (freelancerId, clientId, clientData) => {
  const updateFields = { ...clientData };

  // Enforce field constraints (prevent changing ownership or soft-delete status here)
  const disallowed = ['_id', 'freelancerId', 'isArchived', 'createdAt', 'updatedAt'];
  disallowed.forEach(field => delete updateFields[field]);

  try {
    const updatedClient = await Client.findOneAndUpdate(
      { _id: clientId, freelancerId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      const error = new Error('Client not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return updatedClient;
  } catch (error) {
    if (error.code === 11000) {
      const conflictError = new Error('A client with this email already exists in your account');
      conflictError.statusCode = 409;
      conflictError.code = 'CONFLICT';
      conflictError.field = 'email';
      throw conflictError;
    }
    throw error;
  }
};

/**
 * Soft delete/archive a client profile
 */
const archiveClient = async (freelancerId, clientId) => {
  // Guard: Verify there are no active/open projects for this client
  const activeProjectExists = await Project.exists({
    clientId,
    freelancerId,
    status: { $ne: 'completed' },
    isArchived: false
  });

  if (activeProjectExists) {
    const error = new Error('Cannot archive client with active projects');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  const archivedClient = await Client.findOneAndUpdate(
    { _id: clientId, freelancerId },
    { $set: { isArchived: true } },
    { new: true }
  );

  if (!archivedClient) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return archivedClient;
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  archiveClient
};
