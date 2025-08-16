const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        console.log(`[Login Attempt] Received login request for email: ${email}`);
        db.get('SELECT * FROM investors WHERE email = ? AND is_active = 1', [email], async (err, investor) => {
          if (err) {
            console.error('[Login Error] Database query failed:', err);
            reject(err);
            return;
          }

          if (!investor) {
            console.log(`[Login Failure] No active user found for email: ${email}`);
            res.status(401).json({ error: 'Invalid credentials' });
            resolve();
            return;
          }

          console.log(`[Login Info] User found for email: ${email}. Comparing passwords...`);

          // Verify password
          const isValidPassword = await bcrypt.compare(password, investor.password_hash);
          if (!isValidPassword) {
            console.log(`[Login Failure] Invalid password for email: ${email}`);
            res.status(401).json({ error: 'Invalid credentials' });
            resolve();
            return;
          }

          console.log(`[Login Success] Password verified for email: ${email}. Generating token...`);

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

// Google login
router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  console.log('[Google Login] Received token:', token);
  console.log('[Google Login] Verifying with Client ID:', process.env.GOOGLE_CLIENT_ID);
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log('[Google Login] Token verified successfully. Payload:', payload);
    const { name, email, picture } = payload;
    
    const db = getConnection();
    
    // Check if user exists
    db.get('SELECT * FROM investors WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        // User exists, log them in
        const jwtToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'local-test-secret',
          { expiresIn: '7d' }
        );
        res.json({
          message: 'Login successful',
          investor: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            investmentAmount: user.investment_amount,
            role: user.role
          },
          token: jwtToken
        });
      } else {
        // User doesn't exist, create a new one
        const [firstName, ...lastName] = name.split(' ');
        const dummyPassword = `google-login-${Date.now()}`;
        const passwordHash = await bcrypt.hash(dummyPassword, 12);
        db.run(
          'INSERT INTO investors (email, password_hash, first_name, last_name, investment_amount, investment_date) VALUES (?, ?, ?, ?, ?, ?)',
          [email, passwordHash, firstName, lastName.join(' '), 0, new Date().toISOString()],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create user' });
            }
            const newUserId = this.lastID;
            const jwtToken = jwt.sign(
              { id: newUserId, email, role: 'investor' },
              process.env.JWT_SECRET || 'local-test-secret',
              { expiresIn: '7d' }
            );
            res.status(201).json({
              message: 'User created and logged in',
              investor: {
                id: newUserId,
                email,
                firstName,
                lastName: lastName.join(' '),
                investmentAmount: 0,
                role: 'investor'
              },
              token: jwtToken
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ error: 'Invalid Google token' });
  }
});

module.exports = router;
