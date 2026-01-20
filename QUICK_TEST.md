# 🧪 Quick Test Guide

## Test 1: User Registration & Approval ✅

### Step 1: Register New User
```
1. Go to login page
2. Click "Need access? Request here" (bottom link)
3. Fill in:
   - Name: Test Admin
   - Email: test@example.com
   - Password: test123
4. Click "Request Access"
5. ✅ You should see: "Registration successful! Your request is pending approval..."
6. Switch back to "Login" view
```

### Step 2: Approve New User (as Super Admin)
```
1. Login as:
   - Email: admin@fastener.com
   - Password: admin123

2. Click "Approvals" in left sidebar

3. ✅ You should see: "Test Admin" request with email "test@example.com"

4. Click "Approve" button (green)

5. ✅ Alert: "Admin approved successfully!"

6. Request disappears from list
```

### Step 3: Login as New User
```
1. Click Logout

2. Login as:
   - Email: test@example.com
   - Password: test123

3. ✅ Login successful!

4. ✅ Can see all tabs: Dashboard, Items, Orders, Approvals, Users, Profile
```

### Step 4: Verify Admin Permissions
```
1. Still logged in as test@example.com

2. Click "Profile" tab

3. ✅ You should see:
   - "Edit Profile" button is GRAYED OUT/DISABLED
   - Orange warning: "⚠️ Only super admins can change email and password"
   - Role badge shows: "admin" (blue)

4. ✅ CORRECT! Regular admin cannot change credentials
```

---

## Test 2: Super Admin Password Change ✅

### Step 1: Login as Super Admin
```
1. Logout (if logged in as test@example.com)

2. Login as:
   - Email: admin@fastener.com
   - Password: admin123
```

### Step 2: Change Password
```
1. Click "Profile" tab in sidebar

2. ✅ Check that:
   - Role badge shows: "superadmin" (purple)
   - "Edit Profile" button is ENABLED (blue, not gray)
   - NO orange warning message

3. Click "Edit Profile" button

4. ✅ Password fields appear:
   - "New Password" field
   - "Confirm Password" field

5. Fill in:
   - Email: admin@fastener.com (leave as is)
   - New Password: newpass123
   - Confirm Password: newpass123

6. Click "Save Changes" (green button)

7. ✅ Alert: "Profile updated successfully! Please login again."

8. ✅ Page automatically reloads (logout)
```

### Step 3: Login with New Password
```
1. Login screen appears

2. Login as:
   - Email: admin@fastener.com
   - Password: newpass123 (NEW PASSWORD!)

3. ✅ Login successful!

4. ✅ You're back in the system
```

### Step 4: Change Password Back (Optional)
```
Repeat Test 2 but change password back to: admin123
```

---

## Test 3: Check Approvals Tab for Both Roles ✅

### As Admin (regular admin):
```
1. Login as: test@example.com / test123

2. Click "Approvals" tab

3. ✅ Can see approval requests
4. ✅ Can approve/reject new users

✅ CORRECT! Regular admins CAN approve users
```

### As Super Admin:
```
1. Login as: admin@fastener.com / admin123

2. Click "Approvals" tab

3. ✅ Can see approval requests
4. ✅ Can approve/reject new users

✅ CORRECT! Super admins CAN also approve users
```

---

## Test 4: Verify Database Sync (Supabase) ✅

### If Using Supabase:
```
1. Register a new user (Test 1)

2. Go to Supabase Dashboard
   - Project → Table Editor
   - Select "admins" table

3. ✅ Check that:
   - New user appears in table
   - "approved" column = FALSE
   - "role" column = "admin"

4. Approve the user in your app

5. Refresh Supabase table

6. ✅ Check that:
   - "approved" column = TRUE

✅ CORRECT! Data is syncing to cloud
```

---

## 🔍 Debugging Tips

### Open Browser Console (F12)

You should see these messages:

**When Loading Admins:**
```
📊 Loaded admins from Supabase: 2 admins
Admins: [
  { email: "admin@fastener.com", approved: true },
  { email: "test@example.com", approved: true }
]
```

**When Registering New User:**
```
✅ Admin saved to Supabase successfully
```

**When Approving User:**
```
📊 Loaded admins from Supabase: 2 admins
(shows updated approval status)
```

---

## ❌ Common Issues & Solutions

### Issue: "Approvals tab is empty after registration"

**Check:**
1. Browser console (F12) - any errors?
2. Supabase RLS disabled? Run `/disable-rls.sql`
3. Check Supabase admins table - is user there with approved=false?

**Solution:**
- Run `/disable-rls.sql` in Supabase SQL Editor
- Clear browser cache and try again

---

### Issue: "Edit Profile button is disabled for super admin"

**Check:**
1. Browser console → Type: `localStorage.getItem('admin_sessions')`
2. Check if role is 'superadmin'
3. Check Profile page - role badge should be purple

**Solution:**
- Logout and login again as `admin@fastener.com`
- Clear localStorage if needed

---

### Issue: "Can't login after changing password"

**Solution:**
1. Go to Supabase SQL Editor
2. Run:
   ```sql
   UPDATE admins 
   SET password = 'admin123' 
   WHERE email = 'admin@fastener.com';
   ```
3. Login with `admin123`

---

## ✅ Success Checklist

After running all tests, you should have:

- [ ] Created a new user account
- [ ] Seen the request in Approvals tab
- [ ] Approved the request as super admin
- [ ] Logged in as the new user
- [ ] Verified new user is "admin" role (cannot change password)
- [ ] Logged in as super admin
- [ ] Verified super admin can change password
- [ ] Successfully changed super admin password
- [ ] Successfully logged in with new password
- [ ] Verified both roles can approve new users
- [ ] (If Supabase) Verified data appears in Supabase tables

---

## 🎉 All Tests Passed?

**Congratulations!** Your system is working perfectly!

**Next Steps:**
1. Deploy to Vercel (see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md))
2. Change default admin password
3. Add your real admin users
4. Start managing your inventory!

---

**Need More Help?**
- See [FIXES_SUMMARY.md](./FIXES_SUMMARY.md) for detailed troubleshooting
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment
- Check browser console (F12) for detailed error messages
