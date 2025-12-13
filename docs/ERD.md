# Entity Relationship Diagram (ERD)

## Visual Representation

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                         SariWais Database Schema                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       users          │
├──────────────────────┤
│ PK  id              │
│     username        │
│     email           │
│     password_hash   │
│     created_at      │
└──────────────────────┘
         │
         │ 1
         │
         │ owns
         │
         │ *
         ├─────────────────────────────────────────┐
         │                                         │
         │                                         │
┌────────▼──────────────┐              ┌──────────▼────────────┐
│  inventory_items      │              │    transactions       │
├───────────────────────┤              ├───────────────────────┤
│ PK  id               │              │ PK  id               │
│ FK  user_id          │              │ FK  user_id          │
│     name             │              │     type             │
│     barcode          │              │     total_amount     │
│     category         │              │     payment_method   │
│     quantity         │              │     notes            │
│     unit             │              │     created_at       │
│     cost_price       │              └───────────────────────┘
│     selling_price    │                        │
│     reorder_level    │                        │ 1
│     created_at       │                        │
│     updated_at       │                        │ contains
└───────────────────────┘                        │
         │                                       │ *
         │                                       │
         │ referenced by                ┌────────▼──────────────┐
         │                              │  transaction_items    │
         │                              ├───────────────────────┤
         │                              │ PK  id               │
         │                              │ FK  transaction_id   │
         └──────────────────────────────┤ FK  inventory_item_id│
                                        │     item_name        │
                                        │     quantity         │
                                        │     unit_price       │
                                        │     subtotal         │
                                        └───────────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
1  = One
*  = Many
\`\`\`

## Entity Descriptions

### 1. users
**Purpose:** Stores store owner account information and authentication credentials.

**Relationships:**
- One user can have many inventory items (1:N)
- One user can have many transactions (1:N)

### 2. inventory_items
**Purpose:** Stores product information, pricing, and stock levels for items sold in the store.

**Relationships:**
- Many inventory items belong to one user (N:1)
- One inventory item can appear in many transaction items (1:N)

### 3. transactions
**Purpose:** Records all financial transactions including sales and expenses.

**Relationships:**
- Many transactions belong to one user (N:1)
- One transaction can have many transaction items (1:N)

### 4. transaction_items
**Purpose:** Stores individual line items within a transaction, linking products to sales.

**Relationships:**
- Many transaction items belong to one transaction (N:1)
- Many transaction items can reference one inventory item (N:1)

## Cardinality Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| users → inventory_items | 1:N | One user owns multiple inventory items |
| users → transactions | 1:N | One user creates multiple transactions |
| transactions → transaction_items | 1:N | One transaction contains multiple items |
| inventory_items → transaction_items | 1:N | One inventory item appears in multiple transactions |

## Key Constraints

1. **Referential Integrity:**
   - All foreign keys have ON DELETE CASCADE to maintain data consistency
   - Deleting a user removes all their inventory and transactions
   - Deleting a transaction removes all its transaction items

2. **Data Integrity:**
   - Email addresses must be unique across all users
   - Barcodes must be unique per user (optional field)
   - Transaction types are constrained to 'sale' or 'expense'
   - All monetary values use DECIMAL(10,2) for precision

3. **Indexing:**
   - Primary keys are automatically indexed
   - Foreign keys are indexed for join performance
   - Email field is indexed for login queries
   - Barcode field is indexed for quick lookups
   - Category field is indexed for filtering
