const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create tables if they don't exist
    await client.query(`
      -- Plants table
      CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        capacity_mw DECIMAL(5,2) NOT NULL,
        location VARCHAR(500),
        installation_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Investors table
      CREATE TABLE IF NOT EXISTS investors (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        investment_amount DECIMAL(12,2) NOT NULL,
        investment_date DATE NOT NULL,
        role VARCHAR(50) DEFAULT 'investor',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Financial records table
      CREATE TABLE IF NOT EXISTS financials (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER REFERENCES plants(id),
        date DATE NOT NULL,
        revenue DECIMAL(12,2) DEFAULT 0,
        electricity_cost DECIMAL(12,2) DEFAULT 0,
        maintenance_cost DECIMAL(12,2) DEFAULT 0,
        loan_payment DECIMAL(12,2) DEFAULT 0,
        other_costs DECIMAL(12,2) DEFAULT 0,
        net_profit DECIMAL(12,2) GENERATED ALWAYS AS (
          revenue - electricity_cost - maintenance_cost - loan_payment - other_costs
        ) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Plant performance table
      CREATE TABLE IF NOT EXISTS performance (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER REFERENCES plants(id),
        timestamp TIMESTAMP NOT NULL,
        power_generation_kw DECIMAL(8,2),
        efficiency_percentage DECIMAL(5,2),
        temperature_celsius DECIMAL(5,2),
        irradiance_wm2 DECIMAL(6,2),
        weather_condition VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- SCADA data table
      CREATE TABLE IF NOT EXISTS scada_data (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER REFERENCES plants(id),
        timestamp TIMESTAMP NOT NULL,
        inverter_status VARCHAR(50),
        grid_voltage DECIMAL(6,2),
        grid_frequency DECIMAL(5,2),
        power_factor DECIMAL(3,2),
        fault_codes TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Documents table
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50),
        category VARCHAR(100),
        uploaded_by INTEGER REFERENCES investors(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Loan tracking table
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER REFERENCES plants(id),
        principal_amount DECIMAL(12,2) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        term_months INTEGER NOT NULL,
        start_date DATE NOT NULL,
        monthly_payment DECIMAL(10,2) NOT NULL,
        remaining_balance DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance(timestamp);
      CREATE INDEX IF NOT EXISTS idx_scada_timestamp ON scada_data(timestamp);
      CREATE INDEX IF NOT EXISTS idx_financials_date ON financials(date);
      CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
    `);

    // Insert default plant data
    await client.query(`
      INSERT INTO plants (name, capacity_mw, location, installation_date)
      VALUES ('Mazi Green Energy Solar Plant', 2.0, 'Mazi, Kenya', CURRENT_DATE)
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample loan data
    await client.query(`
      INSERT INTO loans (plant_id, principal_amount, interest_rate, term_months, start_date, monthly_payment, remaining_balance)
      VALUES (1, 1500000.00, 8.5, 60, CURRENT_DATE, 30750.00, 1500000.00)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Database tables created successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get database connection
function getConnection() {
  return pool;
}

module.exports = {
  initializeDatabase,
  getConnection,
  pool
};
