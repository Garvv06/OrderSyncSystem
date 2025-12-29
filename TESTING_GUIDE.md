# 🧪 Testing Guide - Verify All Fixes

## Quick Test (2 minutes)

### 1. Test Session Persistence
```
✓ Login with: admin@fastener.com / admin123
✓ Refresh the page (F5 or Ctrl+R)
✓ Expected: You should STAY logged in
```

### 2. Test User Management
```
✓ Click "User Management" in the menu
✓ Expected: You should see "Super Admin" user with statistics
✓ Try clicking "Edit Credentials" button
✓ Expected: Form should appear with editable fields
```

### 3. Test Admin Approval
```
✓ Open another browser (or incognito window)
✓ Go to your MFOI site
✓ Click "Create Account"
✓ Fill in: Name: "Test Admin", Email: test@test.com, Password: test123
✓ Click "Create Account"
✓ Go back to your main browser
✓ Click "Admin Approval" in the menu
✓ Expected: You should see "Test Admin" with a valid date (not "Invalid")
✓ Click "Approve" button
✓ Expected: User should be approved
```

### 4. Test All Features
```
✓ Dashboard - should show statistics
✓ Items - should show 79 fastener items
✓ New Order - should let you create orders
✓ All Orders - should show order history
✓ Remaining Orders - should show pending orders
```

---

## Full Test (10 minutes)

### Login & Session Tests
- [ ] Login with super admin credentials
- [ ] Refresh page multiple times - should stay logged in
- [ ] Close browser and reopen - should stay logged in (within 24 hours)
- [ ] Logout - should redirect to login page
- [ ] Try to access dashboard without login - should redirect to login

### User Management Tests (Super Admin only)
- [ ] View all users with statistics
- [ ] Click "Edit Credentials" on any user
- [ ] Change name, email, or password
- [ ] Save changes - should update successfully
- [ ] Click "Change Role" on any user (not yourself)
- [ ] Change from Admin to Super Admin or vice versa
- [ ] Save - role should update
- [ ] Try to delete a user (not yourself)
- [ ] Confirm deletion - user should be removed

### Admin Approval Tests
- [ ] Create new admin account from another browser
- [ ] Check admin approval page - should see pending request
- [ ] Verify date shows correctly (not "Invalid")
- [ ] Click "Approve" - user should be approved
- [ ] Create another test account
- [ ] Click "Reject" - user should be deleted

### Items Tests
- [ ] View items list - should show 79 items
- [ ] Search for an item - search should work
- [ ] Filter by category - filter should work
- [ ] Click "Add New Item"
- [ ] Fill in details and add sizes
- [ ] Save - item should be added
- [ ] Edit an existing item
- [ ] Change stock or other details
- [ ] Save - changes should persist
- [ ] Delete a test item - should be removed

### Orders Tests
- [ ] Click "New Order"
- [ ] Step 1: Enter party name
- [ ] Step 2: Select category
- [ ] Step 3: Select item and sizes
- [ ] Add multiple items to order
- [ ] Step 4: Review and confirm
- [ ] Submit order - should be created
- [ ] View "All Orders" - new order should appear
- [ ] View "Remaining Orders" - order should appear as Open
- [ ] Click on order to view details
- [ ] Click "Complete Order"
- [ ] Select partial quantities
- [ ] Enter bill number
- [ ] Complete - order status should update
- [ ] Stock should be reduced automatically

### Dashboard Tests
- [ ] View dashboard - should show current statistics
- [ ] Numbers should match actual data
- [ ] Click on quick action cards - should navigate correctly

---

## Multi-Device Sync Test (After running SQL)

### Setup:
1. Run `supabase-schema.sql` in Supabase SQL Editor
2. Verify tables created in Supabase Table Editor

### Test on Device 1 (Laptop):
- [ ] Login to MFOI
- [ ] Create a new order
- [ ] Note the order number

### Test on Device 2 (Mobile):
- [ ] Login with same credentials
- [ ] Check "All Orders"
- [ ] Order from Device 1 should appear immediately

### Test on Device 2 (Mobile):
- [ ] Update an item's stock
- [ ] Note the new stock value

### Test on Device 1 (Laptop):
- [ ] Refresh the items page
- [ ] Stock value should match Device 2's update

### Test Cross-Device:
- [ ] Create order on laptop → See on mobile ✓
- [ ] Create order on mobile → See on laptop ✓
- [ ] Update item on laptop → See on mobile ✓
- [ ] Update item on mobile → See on laptop ✓
- [ ] Approve admin on laptop → Approved on mobile ✓

---

## Expected Behavior

### ✅ Working Features:
- Sessions persist across page refreshes
- User management fully functional
- Admin approval shows correct dates
- Accept/Reject buttons work
- All CRUD operations work on items
- All CRUD operations work on orders
- Dashboard shows live statistics
- Multi-item orders with multiple sizes
- Partial order completion
- Stock auto-reduction on completion
- Bill number tracking
- Role-based access control

### ❌ Should NOT Happen:
- No auto-logout on page refresh
- No "Invalid" dates on admin approval
- No empty user list
- No disabled approve/reject buttons
- No errors in console
- No broken features

---

## Troubleshooting

### If you get logged out on refresh:
- Check browser console for errors
- Verify localStorage has 'admin_sessions' key
- Clear cache and try again

### If users don't show:
- Check browser console for errors
- Verify 'admins' key exists in localStorage
- Try logging out and back in

### If approve/reject doesn't work:
- Check browser console for errors
- Verify you're logged in as Super Admin
- Try refreshing the page

### If multi-device sync doesn't work:
- Verify you ran the SQL schema in Supabase
- Check Supabase project is active
- Verify both devices have internet connection
- Check Supabase logs for errors

---

## Success Criteria

All features should work WITHOUT ERRORS:
✅ Login persists across refreshes
✅ Users visible in User Management
✅ Admin approval works with valid dates
✅ All CRUD operations functional
✅ Dashboard shows correct stats
✅ Orders and items work perfectly
✅ Logo displays correctly
✅ No console errors

Your MFOI system is production-ready! 🎉
