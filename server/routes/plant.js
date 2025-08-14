const express = require('express');

// Choose database based on environment
let getConnection;
if (process.env.DATABASE_URL) {
  getConnection = require('../database/init').getConnection;
} else {
  getConnection = require('../database/local').getConnection;
}

const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get plant information
router.get('/info', authenticateToken, async (req, res) => {
  try {
    const db = getConnection();
    
    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const pool = db;
      const plantInfo = await pool.query(`
        SELECT 
          id,
          name,
          capacity_mw,
          location,
          installation_date,
          status,
          created_at
        FROM plants 
        WHERE id = $1
      `, [1]);

      if (plantInfo.rows.length === 0) {
        return res.status(404).json({ error: 'Plant not found' });
      }

      res.json({
        plant: plantInfo.rows[0]
      });
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            id,
            name,
            capacity_mw,
            location,
            installation_date,
            status,
            created_at
          FROM plants 
          WHERE id = ?
        `, [1], (err, plant) => {
          if (err) {
            reject(err);
            return;
          }

          if (!plant) {
            res.status(404).json({ error: 'Plant not found' });
            resolve();
            return;
          }

          res.json({
            plant: plant
          });
          resolve();
        });
      });
    }

  } catch (error) {
    console.error('Plant info error:', error);
    res.status(500).json({ error: 'Failed to fetch plant information' });
  }
});

// Update plant information
router.put('/info', authenticateToken, async (req, res) => {
  try {
    const { name, location, status } = req.body;
    const db = getConnection();

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const pool = db;
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${++paramCount}`);
        updateValues.push(name);
      }
      if (location !== undefined) {
        updateFields.push(`location = $${++paramCount}`);
        updateValues.push(location);
      }
      if (status !== undefined) {
        updateFields.push(`status = $${++paramCount}`);
        updateValues.push(status);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateValues.unshift(1); // plant_id

      const updateQuery = `
        UPDATE plants 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const updatedPlant = await pool.query(updateQuery, updateValues);

      res.json({
        message: 'Plant information updated successfully',
        plant: updatedPlant.rows[0]
      });
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (name !== undefined) {
          updateFields.push(`name = ?`);
          updateValues.push(name);
        }
        if (location !== undefined) {
          updateFields.push(`location = ?`);
          updateValues.push(location);
        }
        if (status !== undefined) {
          updateFields.push(`status = ?`);
          updateValues.push(status);
        }

        if (updateFields.length === 0) {
          res.status(400).json({ error: 'No fields to update' });
          resolve();
          return;
        }

        updateValues.push(1); // plant_id

        const updateQuery = `
          UPDATE plants 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `;

        db.run(updateQuery, updateValues, function(err) {
          if (err) {
            reject(err);
            return;
          }

          // Get updated plant
          db.get('SELECT * FROM plants WHERE id = ?', [1], (err, plant) => {
            if (err) {
              reject(err);
              return;
            }

            res.json({
              message: 'Plant information updated successfully',
              plant: plant
            });
            resolve();
          });
        });
      });
    }

  } catch (error) {
    console.error('Update plant error:', error);
    res.status(500).json({ error: 'Failed to update plant information' });
  }
});

// Get plant statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const db = getConnection();
    
    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const pool = db;
      
      // Get total investors
      const investorCount = await pool.query(`
        SELECT COUNT(*) as total_investors
        FROM investors 
        WHERE is_active = true
      `);

      // Get total investment amount
      const totalInvestment = await pool.query(`
        SELECT SUM(investment_amount) as total_investment
        FROM investors 
        WHERE is_active = true
      `);

      // Get current month generation
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const monthlyGeneration = await pool.query(`
        SELECT 
          COALESCE(SUM(power_generation_kw), 0) as total_generation_kwh,
          COALESCE(AVG(efficiency_percentage), 0) as avg_efficiency
        FROM performance 
        WHERE plant_id = $1 
          AND timestamp >= $2 
          AND timestamp <= $3
      `, [1, startOfMonth, endOfMonth]);

      // Get year-to-date generation
      const startOfYear = new Date(currentMonth.getFullYear(), 0, 1);
      const ytdGeneration = await pool.query(`
        SELECT 
          COALESCE(SUM(power_generation_kw), 0) as ytd_generation_kwh
        FROM performance 
        WHERE plant_id = $1 
          AND timestamp >= $2
      `, [1, startOfYear]);

      const stats = {
        totalInvestors: investorCount.rows[0].total_investors,
        totalInvestment: totalInvestment.rows[0].total_investment || 0,
        currentMonth: {
          generationKWh: monthlyGeneration.rows[0].total_generation_kwh,
          avgEfficiency: monthlyGeneration.rows[0].avg_efficiency
        },
        yearToDate: {
          generationKWh: ytdGeneration.rows[0].ytd_generation_kwh
        }
      };

      res.json({ stats });
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        // Get total investors
        db.get('SELECT COUNT(*) as total_investors FROM investors WHERE is_active = 1', (err, investorCount) => {
          if (err) {
            reject(err);
            return;
          }

          // Get total investment amount
          db.get('SELECT SUM(investment_amount) as total_investment FROM investors WHERE is_active = 1', (err, totalInvestment) => {
            if (err) {
              reject(err);
              return;
            }

            // Get current month generation
            const currentMonth = new Date();
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            db.get(`
              SELECT 
                COALESCE(SUM(power_generation_kw), 0) as total_generation_kwh,
                COALESCE(AVG(efficiency_percentage), 0) as avg_efficiency
              FROM performance 
              WHERE plant_id = ? 
                AND timestamp >= ? 
                AND timestamp <= ?
            `, [1, startOfMonth.toISOString(), endOfMonth.toISOString()], (err, monthlyGeneration) => {
              if (err) {
                reject(err);
                return;
              }

              // Get year-to-date generation
              const startOfYear = new Date(currentMonth.getFullYear(), 0, 1);
              db.get(`
                SELECT 
                  COALESCE(SUM(power_generation_kw), 0) as ytd_generation_kwh
                FROM performance 
                WHERE plant_id = ? 
                  AND timestamp >= ?
              `, [1, startOfYear.toISOString()], (err, ytdGeneration) => {
                if (err) {
                  reject(err);
                  return;
                }

                const stats = {
                  totalInvestors: investorCount.total_investors,
                  totalInvestment: totalInvestment.total_investment || 0,
                  currentMonth: {
                    generationKWh: monthlyGeneration.total_generation_kwh,
                    avgEfficiency: monthlyGeneration.avg_efficiency
                  },
                  yearToDate: {
                    generationKWh: ytdGeneration.ytd_generation_kwh
                  }
                };

                res.json({ stats });
                resolve();
              });
            });
          });
        });
      });
    }

  } catch (error) {
    console.error('Plant stats error:', error);
    res.status(500).json({ error: 'Failed to fetch plant information' });
  }
});

module.exports = router;
