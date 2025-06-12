# SupiriAccounts PWA

A Progressive Web App version of SupiriAccounts that runs locally on your mobile device with data stored directly on the phone. This application allows you to manage your business without requiring Termux or any server setup.

## Business Readiness Status ✅ COMPLETED

**[READY FOR DEPLOYMENT - June 12, 2025]**

This application has been fully prepared for business use with:
- ✅ Reliable offline-first database configuration
- ✅ GitHub Pages deployment configuration
- ✅ Business analytics and reporting tools
- ✅ Advanced data management utilities
- ✅ Comprehensive business documentation

All validation tests have been completed successfully. The application is ready for business deployment.

See [Business Readiness Checklist](./docs/business-readiness-checklist.md) for detailed verification status.

## Project Structure

```
HybridApp/
├── public/                 # Public files served directly
│   ├── index.html          # Main HTML file
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Service worker for offline functionality
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── css/                # Stylesheets
│   │   └── style.css       # Main stylesheet
│   ├── images/             # Image assets
│   ├── js/                 # JavaScript files
│   │   ├── app.js          # Main application logic
│   │   ├── db.js           # IndexedDB database handling
│   │   └── router.js       # Client-side routing
│   ├── models/             # Data models
│   ├── utils/              # Utility functions
│   └── views/              # Page templates/views
└── docs/                   # Documentation
```

## Features

- **Fully Offline Capable**: Works without an internet connection after initial load
- **Local Data Storage**: All data stored on your device using IndexedDB
- **Responsive Design**: Works well on both desktop and mobile devices
- **Installable**: Can be added to your home screen like a native app
- **User Authentication**: Secure login and user profile management
- **Customer Management**: Add, edit, and delete customer records
- **Inventory Management**: Track products and services with barcode scanning support
- **Sales Management**: Create and manage sales, including multi-step sales process
- **Payment Tracking**: Record and track payments
- **Business Analytics**: Comprehensive dashboards with sales trends, inventory analysis, and customer insights
- **Inventory Valuation**: Track cost and retail value of inventory with profit margin analysis
- **Customer Insights**: Track purchasing patterns, repeat rates, and top customers
- **Barcode Scanning**: Scan product barcodes using your device's camera
- **Data Backup & Restore**: Advanced options for data management with metadata tracking
- **Mobile Optimization**: Designed for touch interfaces with responsive UI
- **Business Reporting**: Generate reports with customizable date ranges and metrics

## Technical Details

- **Frontend**: HTML, CSS, JavaScript
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Storage**: IndexedDB
- **PWA Features**: Service Worker, Web App Manifest
- **Hosting**: Can be hosted on GitHub Pages or any static file host

## Getting Started

1. Clone or download this repository
2. Run the development server:

```powershell
.\test-local-server.ps1
```

3. Open your browser and navigate to http://localhost:8000

## Deployment

### Deploy to GitHub Pages

Use the provided deployment script:

```powershell
.\deploy-to-github.ps1
```

Or set up automated GitHub Actions deployment:
1. Create `.github/workflows/` directory in your repository
2. Copy `github-workflow-deploy.yml` to `.github/workflows/deploy.yml`
3. Push to GitHub
4. Enable GitHub Pages in repository settings

See [GitHub Deployment Guide](./docs/github-deployment.md) for detailed instructions.

## Business Use

SupiriAccounts is specifically designed for small to medium businesses that need:

1. **Mobile-First Operations**: Perfect for businesses on the go or with limited computing infrastructure
2. **Offline Reliability**: Works in areas with unreliable internet connections
3. **Simple Deployment**: No server setup required - deploy to GitHub Pages in minutes
4. **Data Privacy**: All data stays on your device, ensuring maximum privacy
5. **Low Resource Usage**: Minimal requirements - works on older and budget devices

For detailed instructions on setting up SupiriAccounts for your business, refer to:

- [Business Onboarding Guide](./docs/business-onboarding-guide.md)
- [GitHub Deployment Instructions](./docs/github-deployment.md)

## Limitations

- IndexedDB storage is limited by the browser (typically 50MB-1GB)
- Some features may require internet connection (like sharing reports)
- Data is stored in the browser, so clearing browser data will delete your app data
- Regular backups are essential to prevent data loss

## Future Enhancements

- Data sync across multiple devices
- Enhanced reporting capabilities with advanced filtering
- PDF generation for invoices and receipts
- Email integration for sending invoices and reports
- Cloud backup integration with Google Drive/Dropbox
- Multiple currency support
- Enhanced tax handling for different jurisdictions
- Multi-user access controls for larger businesses
