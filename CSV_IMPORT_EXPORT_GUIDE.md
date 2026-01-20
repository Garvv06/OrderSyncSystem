# 📊 CSV Import/Export Guide for Orders

## ✅ What's New

Your Order Management system now supports:
- ✅ **Export to CSV** - Export selected or all orders to CSV file
- ✅ **Import from CSV** - Import bulk orders from CSV file
- ✅ **Select & Delete** - Select multiple orders and delete them
- ✅ **Select All** - Quick select/deselect all orders
- ❌ **No Auto Export** - Auto CSV export on order completion REMOVED

---

## 🎯 Features Overview

### **1. Export to CSV**
- Click green "Export to CSV" button
- If orders are selected → Exports only selected orders
- If no selection → Exports all visible orders
- Downloads CSV file with timestamp

### **2. Import from CSV**
- Click blue "Import CSV" button
- Select CSV file with correct format
- System automatically creates orders
- Validates item names and sizes
- Shows success message with count

### **3. Select & Delete Orders**
- Checkbox on each order
- "Select All" checkbox at top
- Red "Delete Selected" button
- Confirmation dialog before deletion
- Permanent deletion (cannot undo!)

### **4. Auto Export Removed**
- Orders no longer auto-export when completed
- You have full control when to export
- Export manually using the button

---

## 📋 CSV Format

### **Column Structure**

Your CSV file MUST have these 13 columns in this exact order:

```
Order No,Party Name,Order Date,Status,Order Type,Item Name,Size,Quantity,Completed Qty,Remaining Qty,Price,Line Total,Bill Numbers
```

### **Column Details**

| Column # | Column Name | Description | Example | Required |
|----------|-------------|-------------|---------|----------|
| 1 | Order No | Unique order number | ORD-0001 | ✅ Yes |
| 2 | Party Name | Customer/Vendor name | ABC Company | ✅ Yes |
| 3 | Order Date | Date in any standard format | 1/20/2026 | ✅ Yes |
| 4 | Status | Order status | Open | ✅ Yes |
| 5 | Order Type | Type of order | purchase | ✅ Yes |
| 6 | Item Name | Exact item name from system | Hex Bolt | ✅ Yes |
| 7 | Size | Exact size from item | M6 | ✅ Yes |
| 8 | Quantity | Total ordered quantity | 100 | ✅ Yes |
| 9 | Completed Qty | Quantity completed | 50 | ❌ No (0 if blank) |
| 10 | Remaining Qty | Auto-calculated (ignored) | 50 | ❌ No |
| 11 | Price | Price per unit | 5.50 | ✅ Yes |
| 12 | Line Total | Auto-calculated (ignored) | 550.00 | ❌ No |
| 13 | Bill Numbers | Bill numbers separated by ; | BILL-001;BILL-002 | ❌ No |

---

## 📝 Field Specifications

### **Order No**
- **Format:** Any text (e.g., ORD-0001, PO-2024-001)
- **Unique:** Each order should have unique number
- **Multi-line:** Same order number groups items together

### **Party Name**
- **Format:** Any text
- **Example:** "ABC Company", "John's Hardware"
- **Note:** Same for all items in one order

### **Order Date**
- **Format:** MM/DD/YYYY or YYYY-MM-DD or DD/MM/YYYY
- **Examples:** 
  - 1/20/2026
  - 2026-01-20
  - 20/01/2026
- **Note:** System parses common date formats

### **Status**
- **Options:**
  - `Open` - New order, nothing completed
  - `Partially Completed` - Some items completed
  - `Completed` - All items completed
- **Default:** Use "Open" for new imports

### **Order Type**
- **Options:**
  - `purchase` - Purchase order (adds stock)
  - `sale` - Sale order (reduces stock)
- **Important:** Must match current tab (Purchase/Sale)
- **Case:** Lowercase

### **Item Name**
- **Must Match:** Exact item name from your system
- **Examples:**
  - Hex Bolt
  - Socket Head Cap Screw
  - Flat Washer
  - Nylon Insert Lock Nut
- **Case Sensitive:** No (system matches case-insensitive)
- **Find Items:** Go to Items tab to see available items

### **Size**
- **Must Match:** Exact size available for that item
- **Examples:**
  - M6
  - M8
  - M10
  - M12
  - 1/4"
  - 3/8"
- **Case Sensitive:** Yes
- **Validation:** System checks if size exists for the item

### **Quantity**
- **Format:** Whole number
- **Minimum:** 1
- **Example:** 100

### **Completed Qty**
- **Format:** Whole number
- **Default:** 0 if blank
- **Maximum:** Cannot exceed Quantity
- **Example:** 50

