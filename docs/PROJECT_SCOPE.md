# SariWais Store Management System - Project Scope

## 1. Project Overview

**Project Name:** SariWais Store Management System

**Purpose:** A comprehensive web-based point-of-sale and inventory management system designed specifically for Filipino Sari-Sari stores to streamline daily operations, track inventory, record transactions, and generate business insights.

**Target Users:** Small business owners operating Sari-Sari stores in the Philippines who need an affordable, easy-to-use solution for managing their store operations.

## 2. Project Objectives

- Provide a user-friendly interface for managing store inventory and tracking stock levels
- Enable quick and accurate recording of sales transactions and expenses
- Generate comprehensive sales reports and business analytics
- Reduce manual record-keeping errors and save time
- Provide real-time insights into business performance
- Support multiple payment methods (cash, GCash, credit/debit cards)
- Alert store owners when inventory items need reordering

## 3. Scope Inclusions

### 3.1 User Authentication & Authorization
- User registration with store name, email, and password
- Secure login with JWT-based session management
- Password hashing using bcrypt
- Protected routes requiring authentication
- Session persistence across browser sessions

### 3.2 Dashboard & Analytics
- Real-time business metrics display
- Total sales, net profit, and transaction count
- Low stock alerts and inventory value tracking
- Daily sales trend visualization with charts
- Top-selling items table
- 30-day rolling analytics

### 3.3 Inventory Management
- Complete CRUD operations for inventory items
- Product information: name, barcode, category, unit of measure
- Pricing: cost price and selling price
- Stock tracking: current quantity and reorder level
- Low stock alerts and filtering
- Search functionality by name or barcode
- Category-based filtering
- Automatic inventory updates on sales

### 3.4 Transaction Recording
- Record sales transactions with multiple items
- Record expense transactions
- Support for multiple payment methods
- Automatic calculation of totals and change
- Transaction history with detailed views
- Ability to delete transactions with inventory restoration
- Real-time inventory updates on transaction completion

### 3.5 Sales Reports & Analytics
- Customizable date range selection
- Comprehensive sales summary (total sales, gross profit, net profit)
- Category-wise sales breakdown with charts
- Payment method distribution analysis
- CSV export functionality for external analysis
- Visual data representation using charts

### 3.6 User Interface
- Responsive design for desktop and mobile devices
- Modern, clean interface with Emerald Green, Amber, and Sky Blue color palette
- Intuitive navigation with sidebar menu
- Loading states and error handling
- Smooth animations and transitions
- Accessible design following WCAG guidelines

## 4. Scope Exclusions

The following features are **NOT** included in the current scope:

- Multi-user/multi-store support (single user per account)
- Employee management and role-based access control
- Customer relationship management (CRM) features
- Loyalty programs or customer accounts
- Barcode scanning hardware integration
- Receipt printing functionality
- SMS or email notifications
- Mobile native applications (iOS/Android)
- Offline mode or PWA capabilities
- Integration with accounting software
- Supplier management
- Purchase order management
- Advanced forecasting or AI-powered insights
- Multi-currency support
- Tax calculation and reporting
- Integration with payment gateways (manual payment recording only)

## 5. Technical Specifications

### 5.1 Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **State Management:** React hooks and SWR

### 5.2 Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Authentication:** JWT with HTTP-only cookies
- **Password Hashing:** bcrypt

### 5.3 Database
- **Database:** PostgreSQL (via Neon)
- **Query Method:** Direct SQL queries using @neondatabase/serverless
- **Schema:** Normalized relational database design

### 5.4 Deployment
- **Platform:** Vercel
- **Database Hosting:** Neon (serverless PostgreSQL)
- **Environment:** Production-ready with environment variables

## 6. Deliverables

1. Fully functional web application
2. Database schema and migration scripts
3. Complete source code with TypeScript
4. Technical documentation (ERD, Data Dictionary, Business Rules)
5. User interface with responsive design
6. Deployment-ready configuration

## 7. Success Criteria

- Users can successfully register and log in
- All CRUD operations work correctly for inventory items
- Transactions are recorded accurately with proper inventory updates
- Reports generate correct calculations and visualizations
- Application is responsive on desktop and mobile devices
- Page load times are under 3 seconds
- No critical bugs or security vulnerabilities
- Data integrity is maintained across all operations

## 8. Assumptions

- Users have stable internet connection
- Users have modern web browsers (Chrome, Firefox, Safari, Edge)
- Users have basic computer literacy
- Store owners will manually input initial inventory data
- One store owner per account (no multi-user access)
- All prices are in Philippine Pesos (₱)

## 9. Constraints

- Budget: Free tier services (Vercel, Neon)
- Timeline: Rapid development cycle
- Resources: Single developer
- Technology: Must use Next.js and PostgreSQL
- Security: Must follow industry best practices for authentication

## 10. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss | High | Regular database backups, transaction rollback on errors |
| Security breach | High | JWT authentication, password hashing, input validation |
| Performance issues | Medium | Database indexing, query optimization, caching |
| User adoption | Medium | Intuitive UI design, clear documentation |
| Browser compatibility | Low | Use modern web standards, test on major browsers |

## 11. Future Enhancements (Out of Scope)

- Multi-store management
- Employee accounts with different permission levels
- Barcode scanner integration
- Receipt printer support
- Mobile apps for iOS and Android
- Offline functionality
- Advanced analytics with AI predictions
- Integration with payment processors
- Customer loyalty programs
- Supplier management module
