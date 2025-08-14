const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;

// Setup WebSocket server
function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection established');

    // Handle authentication
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'authenticate') {
          // Verify JWT token
          try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            ws.userId = decoded.id;
            ws.userRole = decoded.role;
            ws.isAuthenticated = true;
            
            // Send authentication success
            ws.send(JSON.stringify({
              type: 'authentication',
              status: 'success',
              userId: decoded.id,
              role: decoded.role
            }));
            
            console.log(`✅ WebSocket authenticated for user ${decoded.id}`);
            
            // Send initial data
            await sendInitialData(ws);
            
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'authentication',
              status: 'error',
              message: 'Invalid token'
            }));
            ws.close();
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('✅ WebSocket server setup complete');
}

// Send initial data to newly connected client
async function sendInitialData(ws) {
  try {
    // Send plant status
    const plantStatus = await getPlantStatus();
    ws.send(JSON.stringify({
      type: 'plant_status',
      data: plantStatus
    }));

    // Send financial summary
    const financialSummary = await getFinancialSummary();
    ws.send(JSON.stringify({
      type: 'financial_summary',
      data: financialSummary
    }));

  } catch (error) {
    console.error('Error sending initial data:', error);
  }
}

// Broadcast message to all connected clients
function broadcast(message) {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
      client.send(JSON.stringify(message));
    }
  });
}

// Broadcast to specific user
function broadcastToUser(userId, message) {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && 
        client.isAuthenticated && 
        client.userId === userId) {
      client.send(JSON.stringify(message));
    }
  });
}

// Broadcast to admin users only
function broadcastToAdmins(message) {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && 
        client.isAuthenticated && 
        client.userRole === 'admin') {
      client.send(JSON.stringify(message));
    }
  });
}

// Send plant performance update
function sendPlantPerformanceUpdate(performanceData) {
  broadcast({
    type: 'plant_performance_update',
    timestamp: new Date().toISOString(),
    data: performanceData
  });
}

// Send financial update
function sendFinancialUpdate(financialData) {
  broadcast({
    type: 'financial_update',
    timestamp: new Date().toISOString(),
    data: financialData
  });
}

// Send system alert
function sendSystemAlert(alertData) {
  broadcast({
    type: 'system_alert',
    timestamp: new Date().toISOString(),
    data: alertData
  });
}

// Send investor-specific update
function sendInvestorUpdate(userId, updateData) {
  broadcastToUser(userId, {
    type: 'investor_update',
    timestamp: new Date().toISOString(),
    data: updateData
  });
}

// Get plant status for WebSocket
async function getPlantStatus() {
  try {
    const { getConnection } = require('./database/init');
    const pool = getConnection();
    
    // Get latest performance data
    const performance = await pool.query(`
      SELECT p.*, pl.name as plant_name, pl.capacity_mw
      FROM performance p
      JOIN plants pl ON p.plant_id = pl.id
      WHERE p.plant_id = $1
      ORDER BY p.timestamp DESC
      LIMIT 1
    `, [1]);

    // Get latest SCADA data
    const scada = await pool.query(`
      SELECT s.*, pl.name as plant_name
      FROM scada_data s
      JOIN plants pl ON s.plant_id = pl.id
      WHERE s.plant_id = $1
      ORDER BY s.timestamp DESC
      LIMIT 1
    `, [1]);

    return {
      performance: performance.rows[0] || null,
      scada: scada.rows[0] || null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting plant status for WebSocket:', error);
    return null;
  }
}

// Get financial summary for WebSocket
async function getFinancialSummary() {
  try {
    const { getConnection } = require('./database/init');
    const pool = getConnection();
    
    // Get current month's financial data
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const financialSummary = await pool.query(`
      SELECT 
        COALESCE(SUM(revenue), 0) as total_revenue,
        COALESCE(SUM(net_profit), 0) as total_net_profit
      FROM financials 
      WHERE plant_id = $1 
        AND date >= $2 
        AND date <= $3
    `, [1, startOfMonth, endOfMonth]);

    return {
      currentMonth: {
        revenue: financialSummary.rows[0].total_revenue,
        netProfit: financialSummary.rows[0].total_net_profit
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting financial summary for WebSocket:', error);
    return null;
  }
}

// Get connection count
function getConnectionCount() {
  if (!wss) return 0;
  
  let count = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
      count++;
    }
  });
  return count;
}

// Health check for WebSocket server
function getWebSocketHealth() {
  if (!wss) {
    return {
      status: 'not_initialized',
      connections: 0,
      timestamp: new Date().toISOString()
    };
  }

  return {
    status: 'running',
    connections: getConnectionCount(),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  setupWebSocket,
  broadcast,
  broadcastToUser,
  broadcastToAdmins,
  sendPlantPerformanceUpdate,
  sendFinancialUpdate,
  sendSystemAlert,
  sendInvestorUpdate,
  getConnectionCount,
  getWebSocketHealth
};
