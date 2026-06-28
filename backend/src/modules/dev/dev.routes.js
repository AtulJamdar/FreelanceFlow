const express = require('express');
const { checkOverdueInvoices } = require('../../jobs/overdue.job');
const { sendSuccess } = require('../../utils/apiResponse');

const router = express.Router();

// Trigger scan manually (dev/testing environment only)
router.post('/trigger-overdue', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found'
      }
    });
  }

  try {
    const processed = await checkOverdueInvoices();
    return sendSuccess(res, {
      message: 'Overdue checker triggered successfully',
      processedInvoicesCount: processed.length,
      invoices: processed.map(inv => ({
        id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        dueDate: inv.dueDate,
        status: inv.status
      }))
    }, 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
