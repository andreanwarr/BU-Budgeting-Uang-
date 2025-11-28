# Category CRUD System Documentation

## Overview

Complete CRUD (Create, Read, Update, Delete) system for managing transaction categories in the Finance Tracker application.

**Technology Stack:**
- **Database:** Supabase (PostgreSQL)
- **Frontend:** React 18.3 + TypeScript 5.9
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React

---

## Current Database Categories

### Summary Statistics
- **Total Categories:** 14
- **Income Categories:** 5
- **Expense Categories:** 9
- **All Default Categories:** Yes
- **Custom Categories:** 0 (none created yet)
- **Categories with Transactions:** 0

### Income Categories (5)

| ID | Name | Icon | Type | Status | Transactions | Created |
|----|------|------|------|--------|--------------|---------|
| `4ddbefcf-8835-4f27-a3ef-c1db28835aa8` | Gaji | banknote | income | Default | 0 | 2025-11-28 |
| `0e1056c3-ce71-4df9-86bc-778ae1ed2309` | Bonus | gift | income | Default | 0 | 2025-11-28 |
| `62d279cc-b6cb-466e-a503-2c0e8d2e46f4` | Investasi | trending-up | income | Default | 0 | 2025-11-28 |
| `78f30618-347b-4338-b728-a31a616c6784` | Bisnis | briefcase | income | Default | 0 | 2025-11-28 |
| `4c5c7ce5-7d8a-4f00-aa0e-736281a70d0f` | Lainnya | circle | income | Default | 0 | 2025-11-28 |

### Expense Categories (9)

| ID | Name | Icon | Type | Status | Transactions | Created |
|----|------|------|------|--------|--------------|---------|
| `f1738d9f-2ddb-425e-92cf-d0656ea6b43d` | Makanan | utensils | expense | Default | 0 | 2025-11-28 |
| `97859f94-68a6-4f07-b025-421f504b6bc4` | Transport | car | expense | Default | 0 | 2025-11-28 |
| `e060fdd2-6ab2-43d4-871b-598ea7b9813e` | Belanja | shopping-bag | expense | Default | 0 | 2025-11-28 |
| `496c48e4-0f91-4879-b3fd-51e7bbd778af` | Tagihan | home | expense | Default | 0 | 2025-11-28 |
| `9df12d1d-25c3-42bd-a0d2-708a02367c57` | Hiburan | music | expense | Default | 0 | 2025-11-28 |
| `6f895a66-41c1-4e88-aefe-739b510f7688` | Kesehatan | heart | expense | Default | 0 | 2025-11-28 |
| `1b73fa17-2780-4914-90f8-d2580e7d6493` | Pendidikan | book | expense | Default | 0 | 2025-11-28 |
| `2761fba0-61ad-4149-ad3c-ac1653be5835` | Olahraga | dumbbell | expense | Default | 0 | 2025-11-28 |
| `a8ff26ac-5362-4449-beac-3dccd0f045f6` | Lainnya | circle | expense | Default | 0 | 2025-11-28 |

---

## CRUD Operations

### 1. CREATE Operation

**Function:** `handleCreate()`

**Purpose:** Add new categories to the database

**Features:**
- Input validation (name length, duplicates)
- Auto-generate unique UUID
- Support for default and custom categories
- Icon selection from 26+ available icons
- Type selection (income/expense)

**Validation Rules:**
- Name is required
- Minimum 2 characters
- Maximum 50 characters
- No duplicate names within same type
- Proper formatting check

**Example Usage:**
```typescript
// Create new category
const newCategory = {
  name: "Freelance",
  type: "income",
  icon: "laptop",
  is_default: false
};
await handleCreate();
```

**SQL Query:**
```sql
INSERT INTO categories (name, type, icon, is_default, user_id)
VALUES ('Freelance', 'income', 'laptop', false, 'user-uuid')
RETURNING *;
```

---

### 2. READ Operation

**Function:** `loadCategories()`

**Purpose:** Retrieve all categories with statistics

**Features:**
- Load all categories from database
- Calculate transaction counts per category
- Sort by type and name
- Real-time data synchronization

**SQL Query:**
```sql
SELECT
  c.*,
  COUNT(t.id) as transaction_count
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id
GROUP BY c.id
ORDER BY c.type, c.name;
```

**Response Format:**
```typescript
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  is_default: boolean;
  user_id: string | null;
  created_at: string;
  transaction_count?: number;
}
```

---

### 3. UPDATE Operation