### **Price**
- **Format:** Decimal number
- **Currency:** ₹ (Rupees)
- **Example:** 5.50

### **Bill Numbers**
- **Format:** Multiple bills separated by semicolon (;)
- **Examples:**
  - BILL-001
  - BILL-001;BILL-002
  - BILL-001;BILL-002;BILL-003
- **Optional:** Leave blank if no bills yet

---

## 📄 Sample CSV File

### **Example 1: Simple Order (1 Item)**

```csv
Order No,Party Name,Order Date,Status,Order Type,Item Name,Size,Quantity,Completed Qty,Remaining Qty,Price,Line Total,Bill Numbers
ORD-0001,ABC Company,1/20/2026,Open,purchase,Hex Bolt,M6,100,0,100,5.50,550.00,
```

### **Example 2: Multi-Item Order**

```csv
Order No,Party Name,Order Date,Status,Order Type,Item Name,Size,Quantity,Completed Qty,Remaining Qty,Price,Line Total,Bill Numbers
ORD-0002,XYZ Hardware,1/20/2026,Open,purchase,Hex Bolt,M6,200,0,200,5.50,1100.00,
ORD-0002,XYZ Hardware,1/20/2026,Open,purchase,Socket Head Cap Screw,M8,150,0,150,8.75,1312.50,
ORD-0002,XYZ Hardware,1/20/2026,Open,purchase,Flat Washer,M10,300,0,300,2.25,675.00,
```

### **Example 3: Partially Completed Order**

```csv
Order No,Party Name,Order Date,Status,Order Type,Item Name,Size,Quantity,Completed Qty,Remaining Qty,Price,Line Total,Bill Numbers
ORD-0003,John's Shop,1/15/2026,Partially Completed,sale,Hex Bolt,M6,100,50,50,5.50,550.00,BILL-001
ORD-0003,John's Shop,1/15/2026,Partially Completed,sale,Flat Washer,M6,200,200,0,2.25,450.00,BILL-001;BILL-002
```

### **Example 4: Complete Order**

```csv
Order No,Party Name,Order Date,Status,Order Type,Item Name,Size,Quantity,Completed Qty,Remaining Qty,Price,Line Total,Bill Numbers
ORD-0004,Tech Industries,1/10/2026,Completed,purchase,Socket Head Cap Screw,M8,500,500,0,8.75,4375.00,BILL-005
```

---

## 🎓 Step-by-Step Import Guide

### **Step 1: Prepare Your CSV**

1. Open Excel, Google Sheets, or any spreadsheet app
2. Create first row with exact column headers:
   ```
   Order No,Party Name,Order Date,Status,Order Type,Item Name,Size,Quantity,Completed Qty,Remaining Qty,Price,Line Total,Bill Numbers
   ```
3. Fill in your data starting from row 2

### **Step 2: Verify Item Names & Sizes**

