const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Choose database based on environment
let getConnection;
if (process.env.DATABASE_URL) {
  getConnection = require('../database/init').getConnection;
} else {
  getConnection = require('../database/local').getConnection;
}

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'local-test-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Investor registration
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('investmentAmount').isNumeric().toFloat(),
  body('investmentDate').isDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, investmentAmount, investmentDate } = req.body;
    const db = getConnection();

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const pool = db;
      
      // Check if investor already exists
      const existingInvestor = await pool.query(
        'SELECT id FROM investors WHERE email = $1',
        [email]
      );

      if (existingInvestor.rows.length > 0) {
        return res.status(400).json({ error: 'Investor with this email already exists' });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create new investor
      const newInvestor = await pool.query(`
        INSERT INTO investors (email, password_hash, first_name, last_name, investment_amount, investment_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, investment_amount, investment_date, role, created_at
      `, [email, passwordHash, firstName, lastName, investmentAmount, investmentDate]);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newInvestor.rows[0].id, 
          email: newInvestor.rows[0].email,
          role: newInvestor.rows[0].role 
        },
        process.env.JWT_SECRET || 'local-test-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Investor registered successfully',
        investor: newInvestor.rows[0],
        token
      });
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        // Check if investor already exists
        db.get('SELECT id FROM investors WHERE email = ?', [email], async (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (row) {
            res.status(400).json({ error: 'Investor with this email already exists' });
            resolve();
            return;
          }

          // Hash password
          const saltRounds = 12;
          const passwordHash = await bcrypt.hash(password, saltRounds);

          // Create new investor
          db.run(`
            INSERT INTO investors (email, password_hash, first_name, last_name, investment_amount, investment_date)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [email, passwordHash, firstName, lastName, investmentAmount, investmentDate], function(err) {
            if (err) {
              reject(err);
              return;
            }

            // Get the created investor
            db.get('SELECT * FROM investors WHERE id = ?', [this.lastID], (err, investor) => {
              if (err) {
                reject(err);
                return;
              }

              // Generate JWT token
              const token = jwt.sign(
                { 
                  id: investor.id, 
                  email: investor.email,
                  role: investor.role 
                },
                process.env.JWT_SECRET || 'local-test-secret',
                { expiresIn: '7d' }
              );

              res.status(201).json({
                message: 'Investor registered successfully',
                investor: investor,
                token
              });
              resolve();
            });
          });
        });
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register investor' });
  }
});

// Investor login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getConnection();

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const pool = db;
      
      // Find investor by email
      const investor = await pool.query(
        'SELECT * FROM investors WHERE email = $1 AND is_active = true',
        [email]
      );

      if (investor.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const investorData = investor.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, investorData.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: investorData.id, 
          email: investorData.email,
          role: investorData.role 
        },
        process.env.JWT_SECRET || 'local-test-secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        investor: {
          id: investorData.id,
          email: investorData.email,
          firstName: investorData.first_name,
          lastName: investorData.last_name,
          investmentAmount: investorData.investment_amount,
          role: investorData.role
        },
        token
      });
    } else {
      // SQLite
      await new Promise((resolve, reject) => {
        db.get('SELECT * FROM investors WHERE email = ? AND is_active = 1', [email], async (err, investor) => {
          if (err) {
            console.error('DB error:', err);
            reject(err);
            return;
          }

          console.log('Investor found:', investor);

          if (!investor) {
            res.status(401).json({ error: 'Invalid credentials' });
            resolve();
            return;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, investor.password_hash);
          console.log('Is password valid?', isValidPassword);
          if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            resolve();
            return;
          }

          // Generate JWT token
          const token = jwt.sign(
            { 
              id: investor.id, 
              email: investor.email,
              role: investor.role 
            },
            process.env.JWT_SECRET || 'local-test-secret',
            { expiresIn: '7d' }
          );

          res.json({
            message: 'Login successful',
            investor: {
              id: investor.id,
              email: investor.email,
              firstName: investor.first_name,
              lastName: investor.last_name,
              investmentAmount: investor.investment_amount,
              role: investor.role
            },
            token
          });
          resolve();
        });
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current investor profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = getConnection();

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const pool = db;
      const investor = await pool.query(
        'SELECT id, email, first_name, last_name, investment_amount, investment_date, role, created_at FROM investors WHERE id = $1',
        [req.user.id]
      );

      if (investor.rows.length === 0) {
        return res.status(404).json({ error: 'Investor not found' });
      }

      res.json({
        investor: investor.rows[0]
      });
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        db.get('SELECT id, email, first_name, last_name, investment_amount, investment_date, role, created_at FROM investors WHERE id = ?', [req.user.id], (err, investor) => {
          if (err) {
            reject(err);
            return;
          }

          if (!investor) {
            res.status(404).json({ error: 'Investor not found' });
            resolve();
            return;
          }

          res.json({
            investor: investor
          });
          resolve();
        });
      });
    }

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const db = getConnection();

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const pool = db;
      
      // Get current password hash
      const investor = await pool.query(
        'SELECT password_hash FROM investors WHERE id = $1',
        [req.user.id]
      );

      if (investor.rows.length === 0) {
        return res.status(404).json({ error: 'Investor not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, investor.rows[0].password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await pool.query(
        'UPDATE investors SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, req.user.id]
      );

      res.json({ message: 'Password changed successfully' });
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        db.get('SELECT password_hash FROM investors WHERE id = ?', [req.user.id], async (err, investor) => {
          if (err) {
            reject(err);
            return;
          }

          if (!investor) {
            res.status(404).json({ error: 'Investor not found' });
            resolve();
            return;
          }

          // Verify current password
          const isValidPassword = await bcrypt.compare(currentPassword, investor.password_hash);
          if (!isValidPassword) {
            res.status(400).json({ error: 'Current password is incorrect' });
            resolve();
            return;
          }

          // Hash new password
          const saltRounds = 12;
          const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

          // Update password
          db.run('UPDATE investors SET password_hash = ? WHERE id = ?', [newPasswordHash, req.user.id], (err) => {
            if (err) {
              reject(err);
              return;
            }

            res.json({ message: 'Password changed successfully' });
            resolve();
          });
        });
      });
    }

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