**Function:** `handleUpdate()`

**Purpose:** Modify existing category information

**Features:**
- Edit name and icon
- Type and default status cannot be changed (data integrity)
- Duplicate name validation
- Maintain transaction relationships

**Restrictions:**
- Cannot change category type (income/expense)
- Cannot change is_default status
- Must maintain data integrity

**SQL Query:**
```sql
UPDATE categories
SET
  name = 'Updated Name',
  icon = 'new-icon'
WHERE id = 'category-uuid';
```

---

### 4. DELETE Operation

**Function:** `handleDelete()`

**Purpose:** Remove categories safely from database

**Safety Checks:**
1. **Cannot delete default categories** - Required for system
2. **Cannot delete categories with transactions** - Prevents orphaned data
3. **Confirmation prompt** - Prevents accidental deletion
4. **Cascade handling** - Proper foreign key management

**SQL Query:**
```sql
DELETE FROM categories
WHERE id = 'category-uuid'
AND is_default = false
AND NOT EXISTS (
  SELECT 1 FROM transactions WHERE category_id = 'category-uuid'
);
```

**Error Messages:**
- Default category: "Cannot delete default categories"
- Has transactions: "Cannot delete. Category has X transaction(s)"
- Generic error: "Failed to delete category: [error details]"

---

## Search & Filter System

### Search Functionality
- Search by category name (case-insensitive)
- Search by category ID
- Real-time filtering as you type

### Filter Options

**Type Filter:**
- All Types
- Income Only
- Expense Only

**Status Filter:**
- All Categories
- Default Only
- Custom Only

**Implementation:**
```typescript
const applyFilters = () => {
  let filtered = [...categories];

  // Search
  if (searchTerm) {
    filtered = filtered.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Type filter
  if (typeFilter !== 'all') {
    filtered = filtered.filter(cat => cat.type === typeFilter);
  }

  // Default filter
  if (defaultFilter === 'default') {
    filtered = filtered.filter(cat => cat.is_default);
  } else if (defaultFilter === 'custom') {
    filtered = filtered.filter(cat => !cat.is_default);
  }

  setFilteredCategories(filtered);
};
```

---

## Validation System

### Input Validation

**Category Name Validation:**
```typescript
const validateCategoryName = (
  name: string,
  type: 'income' | 'expense',
  excludeId?: string
): ValidationResult => {
  // Empty check
  if (!name.trim()) {
    return { isValid: false, error: 'Category name is required' };
  }

  // Length check
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Minimum 2 characters required' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Maximum 50 characters allowed' };
  }

  // Duplicate check
  const duplicate = categories.find(cat =>
    cat.name.toLowerCase() === name.trim().toLowerCase() &&
    cat.type === type &&
    cat.id !== excludeId
  );

  if (duplicate) {
    return {
      isValid: false,
      error: `Category "${name}" already exists for ${type}`
    };
  }

  return { isValid: true };
};
```

---

## Error Handling

### Error Types

**Database Errors:**
```typescript
try {
  const { data, error } = await supabase.from('categories')...
  if (error) throw error;
} catch (err: any) {
  showErrorMessage(`Database error: ${err.message}`);
}
```

**Validation Errors:**
- Displayed inline in forms
- 5-second auto-dismiss
- Red background with error icon

**Success Messages:**
- Green background with check icon
- 3-second auto-dismiss
- Clear action confirmation

---

## User Interface

### Components

**Statistics Dashboard:**
- Total Categories
- Income/Expense counts
- Default/Custom counts
- Categories in use

**Action Bar:**
- Create New button
- Refresh button
- Search input
- Filter dropdowns

**Data Table:**
- Icon preview
- Category name
- Type badge
- Status badge
- Transaction count
- Creation date
- Truncated ID
- Action buttons (Edit/Delete)

**Forms:**
- Inline create form
- Inline edit form
- Icon picker grid
- Type selector
- Default checkbox

**Modals:**
- Delete confirmation
- Warning for categories with transactions
- Cancel/Confirm actions

---

## Database Schema

```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  is_default boolean NOT NULL DEFAULT false,
  icon text NOT NULL DEFAULT 'circle',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_categories_user_type
  ON categories(user_id, type)
  WHERE user_id IS NOT NULL;

CREATE INDEX idx_categories_default
  ON categories(is_default, type)
  WHERE is_default = true;

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_default = true OR user_id = (select auth.uid()));

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) AND is_default = false);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
```

---

## Security Features

