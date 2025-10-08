# Business Rules

## 1. User Management Rules

### 1.1 Registration
- **BR-001:** Email addresses must be unique across the entire system
- **BR-002:** Passwords must be at least 6 characters long
- **BR-003:** Passwords must be hashed using bcrypt before storage
- **BR-004:** Username (store name) is required and cannot be empty
- **BR-005:** Email format must be valid (contains @ and domain)

### 1.2 Authentication
- **BR-006:** Users must be authenticated to access any protected routes
- **BR-007:** JWT tokens expire after 7 days of inactivity
- **BR-008:** Sessions are stored in HTTP-only cookies for security
- **BR-009:** Failed login attempts return generic error messages (no user enumeration)
- **BR-010:** Users can only access their own data (enforced by user_id filtering)

---

## 2. Inventory Management Rules

### 2.1 Item Creation
- **BR-011:** Item name is required and cannot be empty
- **BR-012:** Category is required for all inventory items
- **BR-013:** Cost price must be greater than or equal to 0
- **BR-014:** Selling price must be greater than or equal to 0
- **BR-015:** Initial quantity defaults to 0 if not specified
- **BR-016:** Reorder level defaults to 0 if not specified

### 2.2 Stock Management
- **BR-019:** Inventory quantity cannot be negative
- **BR-020:** Low stock alert triggers when quantity ≤ reorder_level
- **BR-021:** Inventory quantity is automatically decreased when a sale is recorded
- **BR-022:** Inventory quantity is automatically restored when a sale transaction is deleted
- **BR-024:** Inventory updates are atomic (all-or-nothing) within a transaction

### 2.3 Item Updates
- **BR-025:** Users can only update their own inventory items
- **BR-026:** Updated_at timestamp is automatically set on every update
- **BR-027:** Changing selling price does not affect past transactions
- **BR-028:** Deleting an inventory item does not delete past transaction records

---

## 3. Transaction Recording Rules

### 3.1 Sales Transactions
- **BR-029:** Sales transactions must have type = 'sale'
- **BR-030:** Sales transactions must contain at least one transaction item
- **BR-031:** Total amount must equal the sum of all transaction item subtotals
- **BR-032:** Payment method is required for all transactions
- **BR-033:** Each transaction item subtotal = quantity × unit_price
- **BR-034:** Sales transactions decrease inventory quantities
- **BR-035:** If inventory quantity is insufficient, the sale should still proceed (allows negative stock)

### 3.3 Transaction Deletion
- **BR-041:** Users can only delete their own transactions
- **BR-042:** Deleting a sale transaction restores inventory quantities
- **BR-044:** All transaction items are deleted when parent transaction is deleted (CASCADE)
- **BR-045:** Deletion is permanent and cannot be undone

---

## 4. Reporting & Analytics Rules

### 4.1 Sales Reports
- **BR-046:** Reports calculate data only for the authenticated user
- **BR-047:** Date range is inclusive (includes both start and end dates)
- **BR-048:** Total Sales = Sum of all sale transactions in date range
- **BR-050:** Gross Profit = Total Sales - COGS (Cost of Goods Sold)
- **BR-051:** Net Profit = Gross Profit - Total Expenses
- **BR-052:** COGS = Sum of (quantity × cost_price) for all sold items

### 4.2 Dashboard Analytics
- **BR-053:** Dashboard shows data for the last 30 days by default
- **BR-054:** Low stock count includes items where quantity ≤ reorder_level
- **BR-055:** Inventory value = Sum of (quantity × cost_price) for all items
- **BR-056:** Top items are ranked by total quantity sold
- **BR-057:** Daily sales chart shows sales grouped by date

### 4.3 Category Analytics
- **BR-058:** Category sales are calculated from transaction items
- **BR-059:** Items without a category are grouped as "Uncategorized"
- **BR-060:** Category totals include quantity and revenue

### 4.4 Payment Method Analytics
- **BR-061:** Payment method distribution shows count and total amount
- **BR-062:** Only sale transactions are included in payment method reports

---

## 5. Data Integrity Rules

### 5.1 Referential Integrity
- **BR-064:** Deleting a user deletes all their inventory items (CASCADE)
- **BR-065:** Deleting a user deletes all their transactions (CASCADE)
- **BR-066:** Deleting a transaction deletes all its transaction items (CASCADE)
- **BR-067:** Deleting an inventory item sets transaction_items.inventory_item_id to NULL (preserve history)

### 5.2 Data Validation
- **BR-068:** All monetary values use DECIMAL(10,2) for precision
- **BR-069:** Timestamps are stored in UTC
- **BR-070:** Email addresses are stored in lowercase
- **BR-071:** Numeric quantities allow up to 2 decimal places
- **BR-072:** Each transaction is automatically categorized as a Sale.

### 5.3 Concurrency
- **BR-073:** Database transactions ensure atomicity for multi-step operations
- **BR-074:** Inventory updates within a transaction are isolated
- **BR-075:** Last write wins for concurrent updates (no optimistic locking)

---

## 6. User Interface Rules

### 6.1 Display Formatting
- **BR-076:** All prices are displayed with ₱ symbol and 2 decimal places
- **BR-077:** Dates are displayed in local format (MM/DD/YYYY or DD/MM/YYYY)
- **BR-078:** Low stock items are highlighted with red badge
- **BR-079:** In-stock items are highlighted with gray badge
- **BR-080:** Negative values (losses) are displayed in red

### 6.2 User Experience
- **BR-081:** Loading states are shown during data fetching
- **BR-082:** Error messages are user-friendly and actionable
- **BR-083:** Confirmation dialogs are required for destructive actions (delete)
- **BR-084:** Forms validate input before submission
- **BR-085:** Success messages are shown after successful operations

---

## 7. Security Rules

### 7.1 Authentication & Authorization
- **BR-086:** All API routes (except auth) require valid JWT token
- **BR-087:** Users can only access their own data (enforced by user_id)
- **BR-088:** Passwords are never returned in API responses
- **BR-089:** JWT secret must be stored in environment variables
- **BR-090:** Database credentials must be stored in environment variables

### 7.2 Input Validation
- **BR-091:** All user inputs are validated on the server side
- **BR-092:** SQL injection is prevented by using parameterized queries
- **BR-093:** XSS attacks are prevented by proper input sanitization
- **BR-094:** CSRF attacks are mitigated by HTTP-only cookies

---

## 8. Performance Rules

### 8.1 Database Optimization
- **BR-095:** Foreign keys are indexed for join performance
- **BR-096:** Frequently queried columns (email, barcode, category) are indexed
- **BR-097:** Date columns are indexed for report generation
- **BR-098:** Queries use LIMIT to prevent excessive data retrieval

### 8.2 Caching
- **BR-099:** Static assets are cached by the browser
- **BR-100:** API responses are not cached (real-time data)
