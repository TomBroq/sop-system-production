#!/usr/bin/env node

/**
 * Sistema SOP - Monitoring Setup Script
 * Configures health checks, alerts, and monitoring dashboards
 */

const https = require('https');
const fs = require('fs');

// Configuration
const CONFIG = {
  frontend: {
    url: 'https://frontend-7r5b7rnky-tom-broqs-projects.vercel.app',
    healthPath: '/',
    expectedStatus: 200
  },
  backend: {
    url: '[RAILWAY_URL_TO_BE_CONFIGURED]',
    healthPath: '/api/health',
    expectedStatus: 200
  },
  database: {
    url: 'https://knsxnlvudypucdwbyyfm.supabase.co',
    healthPath: '/rest/v1/',
    expectedStatus: 200
  },
  intervals: {
    healthCheck: 30000, // 30 seconds
    performanceCheck: 300000, // 5 minutes
    alertCheck: 60000 // 1 minute
  }
};

// Health Check Functions
class HealthMonitor {
  constructor() {
    this.status = {
      frontend: { healthy: false, lastCheck: null, responseTime: null },
      backend: { healthy: false, lastCheck: null, responseTime: null },
      database: { healthy: false, lastCheck: null, responseTime: null }
    };
    this.alerts = [];
  }

  async checkHealth(service, config) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const url = new URL(config.url + config.healthPath);
      
      const request = https.get(url, (response) => {
        const responseTime = Date.now() - startTime;
        const healthy = response.statusCode === config.expectedStatus;
        
        this.status[service] = {
          healthy,
          lastCheck: new Date().toISOString(),
          responseTime,
          statusCode: response.statusCode
        };
        
        resolve({ service, healthy, responseTime, statusCode: response.statusCode });
      });
      
      request.on('error', (error) => {
        this.status[service] = {
          healthy: false,
          lastCheck: new Date().toISOString(),
          responseTime: null,
          error: error.message
        };
        
        resolve({ service, healthy: false, error: error.message });
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        resolve({ service, healthy: false, error: 'Timeout' });
      });
    });
  }

  async checkAllServices() {
    const results = await Promise.all([
      this.checkHealth('frontend', CONFIG.frontend),
      // this.checkHealth('backend', CONFIG.backend), // Uncomment after Railway deployment
      this.checkHealth('database', CONFIG.database)
    ]);
    
    return results;
  }

  generateAlert(service, issue) {
    const alert = {
      id: Date.now(),
      service,
      issue,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(service, issue)
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    return alert;
  }

  getSeverity(service, issue) {
    if (service === 'database' || issue.includes('timeout')) return 'high';
    if (service === 'backend') return 'medium';
    return 'low';
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.status,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      summary: {
        totalServices: Object.keys(this.status).length,
        healthyServices: Object.values(this.status).filter(s => s.healthy).length,
        avgResponseTime: this.calculateAvgResponseTime(),
        uptime: this.calculateUptime()
      }
    };
    
    return report;
  }

  calculateAvgResponseTime() {
    const responseTimes = Object.values(this.status)
      .map(s => s.responseTime)
      .filter(rt => rt !== null);
    
    if (responseTimes.length === 0) return null;
    
    return Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
  }

  calculateUptime() {
    const healthyCount = Object.values(this.status).filter(s => s.healthy).length;
    const totalCount = Object.keys(this.status).length;
    
    return Math.round((healthyCount / totalCount) * 100);
  }
}

// Performance Monitor
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
  }

  async measurePageLoad(url) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const request = https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          const loadTime = Date.now() - startTime;
          const metric = {
            url,
            loadTime,
            timestamp: new Date().toISOString(),
            statusCode: response.statusCode,
            contentLength: data.length
          };
          
          this.metrics.push(metric);
          resolve(metric);
        });
      });
      
      request.on('error', (error) => {
        resolve({ url, error: error.message, timestamp: new Date().toISOString() });
      });
    });
  }

  getPerformanceReport() {
    const recent = this.metrics.slice(-10);
    
    if (recent.length === 0) return null;
    
    const avgLoadTime = recent.reduce((a, b) => a + (b.loadTime || 0), 0) / recent.length;
    
    return {
      avgLoadTime: Math.round(avgLoadTime),
      measurements: recent.length,
      lastMeasurement: recent[recent.length - 1],
      performance: avgLoadTime < 2000 ? 'good' : avgLoadTime < 5000 ? 'fair' : 'poor'
    };
  }
}

