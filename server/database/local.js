const path = require('path');

// Local SQLite database for testing
const dbPath = path.join(__dirname, 'mazi_green_energy.db');
let db;

// Initialize local database tables
async function initializeLocalDatabase() {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(dbPath);
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS plants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          capacity_mw REAL NOT NULL,
          location TEXT,
          installation_date TEXT,
          status TEXT DEFAULT 'active',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS investors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          investment_amount REAL NOT NULL,
          investment_date TEXT NOT NULL,
          role TEXT DEFAULT 'investor',
          is_active INTEGER DEFAULT 1,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS financials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER,
          date TEXT NOT NULL,
          revenue REAL DEFAULT 0,
          electricity_cost REAL DEFAULT 0,
          maintenance_cost REAL DEFAULT 0,
          loan_payment REAL DEFAULT 0,
          other_costs REAL DEFAULT 0,
          net_profit REAL GENERATED ALWAYS AS (revenue - electricity_cost - maintenance_cost - loan_payment - other_costs) VIRTUAL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plant_id) REFERENCES plants (id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS performance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER,
          timestamp TEXT NOT NULL,
          power_generation_kw REAL,
          efficiency_percentage REAL,
          temperature_celsius REAL,
          irradiance_wm2 REAL,
          weather_condition TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plant_id) REFERENCES plants (id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS scada_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER,
          timestamp TEXT NOT NULL,
          inverter_status TEXT,
          grid_voltage REAL,
          grid_frequency REAL,
          power_factor REAL,
          fault_codes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plant_id) REFERENCES plants (id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_type TEXT,
          category TEXT,
          uploaded_by INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES investors (id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS loans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER,
          principal_amount REAL NOT NULL,
          interest_rate REAL NOT NULL,
          term_months INTEGER NOT NULL,
          start_date TEXT NOT NULL,
          monthly_payment REAL NOT NULL,
          remaining_balance REAL NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plant_id) REFERENCES plants (id)
        )
      `);

      // Insert sample data
      db.run(`
        INSERT OR IGNORE INTO plants (id, name, capacity_mw, location, installation_date)
        VALUES (1, 'Mazi Green Energy Solar Plant', 2.0, 'Mazi, Kenya', date('now'))
      `);

      db.run(`
        INSERT OR IGNORE INTO loans (plant_id, principal_amount, interest_rate, term_months, start_date, monthly_payment, remaining_balance)
        VALUES (1, 1500000.00, 8.5, 60, date('now'), 30750.00, 1500000.00)
      `);

      // Insert sample investor for testing
      const bcrypt = require('bcryptjs');
      const testPassword = bcrypt.hashSync('test123', 12);
      
      db.run(`
        INSERT OR IGNORE INTO investors (email, password_hash, first_name, last_name, investment_amount, investment_date, role, is_active)
        VALUES ('test@mazigreen.com', ?, 'Test', 'Investor', 50000, date('now'), 'investor', 1)
      `, [testPassword]);

      // Insert sample financial data
      db.run(`
        INSERT OR IGNORE INTO financials (plant_id, date, revenue, electricity_cost, maintenance_cost, loan_payment, other_costs)
        VALUES (1, date('now'), 5000, 500, 200, 1000, 100)
      `);

      // Insert sample performance data
      db.run(`
        INSERT OR IGNORE INTO performance (plant_id, timestamp, power_generation_kw, efficiency_percentage, temperature_celsius, irradiance_wm2, weather_condition)
        VALUES (1, datetime('now'), 1800, 85.5, 25.0, 800, 'sunny')
      `);

      console.log('✅ Local SQLite database initialized successfully');
      resolve();
    });
  });
}

// Get database connection
function getConnection() {
  if (!db) {
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database(dbPath);
  }
  return db;
}

// Close database connection
function closeConnection() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initializeLocalDatabase,
  getConnection,
  closeConnection
};