1. Go to **Items** tab in MFOI system
2. Check exact names and available sizes
3. Copy exact names (case doesn't matter)
4. Copy exact sizes (case DOES matter!)

### **Step 3: Check Order Type**

1. Go to **All Orders** tab
2. Switch to the tab you want (Purchase/Sale)
3. Make sure CSV "Order Type" column matches

### **Step 4: Save as CSV**

1. File → Save As → CSV (Comma delimited)
2. Name it (e.g., `orders_import.csv`)
3. Save to your computer

### **Step 5: Import**

1. Go to **All Orders** tab
2. Select Purchase or Sale tab
3. Click blue **"Import CSV"** button
4. Select your CSV file
5. Wait for success message

### **Step 6: Verify**

1. Check imported orders appear in list
2. Expand orders to verify items
3. Check quantities, prices, status

---

## ❌ Common Import Errors

### **Error: "Item not found"**

**Problem:** Item name or size doesn't match system

**Solution:**
1. Go to Items tab
2. Find exact item name
3. Click edit to see available sizes
4. Update CSV with exact name/size
5. Try import again

**Example:**
- ❌ Wrong: `Hex bolt M6` (lowercase 'bolt')
- ✅ Correct: `Hex Bolt M6`
- ❌ Wrong: Size `m6` (lowercase)
- ✅ Correct: Size `M6` (uppercase)

### **Error: "CSV file is empty"**

**Problem:** File has no data or wrong format

**Solution:**
1. Check file has header row + data rows
2. Make sure it's saved as .csv (not .xlsx)
3. Open in text editor to verify comma separation

### **Error: Nothing imports**

**Problem:** Column order wrong or missing columns

**Solution:**
1. Check you have all 13 columns
2. Check header row exactly matches format
3. Check no extra commas in data

---

## 📤 Export Guide

### **Export Selected Orders**

1. ✅ Check boxes next to orders you want
2. Click green **"Export to CSV"** button
3. File downloads with selected orders only
4. Filename: `purchase_orders_2026-01-20.csv` or `sale_orders_2026-01-20.csv`

### **Export All Orders**

1. ❌ Don't check any boxes
2. Click green **"Export to CSV"** button
3. File downloads with ALL visible orders
4. Includes all orders in current tab (Purchase/Sale)

### **Export Tips**

- Export creates multi-line CSV (one row per item)
- Same order appears on multiple rows if multiple items
- Use exported CSV as template for new imports
- Exported file can be imported back

---

## 🗑️ Delete Orders

### **Delete Single Order**

1. ✅ Check the order checkbox
2. Red button shows "Delete Selected (1)"
3. Click "Delete Selected" button
4. Confirm deletion
5. Order permanently deleted

### **Delete Multiple Orders**

1. ✅ Check multiple order checkboxes
2. Red button shows count: "Delete Selected (5)"
3. Click "Delete Selected" button
4. Confirm deletion
5. All selected orders deleted

### **Delete All Orders**

1. ✅ Click "Select All" checkbox at top
2. All orders selected
3. Click "Delete Selected" button
4. Confirm deletion
5. All orders deleted

### **⚠️ Warning**

- Deletion is **PERMANENT**
- Cannot be undone
- Stock is **NOT** adjusted back
- Export orders before deleting if you need backup

---

## 🔍 Available Items Reference

### **Item Names (Copy Exactly)**

**Bolts:**
- Hex Bolt
- Carriage Bolt
- Eye Bolt
- U-Bolt
- Anchor Bolt

**Screws:**
- Socket Head Cap Screw
- Button Head Screw
- Flat Head Screw
- Pan Head Screw
- Self-Tapping Screw

**Nuts:**
- Hex Nut
- Nylon Insert Lock Nut
- Wing Nut
- Coupling Nut
- Flange Nut

**Washers:**
- Flat Washer
- Spring Washer
- Fender Washer
- Square Washer

**Pins:**
- Clevis Pin
- Cotter Pin
- Dowel Pin
- Roll Pin

**Rivets:**
- Blind Rivet
- Solid Rivet
- Pop Rivet

**Anchors:**
- Sleeve Anchor
- Wedge Anchor
- Drop-In Anchor

*(Check Items tab for complete list with sizes)*

---

## 💡 Best Practices

### **For Importing**

1. **Start Small:** Import 1-2 orders first to test
2. **Verify Items:** Check Items tab before creating CSV
3. **Use Template:** Export existing order and modify
4. **Backup:** Keep original CSV file
5. **Check Tab:** Import to correct Purchase/Sale tab

### **For Exporting**

1. **Export Regularly:** Keep backup of all orders
2. **Date Stamps:** Filename includes date automatically
3. **Analysis:** Open in Excel for reporting
4. **Archive:** Keep historical exports

### **For Deleting**

1. **Export First:** Always export before mass delete
2. **Double Check:** Verify selection before deleting
3. **Stock Impact:** Remember deletion doesn't restore stock
4. **Confirmation:** Read confirmation dialog carefully

---

## 🎯 Quick Reference

### **Import Workflow**

```
1. Prepare CSV with correct format
2. Verify item names/sizes in Items tab
3. Go to All Orders → Select Purchase/Sale tab
4. Click "Import CSV"
5. Select file
6. Verify imported orders
```

### **Export Workflow**

```
1. Go to All Orders → Select tab
2. Optional: Select specific orders
3. Click "Export to CSV"
4. File downloads automatically
```

### **Delete Workflow**

```
1. Select orders (checkboxes)
2. Click "Delete Selected"
3. Confirm deletion
4. Orders removed permanently
```

---

## ✅ Feature Summary

| Feature | Button Color | Icon | Description |
|---------|--------------|------|-------------|
| **Export CSV** | 🟢 Green | Download | Export selected/all orders |
| **Import CSV** | 🔵 Blue | Upload | Import orders from file |
| **Delete Selected** | 🔴 Red | Trash | Delete selected orders |
| **Select All** | - | Checkbox | Select/deselect all |
| **Order Checkbox** | - | Checkbox | Select individual order |

---

## 📞 Need Help?

If CSV import fails:
1. Check CSV format matches exactly
2. Verify item names in Items tab
3. Ensure sizes exist for items
4. Check order type matches tab
5. Save as CSV not Excel
6. Check no special characters in data

**Your system is ready for bulk order management!** 🚀
