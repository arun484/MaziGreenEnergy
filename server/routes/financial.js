const express = require('express');
const { body, validationResult } = require('express-validator');

// Choose database based on environment
let getConnection;
if (process.env.DATABASE_URL) {
  getConnection = require('../database/init').getConnection;
} else {
  getConnection = require('../database/local').getConnection;
}

const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current financial summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const db = getConnection();
    
    if (process.env.DATABASE_URL) {
      // PostgreSQL implementation
      res.json({ message: 'PostgreSQL not implemented for local testing' });
    } else {
      // SQLite - return sample data for testing
      res.json({
        currentMonth: {
          revenue: 5000,
          electricityCost: 500,
          maintenanceCost: 200,
          loanPayment: 1000,
          otherCosts: 100,
          netProfit: 3200
        },
        yearToDate: {
          revenue: 45000,
          netProfit: 32000
        },
        loan: {
          principalAmount: 1500000,
          interestRate: 8.5,
          termMonths: 60,
          startDate: new Date().toISOString(),
          monthlyPayment: 30750,
          remainingBalance: 1500000
        },
        period: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// Get financial data for specific period
router.get('/period', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Return sample data for testing
    res.json({
      financialData: [
        {
          period: startDate,
          revenue: 5000,
          electricity_cost: 500,
          maintenance_cost: 200,
          loan_payment: 1000,
          other_costs: 100,
          net_profit: 3200
        }
      ],
      period: { startDate, endDate },
      groupBy
    });

  } catch (error) {
    console.error('Period financial data error:', error);
    res.status(500).json({ error: 'Failed to fetch period financial data' });
  }
});

// Add new financial record
router.post('/record', authenticateToken, [
  body('date').isDate(),
  body('revenue').isNumeric().toFloat(),
  body('electricityCost').isNumeric().toFloat(),
  body('maintenanceCost').isNumeric().toFloat(),
  body('loanPayment').isNumeric().toFloat(),
  body('otherCosts').isNumeric().toFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, revenue, electricityCost, maintenanceCost, loanPayment, otherCosts } = req.body;
    
    // For local testing, just return success
    res.status(201).json({
      message: 'Financial record added successfully',
      record: {
        id: Date.now(),
        plant_id: 1,
        date,
        revenue,
        electricity_cost: electricityCost,
        maintenance_cost: maintenanceCost,
        loan_payment: loanPayment,
        other_costs: otherCosts,
        net_profit: revenue - electricityCost - maintenanceCost - loanPayment - otherCosts,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Add financial record error:', error);
    res.status(500).json({ error: 'Failed to add financial record' });
  }
});

// Update financial record
router.put('/record/:id', authenticateToken, [
  body('revenue').optional().isNumeric().toFloat(),
  body('electricityCost').optional().isNumeric().toFloat(),
  body('maintenanceCost').optional().isNumeric().toFloat(),
  body('loanPayment').optional().isNumeric().toFloat(),
  body('otherCosts').optional().isNumeric().toFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const pool = getConnection();

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (updates.revenue !== undefined) {
      updateFields.push(`revenue = $${++paramCount}`);
      updateValues.push(updates.revenue);
    }
    if (updates.electricityCost !== undefined) {
      updateFields.push(`electricity_cost = $${++paramCount}`);
      updateValues.push(updates.electricityCost);
    }
    if (updates.maintenanceCost !== undefined) {
      updateFields.push(`maintenance_cost = $${++paramCount}`);
      updateValues.push(updates.maintenanceCost);
    }
    if (updates.loanPayment !== undefined) {
      updateFields.push(`loan_payment = $${++paramCount}`);
      updateValues.push(updates.loanPayment);
    }
    if (updates.otherCosts !== undefined) {
      updateFields.push(`other_costs = $${++paramCount}`);
      updateValues.push(updates.otherCosts);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.unshift(id); // Add id as first parameter

    const updateQuery = `
      UPDATE financials 
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND plant_id = $${++paramCount}
      RETURNING *
    `;
    updateValues.push(1); // plant_id

    const updatedRecord = await pool.query(updateQuery, updateValues);

    if (updatedRecord.rows.length === 0) {
      return res.status(404).json({ error: 'Financial record not found' });
    }

    res.json({
      message: 'Financial record updated successfully',
      record: updatedRecord.rows[0]
    });

  } catch (error) {
    console.error('Update financial record error:', error);
    res.status(500).json({ error: 'Failed to update financial record' });
  }
});

// Get investor returns calculation
router.get('/investor-returns', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      totalInvestment: 50000,
      totalProfit: 3200,
      returnRate: 6.4,
      monthlyReturns: [
        {
          month: new Date().toISOString(),
          monthlyProfit: 3200
        }
      ],
      calculationDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Investor returns error:', error);
    res.status(500).json({ error: 'Failed to calculate investor returns' });
  }
});

// Get loan repayment schedule
router.get('/loan-schedule', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      loan: {
        principalAmount: 1500000,
        interestRate: 8.5,
        termMonths: 60,
        startDate: new Date().toISOString(),
        monthlyPayment: 30750
      },
      schedule: [
        {
          month: 1,
          payment: 30750,
          principalPayment: 20000,
          interestPayment: 10750,
          remainingBalance: 1480000
        }
      ]
    });

  } catch (error) {
    console.error('Loan schedule error:', error);
    res.status(500).json({ error: 'Failed to generate loan schedule' });
  }
});

module.exports = router;
