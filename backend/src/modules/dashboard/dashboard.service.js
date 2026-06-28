const mongoose = require('mongoose');
const Client = require('../clients/client.model');
const Project = require('../projects/project.model');
const Invoice = require('../invoices/invoice.model');

/**
 * Retrieve aggregated business metrics for a freelancer
 * @param {string} freelancerId - Authenticated freelancer user ID
 * @returns {Promise<object>} Dashboard metrics summary
 */
const getDashboardStats = async (freelancerId) => {
  const freelancerObjectId = new mongoose.Types.ObjectId(freelancerId);

  // Run Mongoose queries in parallel using Promise.all
  const [
    clientCount,
    activeProjCount,
    completedProjCount,
    invoiceStats
  ] = await Promise.all([
    Client.countDocuments({ freelancerId: freelancerObjectId, isArchived: false }),
    Project.countDocuments({ freelancerId: freelancerObjectId, status: { $ne: 'completed' }, isArchived: false }),
    Project.countDocuments({ freelancerId: freelancerObjectId, status: 'completed', isArchived: false }),
    Invoice.aggregate([
      // Match active invoices for this freelancer
      { 
        $match: { 
          freelancerId: freelancerObjectId, 
          isArchived: false 
        } 
      },
      // Compute multiple aggregates in a single pipeline execution
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalInvoiced: { $sum: '$totalAmount' },
                totalPaid: { $sum: '$amountPaid' }
              }
            }
          ],
          overdueCount: [
            { $match: { status: 'overdue' } },
            { $count: 'count' }
          ],
          recentInvoices: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            // Populate client name via MongoDB join
            {
              $lookup: {
                from: 'clients',
                localField: 'clientId',
                foreignField: '_id',
                as: 'clientInfo'
              }
            },
            { $unwind: { path: '$clientInfo', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                invoiceNumber: 1,
                totalAmount: 1,
                amountPaid: 1,
                status: 1,
                createdAt: 1,
                dueDate: 1,
                clientName: '$clientInfo.name'
              }
            }
          ]
        }
      }
    ])
  ]);

  // Extract facet results safely
  const totalsResult = invoiceStats[0]?.totals[0] || { totalInvoiced: 0, totalPaid: 0 };
  const overdueResult = invoiceStats[0]?.overdueCount[0] || { count: 0 };
  const recentInvoices = invoiceStats[0]?.recentInvoices || [];

  const totalInvoiced = Math.round((totalsResult.totalInvoiced || 0) * 100) / 100;
  const totalPaid = Math.round((totalsResult.totalPaid || 0) * 100) / 100;
  const outstandingAmount = Math.max(0, Math.round((totalInvoiced - totalPaid) * 100) / 100);
  const overdueInvoiceCount = overdueResult.count || 0;

  return {
    totalClients: clientCount,
    activeProjects: activeProjCount,
    completedProjects: completedProjCount,
    totalInvoiced,
    totalPaid,
    outstandingAmount,
    overdueInvoices: overdueInvoiceCount,
    recentInvoices
  };
};

module.exports = {
  getDashboardStats
};
