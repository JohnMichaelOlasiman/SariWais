# Data Dictionary

## Table: users

Stores user account information for store owners.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| username | VARCHAR(100) | NOT NULL | Store name or owner name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address for login |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

**Business Rules:**
- Email must be unique across all users
- Password must be hashed before storage (never store plain text)
- Username is displayed in the dashboard greeting

---

## Table: inventory_items

Stores product information and stock levels for items sold in the store.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Owner of this inventory item |
| name | VARCHAR(255) | NOT NULL | Product name (e.g., "Coca-Cola 1.5L") |
| category | VARCHAR(100) | NOT NULL | Product category (e.g., "Beverages", "Snacks") |
| quantity | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Current stock quantity |
| unit | VARCHAR(50) | NOT NULL | Unit of measure (e.g., "pcs", "kg", "L") |
| cost_price | DECIMAL(10,2) | NOT NULL | Purchase/cost price per unit |
| selling_price | DECIMAL(10,2) | NOT NULL | Retail selling price per unit |
| reorder_level | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Minimum quantity before reorder alert |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Item creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `category`

**Business Rules:**
- Quantity cannot be negative
- Selling price should typically be higher than cost price
- Low stock alert triggers when quantity ≤ reorder_level
- Category is used for sales analytics and filtering

---

## Table: transactions

Records all financial transactions including sales.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Owner of this transaction |
| type | VARCHAR(20) | NOT NULL, CHECK IN ('sale') | Transaction type |
| total_amount | DECIMAL(10,2) | NOT NULL | Total transaction amount |
| payment_method | VARCHAR(50) | NOT NULL | Payment method (e.g., "Cash", "GCash") |
| notes | TEXT | NULL | Optional transaction notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Transaction timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `type`
- INDEX on `created_at`

**Business Rules:**
- Type must be sale
- Sales increase revenue, expenses decrease profit
- Total amount must match sum of transaction_items subtotals
- Payment methods: "Cash", "GCash", "Credit Card", "Debit Card"
- Created_at is used for date range filtering in reports

---

## Table: transaction_items

Stores individual line items within a transaction.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| transaction_id | INTEGER | NOT NULL, FOREIGN KEY → transactions(id) | Parent transaction |
| inventory_item_id | INTEGER | NULL, FOREIGN KEY → inventory_items(id) | Referenced inventory item (if applicable) |
| item_name | VARCHAR(255) | NOT NULL | Item name (snapshot at time of sale) |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity sold/purchased |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit at time of transaction |
| subtotal | DECIMAL(10,2) | NOT NULL | Calculated: quantity × unit_price |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `transaction_id`
- INDEX on `inventory_item_id`

**Business Rules:**
- Subtotal must equal quantity × unit_price
- Item_name is stored as snapshot (not updated if inventory item name changes)
- Inventory_item_id can be NULL for custom/one-time items
- For sales: inventory quantity is decreased by transaction quantity
- For expenses: inventory_item_id is typically NULL
- Deleting a transaction restores inventory quantities

---

## Data Types Reference

| Data Type | Description | Example Values |
|-----------|-------------|----------------|
| SERIAL | Auto-incrementing integer | 1, 2, 3, ... |
| INTEGER | Whole number | 42, -10, 0 |
| VARCHAR(n) | Variable-length string (max n chars) | "Coca-Cola", "user@example.com" |
| TEXT | Unlimited length text | Long notes or descriptions |
| DECIMAL(10,2) | Fixed-point decimal (10 digits, 2 after decimal) | 99.99, 1234.50 |
| TIMESTAMP | Date and time | 2025-01-10 14:30:00 |

---

## Enumerated Values

### transaction.type
- `sale` - Revenue-generating transaction
- `expense` - Cost/expense transaction

### transaction.payment_method
- `Cash` - Physical cash payment
- `GCash` - GCash mobile payment
- `Credit Card` - Credit card payment
- `Debit Card` - Debit card payment

### inventory_items.unit (Common Values)
- `pcs` - Pieces
- `kg` - Kilograms
- `g` - Grams
- `L` - Liters
- `mL` - Milliliters
- `box` - Box
- `pack` - Pack
- `bottle` - Bottle

### inventory_items.category (Common Values)
- `Beverages` - Drinks and liquids
- `Snacks` - Chips, crackers, etc.
- `Canned Goods` - Canned products
- `Instant Noodles` - Noodle products
- `Condiments` - Sauces and seasonings
- `Personal Care` - Hygiene products
- `Household` - Cleaning and household items
- `Tobacco` - Cigarettes and tobacco
- `Other` - Miscellaneous items
