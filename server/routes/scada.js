const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get real-time plant performance data
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      performance: {
        id: 1,
        plant_id: 1,
        timestamp: new Date().toISOString(),
        power_generation_kw: 1800,
        efficiency_percentage: 85.5,
        temperature_celsius: 25.0,
        irradiance_wm2: 800,
        weather_condition: 'sunny',
        plant_name: 'Mazi Green Energy Solar Plant',
        capacity_mw: 2.0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get historical performance data
router.get('/performance/history', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, interval = 'hour' } = req.query;

    // Return sample data for testing
    res.json({
      history: [
        {
          time_period: startDate,
          avg_power_generation: 1800,
          avg_efficiency: 85.5,
          avg_temperature: 25.0,
          avg_irradiance: 800,
          data_points: 24
        }
      ],
      interval,
      startDate,
      endDate
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get SCADA system status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      systemStatus: 'operational',
      scadaData: {
        id: 1,
        plant_id: 1,
        timestamp: new Date().toISOString(),
        inverter_status: 'running',
        grid_voltage: 240.0,
        grid_frequency: 50.0,
        power_factor: 0.95,
        fault_codes: null,
        plant_name: 'Mazi Green Energy Solar Plant'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SCADA status error:', error);
    res.status(500).json({ error: 'Failed to fetch SCADA status' });
  }
});

// Get system alerts and faults
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    // Return sample data for testing
    res.json({
      alerts: [
        {
          timestamp: new Date().toISOString(),
          severity: 'info',
          message: 'All systems operating normally',
          details: {
            fault_codes: null,
            inverter_status: 'running',
            grid_voltage: 240.0,
            grid_frequency: 50.0,
            plant_name: 'Mazi Green Energy Solar Plant'
          }
        }
      ],
      totalAlerts: 1
    });

  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Manual SCADA data fetch (for testing/debugging)
router.post('/fetch-data', authenticateToken, async (req, res) => {
  try {
    // For testing, just return success
    res.json({
      message: 'SCADA data fetched successfully',
      recordsProcessed: 2,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Manual SCADA fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch SCADA data' });
  }
});

module.exports = router;
