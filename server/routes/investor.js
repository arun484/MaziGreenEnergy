const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all investors (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // Return sample data for testing
    res.json({
      investors: [
        {
          id: 1,
          email: 'test@mazigreen.com',
          first_name: 'Test',
          last_name: 'Investor',
          investment_amount: 50000,
          investment_date: new Date().toISOString(),
          role: 'investor',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      totalCount: 1
    });

  } catch (error) {
    console.error('Get all investors error:', error);
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
});

// Get investor portfolio
router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      portfolio: {
        investor: {
          id: req.user.id,
          firstName: 'Test',
          lastName: 'Investor',
          email: 'test@mazigreen.com',
          investmentAmount: 50000,
          investmentDate: new Date().toISOString(),
          role: 'investor'
        },
        investment: {
          amount: 50000,
          share: '100.00%',
          totalProfit: 3200,
          returnRate: '6.40%'
        },
        monthlyReturns: [
          {
            month: new Date().toISOString(),
            monthlyProfit: 3200
          }
        ]
      }
    });

  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Update investor profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName } = req.body;
    
    // For testing, just return success
    res.json({
      message: 'Profile updated successfully',
      investor: {
        id: req.user.id,
        first_name: firstName || 'Test',
        last_name: lastName || 'Investor',
        email: 'test@mazigreen.com',
        investment_amount: 50000,
        investment_date: new Date().toISOString(),
        role: 'investor'
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get investor documents
router.get('/documents', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      documents: [
        {
          id: 1,
          title: 'Investment Agreement',
          file_path: '/documents/investment-agreement.pdf',
          file_type: 'pdf',
          category: 'legal',
          created_at: new Date().toISOString()
        }
      ],
      totalCount: 1
    });

  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get investment summary
router.get('/investment-summary', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      summary: {
        investment: {
          amount: 50000,
          date: new Date().toISOString(),
          durationMonths: 6,
          share: '100.00%'
        },
        returns: {
          totalProfit: 3200,
          returnRate: '6.40%',
          monthlyAverage: 533.33
        },
        plant: {
          totalInvestment: 50000,
          totalProfit: 3200,
          totalInvestors: 1
        }
      }
    });

  } catch (error) {
    console.error('Investment summary error:', error);
    res.status(500).json({ error: 'Failed to fetch investment summary' });
  }
});

module.exports = router;