// Dashboard Generator
class DashboardGenerator {
  generateHTML(healthReport, performanceReport) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema SOP - Monitoring Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .service { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .healthy { background: #10b981; color: white; }
        .unhealthy { background: #ef4444; color: white; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .metric-label { color: #6b7280; font-size: 0.9em; }
        .alerts { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .alert { padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #ef4444; background: #fef2f2; }
        .timestamp { color: #6b7280; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Sistema SOP - Monitoring Dashboard</h1>
            <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${healthReport.summary.uptime}%</div>
                <div class="metric-label">Uptime</div>
            </div>
            <div class="metric">
                <div class="metric-value">${healthReport.summary.avgResponseTime || 'N/A'}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric">
                <div class="metric-value">${healthReport.summary.healthyServices}/${healthReport.summary.totalServices}</div>
                <div class="metric-label">Healthy Services</div>
            </div>
        </div>
        
        <div class="services">
            ${Object.entries(healthReport.status).map(([service, status]) => `
                <div class="service">
                    <h3>${service.charAt(0).toUpperCase() + service.slice(1)}</h3>
                    <span class="status ${status.healthy ? 'healthy' : 'unhealthy'}">
                        ${status.healthy ? 'Healthy' : 'Unhealthy'}
                    </span>
                    <p><strong>Response Time:</strong> ${status.responseTime || 'N/A'}ms</p>
                    <p><strong>Last Check:</strong> ${status.lastCheck ? new Date(status.lastCheck).toLocaleString() : 'Never'}</p>
                    ${status.error ? `<p><strong>Error:</strong> ${status.error}</p>` : ''}
                </div>
            `).join('')}
        </div>
        
        ${healthReport.alerts.length > 0 ? `
            <div class="alerts">
                <h2>Recent Alerts</h2>
                ${healthReport.alerts.map(alert => `
                    <div class="alert">
                        <strong>${alert.service}</strong>: ${alert.issue}
                        <div class="timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
    `;
  }
}

// Main monitoring function
async function main() {
  console.log('🚀 Starting Sistema SOP Monitoring...');
  
  const healthMonitor = new HealthMonitor();
  const performanceMonitor = new PerformanceMonitor();
  const dashboard = new DashboardGenerator();
  
  // Initial health check
  console.log('🔍 Running initial health checks...');
  const results = await healthMonitor.checkAllServices();
  
  results.forEach(result => {
    const status = result.healthy ? '✅' : '❌';
    console.log(`${status} ${result.service}: ${result.healthy ? 'Healthy' : 'Unhealthy'} (${result.responseTime || 'N/A'}ms)`);
    
    if (!result.healthy) {
      healthMonitor.generateAlert(result.service, result.error || 'Service unavailable');
    }
  });
  
  // Performance check
  console.log('⚡ Running performance checks...');
  await performanceMonitor.measurePageLoad(CONFIG.frontend.url);
  
  // Generate reports
  const healthReport = healthMonitor.generateReport();
  const performanceReport = performanceMonitor.getPerformanceReport();
  
  // Save reports
  fs.writeFileSync('health-report.json', JSON.stringify(healthReport, null, 2));
  fs.writeFileSync('performance-report.json', JSON.stringify(performanceReport, null, 2));
  
  // Generate dashboard
  const dashboardHTML = dashboard.generateHTML(healthReport, performanceReport);
  fs.writeFileSync('monitoring-dashboard.html', dashboardHTML);
  
  console.log('📊 Reports generated:');
  console.log('  - health-report.json');
  console.log('  - performance-report.json');
  console.log('  - monitoring-dashboard.html');
  
  console.log('\n📈 Summary:');
  console.log(`  Uptime: ${healthReport.summary.uptime}%`);
  console.log(`  Avg Response Time: ${healthReport.summary.avgResponseTime || 'N/A'}ms`);
  console.log(`  Healthy Services: ${healthReport.summary.healthyServices}/${healthReport.summary.totalServices}`);
  
  if (healthReport.alerts.length > 0) {
    console.log(`\n🚨 Active Alerts: ${healthReport.alerts.length}`);
  }
  
  console.log('\n✅ Monitoring setup complete!');
  console.log('💡 Run this script periodically or set up a cron job for continuous monitoring.');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { HealthMonitor, PerformanceMonitor, DashboardGenerator };