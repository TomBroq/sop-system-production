# 🚀 Railway Deployment Instructions - Sistema SOP Backend

## Manual Deployment Steps

### 1. Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect to repository: `TomBroq/sop-system-production`
5. Set project name: `sop-system-backend`

### 2. Configure Environment Variables

Add the following environment variables in Railway dashboard:

```bash
# Application Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1
APP_NAME=Sistema SOP Backend
APP_VERSION=1.0.0

# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres.knsxnlvudypucdwbyyfm:pBVhdFsYZ8mIEaIo@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# Supabase Configuration
SUPABASE_URL=https://knsxnlvudypucdwbyyfm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuc3hubHZ1ZHlwdWNkd2J5eWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0NjAzMTAsImV4cCI6MjA0OTAzNjMxMH0.0p4R0P4fRHqUwuGU1O5rlQhU5H1v8t1T3_3m7fX8Vmo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuc3hubHZ1ZHlwdWNkd2J5eWZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzQ2MDMxMCwiZXhwIjoyMDQ5MDM2MzEwfQ.TjW8HsRkqiXy0Q9aPg9VBUTx_4AX8VbZ5RzxQOqC5Zg

# Redis Configuration (Railway will provide)
REDIS_URL=redis://red-example:6379
REDIS_DB=0

# JWT Configuration (Generate secure keys)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-minimum-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Configuration (LGPD Compliance - Generate 32 char key)
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_ALGORITHM=aes-256-gcm

# CORS Configuration
CORS_ORIGIN=https://frontend-7r5b7rnky-tom-broqs-projects.vercel.app
CORS_CREDENTIALS=true

# External APIs
TALLY_API_URL=https://api.tally.so/api
TALLY_API_KEY=your-tally-api-key
TALLY_WEBHOOK_SECRET=your-tally-webhook-secret

MULTIAGENT_API_URL=https://your-multiagent-api.com
MULTIAGENT_API_KEY=your-multiagent-api-key
MULTIAGENT_TIMEOUT_MS=120000

# Email Service Configuration
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM_ADDRESS=noreply@sistema-sop.com
EMAIL_FROM_NAME=Sistema SOP

# Security Configuration (Generate secure keys)
BCRYPT_ROUNDS=12
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax

# Business Rules
MIN_PROCESSES_PER_ANALYSIS=5
MAX_FORM_EXPIRY_DAYS=30
DEFAULT_ANALYSIS_TIMEOUT_MINUTES=5

# Performance Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
METRICS_COLLECTION_INTERVAL=60000

# Feature Flags
ENABLE_SEED_DATA=false
ENABLE_SWAGGER_DOCS=true
ENABLE_DEBUG_ROUTES=false
AUTO_BACKUP_ENABLED=true
```

### 3. Configure Build Settings

Set the following in Railway dashboard:

- **Root Directory**: `/` (project root)
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:prod`
- **Node Version**: `18.x`

### 4. Deploy Configuration

1. The `railway.json` file is already configured in the repository
2. The `Dockerfile` provides containerized deployment option
3. Health check endpoint: `/api/health`

### 5. Database Setup

1. The database is already configured with Supabase
2. Connection string is provided in environment variables
3. Migrations will run automatically on first deployment

### 6. Redis Setup (Optional)

If you need Redis for caching:

1. In Railway dashboard, click "Add Service"
2. Select "Redis"
3. Copy the provided REDIS_URL to environment variables

### 7. Deploy

1. Click "Deploy" in Railway dashboard
2. Monitor build logs for any issues
3. Verify deployment success at provided URL

## Expected Deployment URL

After successful deployment, your backend will be available at:
`https://[project-name].railway.app`

## Health Check

Verify deployment by accessing:
`https://[project-name].railway.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-08-05T19:00:00.000Z",
  "service": "Sistema SOP Backend",
  "version": "1.0.0"
}
```

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all environment variables are set
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Port Issues**: Ensure PORT=3000 or use Railway's PORT variable
4. **Memory Issues**: Increase memory allocation in Railway settings

### Support Resources:

- [Railway Documentation](https://docs.railway.app/)
- [GitHub Repository](https://github.com/TomBroq/sop-system-production)
- Health Check: `/api/health`

---

**Status**: ✅ Configuration Ready  
**Next Step**: Manual deployment in Railway dashboard  
**Estimated Time**: 5-10 minutes