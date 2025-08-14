# Mazi Green Energy - Solar Power Plant Monitoring Platform

A comprehensive web platform for monitoring a 2 MW solar power plant and tracking financial performance for 30+ individual investors.

## 🌟 Features

### Plant Monitoring
- Real-time SCADA integration for live plant data
- Solar panel performance metrics
- Weather data integration
- Power generation tracking
- System health monitoring

### Financial Dashboard
- Profit & Loss tracking
- Operation & Maintenance cost monitoring
- Bank loan repayment tracking
- Investor returns calculation
- Revenue projections

### Investor Portal
- Secure authentication for 30+ investors
- Individual investment tracking
- Performance reports
- Document management

## 🚀 Tech Stack (Free Tier)

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase free tier)
- **Real-time**: WebSocket connections
- **Hosting**: Vercel (frontend) + Render (backend)
- **Charts**: Chart.js
- **Authentication**: JWT

## 📁 Project Structure

```
mazi-green-energy/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── docs/                   # Documentation
└── database/               # Database schemas
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mazi-green-energy
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Configure database and API keys

4. **Start development**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: Supabase PostgreSQL connection
- `JWT_SECRET`: Authentication secret
- `SCADA_API_KEY`: SCADA system API key
- `WEATHER_API_KEY`: Weather service API key

### SCADA Integration
- Configure SCADA system endpoints
- Set up data polling intervals
- Map data fields to database schema

## 📊 Database Schema

- **Plants**: Solar plant information
- **Investors**: Individual investor details
- **Financials**: P&L, costs, loan data
- **Performance**: Real-time plant metrics
- **Documents**: Investment and legal documents

## 🚀 Deployment

### Frontend (Vercel)
- Connect GitHub repository
- Automatic deployments on push
- Free SSL and CDN

### Backend (Render)
- Connect GitHub repository
- Automatic deployments on push
- Free SSL and custom domains

## 💰 Cost Optimization

- **Hosting**: Free tiers (Vercel + Render)
- **Database**: Supabase free tier (500MB)
- **Monitoring**: Built-in logging
- **Backup**: Automated database backups

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Encrypted data transmission
- Secure API endpoints
- Input validation and sanitization

## 📈 Monitoring & Analytics

- Real-time plant performance
- Financial metrics dashboard
- Investor reporting
- System health monitoring
- Performance alerts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For technical support or questions about the platform, contact the development team.

## 📄 License

MIT License - see LICENSE file for details.

---

**Mazi Green Energy** - Powering the future with sustainable energy investments.
