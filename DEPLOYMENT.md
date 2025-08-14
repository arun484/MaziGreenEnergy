# Mazi Green Energy - Deployment Guide

This guide will help you deploy the Mazi Green Energy solar plant monitoring platform using free hosting services.

## 🚀 Quick Start

### 1. Prerequisites
- GitHub account
- Supabase account (free tier)
- Vercel account (free tier)
- Render account (free tier)

### 2. Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up/Login and create new project
   - Choose free tier
   - Note your project URL and API key

2. **Get Database Connection String**
   - Go to Settings > Database
   - Copy the connection string
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`

### 3. Backend Deployment (Render)

1. **Connect GitHub Repository**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" > "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**
   - **Name**: `mazi-green-energy-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Environment Variables**
   ```
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.vercel.app
   SCADA_BASE_URL=https://api.scada-system.com
   SCADA_API_KEY=your_scada_api_key
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL

### 4. Frontend Deployment (Vercel)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Frontend**
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Note your frontend URL

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app

# SCADA
SCADA_BASE_URL=https://api.scada-system.com
SCADA_API_KEY=your_scada_api_key
SCADA_POLL_INTERVAL=300000

# Optional
WEATHER_API_KEY=your_weather_api_key
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### SCADA Integration

1. **Configure SCADA System**
   - Update `SCADA_BASE_URL` in backend environment
   - Add your SCADA API key
   - Test connection with `/api/scada/status` endpoint

2. **Data Polling**
   - Backend automatically polls SCADA every 5 minutes
   - Adjust `SCADA_POLL_INTERVAL` as needed
   - Monitor logs for connection issues

## 📊 Database Management

### Initial Setup
The database tables are automatically created when the backend starts for the first time.

### Sample Data
```sql
-- Insert sample investor (admin)
INSERT INTO investors (email, password_hash, first_name, last_name, investment_amount, investment_date, role)
VALUES ('admin@mazigreen.com', '$2a$12$...', 'Admin', 'User', 100000, CURRENT_DATE, 'admin');

-- Insert sample financial data
INSERT INTO financials (plant_id, date, revenue, electricity_cost, maintenance_cost, loan_payment, other_costs)
VALUES (1, CURRENT_DATE, 5000, 500, 200, 1000, 100);
```

### Backup Strategy
- Supabase provides automatic daily backups
- Export data monthly: `pg_dump` command
- Store backups securely

## 🔒 Security Considerations

### JWT Configuration
- Use strong, unique JWT secret
- Set appropriate expiration times
- Rotate secrets periodically

### API Security
- Rate limiting enabled (100 requests/15min)
- CORS configured for production domains
- Input validation on all endpoints

### Database Security
- Use connection pooling
- Implement row-level security if needed
- Regular security updates

## 📈 Monitoring & Maintenance

### Health Checks
- Backend: `https://your-backend-url.onrender.com/health`
- Frontend: Built-in error boundaries
- Database: Connection pool monitoring

### Logs
- Render provides built-in logging
- Vercel provides function logs
- Monitor for errors and performance

### Performance
- Database indexes on frequently queried fields
- API response caching where appropriate
- Image optimization for frontend

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify Supabase project is active
   - Check firewall settings

2. **JWT Authentication Failed**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear browser localStorage

3. **SCADA Connection Issues**
   - Verify API key and URL
   - Check network connectivity
   - Review SCADA system logs

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json
   - Check build logs for specific errors

### Support
- Check application logs in Render/Vercel
- Review browser console for frontend errors
- Test API endpoints with Postman/curl

## 💰 Cost Optimization

### Free Tier Limits
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Render**: 750 hours/month, 15-minute sleep after inactivity
- **Vercel**: 100GB bandwidth/month, serverless functions

### Scaling Considerations
- Monitor database size and bandwidth usage
- Implement data archiving for old records
- Use CDN for static assets

## 🔄 Updates & Maintenance

### Regular Tasks
- Monthly security updates
- Quarterly performance reviews
- Annual backup verification

### Deployment Process
1. Update code in GitHub
2. Automatic deployment to staging
3. Test functionality
4. Deploy to production
5. Monitor for issues

## 📞 Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Community
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- Solar energy forums for industry insights

---

**Mazi Green Energy** - Powering the future with sustainable energy investments.
