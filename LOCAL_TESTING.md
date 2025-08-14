# 🧪 Local Testing Guide - Mazi Green Energy

This guide will help you test the solar plant monitoring platform locally without needing external services.

## 🚀 **Quick Start for Local Testing**

### **1. Environment Setup**
The platform automatically detects your environment:
- **No DATABASE_URL** = Uses local SQLite database
- **With DATABASE_URL** = Uses PostgreSQL (production)

### **2. Start the Development Servers**

```bash
# Start both backend and frontend
npm run dev

# Or start them separately:
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
```

### **3. Access Points**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **WebSocket**: ws://localhost:5000

## 🔐 **Test Accounts**

### **Pre-loaded Test Investor**
- **Email**: `test@mazigreen.com`
- **Password**: `test123`
- **Investment**: $50,000
- **Role**: Investor

### **Create New Test Account**
1. Go to http://localhost:3000/register
2. Fill in your details
3. Use any investment amount (e.g., $25,000)
4. Login with your new account

## 📊 **What You Can Test**

### **Dashboard Features**
- ✅ Real-time plant performance metrics
- ✅ Financial summary and charts
- ✅ Investor portfolio overview
- ✅ System status monitoring

### **Plant Monitoring**
- ✅ Current power generation
- ✅ Efficiency tracking
- ✅ Weather conditions
- ✅ SCADA system status

### **Financial Tracking**
- ✅ P&L calculations
- ✅ O&M cost monitoring
- ✅ Loan repayment tracking
- ✅ Investor returns

### **Investor Portal**
- ✅ Individual portfolio view
- ✅ Investment performance
- ✅ Document management
- ✅ Profile updates

## 🗄️ **Local Database (SQLite)**

### **Location**
- Database file: `server/database/mazi_green_energy.db`
- Automatically created on first run
- Contains sample data for testing

### **Sample Data Included**
- 1 solar plant (2 MW capacity)
- 1 test investor account
- Sample financial records
- Sample performance data
- Loan information

### **Reset Database**
```bash
# Delete the database file to start fresh
rm server/database/mazi_green_energy.db

# Restart the server - it will recreate everything
npm run server
```

## 🔧 **Testing Different Scenarios**

### **1. Investor Registration & Login**
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newinvestor@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "investmentAmount": 75000,
    "investmentDate": "2024-01-15"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newinvestor@test.com",
    "password": "password123"
  }'
```

### **2. Plant Performance Data**
```bash
# Get current performance (requires auth token)
curl -X GET http://localhost:5000/api/scada/performance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **3. Financial Data**
```bash
# Get financial summary (requires auth token)
curl -X GET http://localhost:5000/api/financial/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🌐 **Frontend Testing**

### **Browser Testing**
1. **Chrome DevTools**: Check console for errors
2. **Network Tab**: Monitor API calls
3. **Application Tab**: Check localStorage for tokens
4. **Responsive Design**: Test on different screen sizes

### **Common Test Flows**
1. **Registration Flow**
   - Fill out registration form
   - Verify validation messages
   - Check successful redirect

2. **Login Flow**
   - Use test account credentials
   - Verify token storage
   - Check dashboard access

3. **Dashboard Navigation**
   - Click through different sections
   - Test real-time updates
   - Verify chart rendering

## 🐛 **Troubleshooting Local Issues**

### **Common Problems**

#### **1. Port Already in Use**
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process
kill -9 PID_NUMBER
```

#### **2. Database Locked**
```bash
# SQLite database might be locked
# Restart the server
npm run server
```

#### **3. Frontend Build Issues**
```bash
# Clear node_modules and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

#### **4. Backend Dependencies**
```bash
# Reinstall backend dependencies
cd server
rm -rf node_modules package-lock.json
npm install
```

### **Debug Mode**
```bash
# Backend with detailed logging
cd server
DEBUG=* npm run dev

# Frontend with React DevTools
cd client
REACT_APP_DEBUG=true npm start
```

## 📱 **Mobile Testing**

### **Local Network Access**
```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile device
http://YOUR_LOCAL_IP:3000
```

### **Responsive Testing**
- Test on different screen sizes
- Verify mobile navigation
- Check touch interactions

## 🔒 **Security Testing**

### **Authentication Tests**
- ✅ Valid login credentials
- ❌ Invalid login credentials
- ❌ Missing authentication tokens
- ❌ Expired tokens

### **Authorization Tests**
- ✅ Access to own data
- ❌ Access to other user data
- ❌ Admin-only endpoints

## 📈 **Performance Testing**

### **Load Testing**
```bash
# Install Apache Bench
brew install httpd

# Test API endpoints
ab -n 100 -c 10 http://localhost:5000/health
```

### **Memory Usage**
```bash
# Monitor Node.js process
top -pid $(pgrep node)
```

## 🧹 **Cleanup**

### **Stop Servers**
```bash
# Stop both servers
Ctrl+C in the terminal running npm run dev

# Or kill processes
pkill -f "node.*server"
pkill -f "react-scripts"
```

### **Reset Everything**
```bash
# Remove all generated files
rm -rf server/database/*.db
rm -rf client/build
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules

# Reinstall and restart
./setup.sh
npm run dev
```

## 🎯 **Testing Checklist**

- [ ] Backend server starts without errors
- [ ] Frontend builds and runs successfully
- [ ] Database tables are created
- [ ] Test investor can login
- [ ] Dashboard loads with data
- [ ] Charts render correctly
- [ ] Navigation works between pages
- [ ] Real-time updates function
- [ ] API endpoints respond correctly
- [ ] Error handling works
- [ ] Mobile responsiveness
- [ ] Security features active

## 🆘 **Need Help?**

### **Check Logs**
- Backend: Terminal running `npm run server`
- Frontend: Browser console
- Database: Check SQLite file permissions

### **Common Solutions**
1. **Restart servers** - Often fixes most issues
2. **Clear browser cache** - Fixes frontend issues
3. **Check file permissions** - Fixes database issues
4. **Verify Node.js version** - Should be 16+

---

**Happy Testing! 🌞** The Mazi Green Energy platform is designed to work seamlessly in local development mode.