### Row Level Security (RLS)
- All queries respect user permissions
- Default categories visible to all
- Custom categories only visible to creator
- Cannot modify other users' categories

### Data Integrity
- Foreign key constraints
- Check constraints on type field
- NOT NULL constraints on required fields
- Cascade delete for user data

### Validation
- Input sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (React auto-escaping)

---

## Usage Examples

### Create Category
```typescript
// 1. Click "Create New Category"
// 2. Fill in name: "Gym Membership"
// 3. Select type: Expense
// 4. Choose icon: dumbbell
// 5. Click "Create Category"
// Result: New category added to database
```

### Update Category
```typescript
// 1. Click edit icon on category row
// 2. Modify name: "Gym & Fitness"
// 3. Change icon if needed
// 4. Click "Update Category"
// Result: Category updated in database
```

### Delete Category
```typescript
// 1. Click delete icon on category row
// 2. Confirm deletion in modal
// 3. System checks for transactions
// 4. If safe, category deleted
// Result: Category removed from database
```

### Search & Filter
```typescript
// Search: Type "Mak" in search box
// Result: Shows "Makanan" category

// Filter: Select "Income Only"
// Result: Shows only 5 income categories

// Combined: Search "Lainnya" + Filter "Expense"
// Result: Shows only "Lainnya" expense category
```

---

## API Reference

### Supabase Queries

**Load Categories:**
```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .order('type', { ascending: true })
  .order('name', { ascending: true });
```

**Create Category:**
```typescript
const { data, error } = await supabase
  .from('categories')
  .insert([{ name, type, icon, is_default, user_id }])
  .select()
  .single();
```

**Update Category:**
```typescript
const { error } = await supabase
  .from('categories')
  .update({ name, icon })
  .eq('id', categoryId);
```

**Delete Category:**
```typescript
const { error } = await supabase
  .from('categories')
  .delete()
  .eq('id', categoryId);
```

**Count Transactions:**
```typescript
const { count } = await supabase
  .from('transactions')
  .select('*', { count: 'exact', head: true })
  .eq('category_id', categoryId);
```

---

## Testing Checklist

### Create Operation
- [ ] Can create income category
- [ ] Can create expense category
- [ ] Cannot create duplicate names
- [ ] Name validation works
- [ ] Icon selection works
- [ ] Default checkbox works

### Read Operation
- [ ] All categories load
- [ ] Transaction counts accurate
- [ ] Sorting works correctly
- [ ] Data refreshes properly

### Update Operation
- [ ] Can update name
- [ ] Can update icon
- [ ] Cannot create duplicates
- [ ] Type cannot be changed
- [ ] Validation works

### Delete Operation
- [ ] Can delete custom categories
- [ ] Cannot delete default categories
- [ ] Cannot delete with transactions
- [ ] Confirmation modal works
- [ ] Error messages display

### Search & Filter
- [ ] Search by name works
- [ ] Search by ID works
- [ ] Type filter works
- [ ] Status filter works
- [ ] Combined filters work

---

## Troubleshooting

### Common Issues

**Categories not loading:**
- Check database connection
- Verify RLS policies
- Check user authentication
- Inspect browser console

**Cannot create category:**
- Check for duplicate names
- Verify name length (2-50 chars)
- Ensure type is selected
- Check user permissions

**Cannot delete category:**
- Check if default category
- Verify no transactions exist
- Check user ownership
- Review error message

**Search not working:**
- Clear search term
- Reset filters
- Refresh categories
- Check spelling

---

## Performance Optimization

### Database
- Indexed queries for fast lookups
- Efficient JOIN operations
- Cached transaction counts
- Optimized RLS policies

### Frontend
- React memoization where needed
- Debounced search input
- Lazy loading for large lists
- Optimistic UI updates

---

## Future Enhancements

### Planned Features
- [ ] Bulk operations (delete multiple)
- [ ] Category archiving (soft delete)
- [ ] Category grouping/folders
- [ ] Custom color schemes
- [ ] Category usage analytics
- [ ] Import/Export categories
- [ ] Category templates
- [ ] Merge categories

---

## Support

**Documentation:** `/CATEGORY_CRUD_DOCUMENTATION.md`
**Component:** `/src/components/CategoryCRUD.tsx`
**Database:** Supabase (PostgreSQL)

**Contact:**
- Email: andreanwar713@gmail.com
- GitHub Issues: [Repository Issues]

---

**Version:** 3.0.0
**Last Updated:** November 2025
**Status:** Production Ready ✅
