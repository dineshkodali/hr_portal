# 2FA Authenticator System - Quick Start

## ⚡ 5-Minute Setup

### Step 1: Migrate Database (2 minutes)
```bash
npm run migrate:2fa
```

This creates 4 new tables:
- `user_totp` - Stores TOTP secrets
- `trusted_devices` - Tracks authorized devices  
- `mfa_logs` - Security audit log
- `user_security_settings` - User security config

### Step 2: Start Backend & Frontend (1 minute)
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

Backend runs on `http://localhost:3001`
Frontend runs on `http://localhost:5173`

### Step 3: Test 2FA Setup (2 minutes)

1. **Login** to the portal
2. Go to **Settings** → **Security & 2FA**
3. Click **"Setup 2FA"** tab
4. Click **"Start Setup"**
5. Scan QR code with authenticator app:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
   - Or any TOTP app
6. Enter device name (e.g., "My Phone")
7. Enter 6-digit code from app
8. Click **"Verify & Enable"**

✅ **Done!** 2FA is now enabled.

## 📱 What Users See

### In Settings → Security & 2FA

#### Setup 2FA Tab
- QR code for scanning with authenticator app
- Manual secret key option (copy-paste)
- Device name input
- 6-digit code verification
- Status: "Authenticator Enabled" when complete

#### Trusted Devices Tab
- List of all registered devices
- Device name, type, browser, OS
- IP address
- Added date & last used
- Button to remove devices

#### Login Activity Tab
- Complete history of all MFA login attempts
- Date & time
- Device name
- Browser & OS
- IP address
- Success/failed status

## 🔒 Key Features

✅ **QR Code Setup**
- Scans instantly into authenticator apps
- No manual typing required
- Supports all major authenticator apps

✅ **Multiple Device Support**
- Register different devices (phone, tablet, laptop)
- Track each device separately
- Revoke suspicious devices instantly

✅ **Full Audit Trail**
- Every login is logged
- See IP addresses and device details
- Identify suspicious activity

✅ **User-Friendly Interface**
- Step-by-step setup wizard
- Clear security status
- Easy device management

## 📊 Database Schema

```sql
-- TOTP Secrets & Setup Status
user_totp
├── id (primary key)
├── userId (references users)
├── secret (encrypted TOTP secret)
├── enabled (boolean)
└── timestamps

-- Trusted Devices
trusted_devices
├── id (primary key)
├── userId (references users)
├── deviceName (user-friendly name)
├── deviceType, browser, os
├── ipAddress
├── deviceFingerprint (for recognition)
├── addedAt, lastUsedAt, revokedAt
└── isCurrentDevice

-- MFA Activity Log
mfa_logs
├── id (primary key)
├── userId (references users)
├── deviceId (references trusted_devices)
├── timestamp
├── ipAddress, browser, os, device
├── status (success/failed/compromised)
└── loginAttempt (details)

-- User Security Settings
user_security_settings
├── id (primary key)
├── userId (references users)
├── totpEnabled (boolean)
├── otpEnabled (boolean)
├── backupCodesUsed (counter)
└── lastSecurityCheck (timestamp)
```

## 🛠️ API Endpoints

All endpoints return JSON responses.

### Setup TOTP
```
GET /api/auth/totp/setup/:userId

Response:
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,...",
  "otpauthUrl": "otpauth://totp/..."
}
```

### Verify TOTP
```
POST /api/auth/totp/verify

Body:
{
  "userId": "u-123",
  "code": "123456",
  "deviceName": "My iPhone"
}

Response:
{
  "success": true,
  "message": "TOTP verified and enabled"
}
```

### Disable TOTP
```
POST /api/auth/totp/disable

Body:
{
  "userId": "u-123"
}

Response:
{
  "success": true,
  "message": "TOTP disabled"
}
```

### Get Security Settings
```
GET /api/auth/security-settings/:userId

Response:
{
  "totpEnabled": true,
  "otpEnabled": false
}
```

### Get Trusted Devices
```
GET /api/auth/trusted-devices/:userId

Response: [
  {
    "id": "device_123",
    "deviceName": "My iPhone",
    "deviceType": "primary",
    "browser": "Safari",
    "os": "iOS",
    "ipAddress": "192.168.1.1",
    "addedAt": "2024-12-20T10:30:00Z",
    "lastUsedAt": "2024-12-20T15:45:00Z",
    "isCurrentDevice": true
  }
]
```

### Revoke Device
```
POST /api/auth/device/revoke

Body:
{
  "userId": "u-123",
  "deviceId": "device_123"
}

Response:
{
  "success": true,
  "message": "Device revoked"
}
```

### Get MFA Logs
```
GET /api/auth/mfa-logs/:userId

Response: [
  {
    "id": "log_123",
    "timestamp": "2024-12-20T15:45:00Z",
    "ipAddress": "192.168.1.1",
    "browser": "Safari",
    "os": "iOS",
    "device": "Mobile",
    "deviceName": "My iPhone",
    "status": "success",
    "loginAttempt": "TOTP login successful"
  }
]
```

## 📝 File Structure

```
components/
├── SecuritySettings.tsx       ← 2FA UI Component
├── Settings.tsx              ← Updated with 2FA integration
└── ...

server.js                      ← 7 new 2FA endpoints
services/
└── api.ts                     ← 7 new API methods

scripts/
└── migrate_2fa.js             ← Database migration

database_schema_postgresql.sql  ← 4 new tables

package.json                   ← Added "migrate:2fa" script

.md/
├── 2FA_SETUP_GUIDE.md        ← User documentation
└── 2FA_IMPLEMENTATION.md     ← Technical details
```

## 🚀 Workflow

### User Setup Process
```
1. Go to Settings
2. Click "Security & 2FA"
3. Click "Setup 2FA"
4. Click "Start Setup"
   ↓ QR code generated (backend generates secret)
5. Scan QR with phone authenticator app
6. Enter device name
7. Enter 6-digit code from app
8. Click "Verify & Enable"
   ↓ TOTP secret saved and enabled
   ↓ Device registered in trusted_devices
   ↓ Setup logged in mfa_logs
9. See "Authenticator Enabled" confirmation
```

### Device Management Flow
```
User Views Trusted Devices
    ↓
Can see: name, type, browser, OS, IP, dates
    ↓
Can revoke device (marks as revokedAt)
    ↓
Device removed from active list
    ↓
All activity logged for audit
```

### Login Activity Tracking
```
Every MFA attempt triggers logging:
- Log entry created in mfa_logs
- Records: user, device, IP, browser, OS
- Records: timestamp, status, attempt details
- Shows to user in "Login Activity" tab
```

## ⚙️ Configuration

### Speakeasy (TOTP)
```javascript
speakeasy.generateSecret({
  name: `SD Commercial HR Portal (${userId})`,
  issuer: 'SD Commercial UK LTD',
  length: 32
})
```

### Time Window
```javascript
speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: code,
  window: 2  // Allows 60-second skew (±30 seconds)
})
```

### Device Fingerprinting
```javascript
crypto.createHash('sha256')
  .update(`${userId}_${deviceName}_initial`)
  .digest('hex')
```

## 🔍 Verification

After setup, verify everything works:

```bash
# 1. Check database tables created
npm run check-db

# 2. Test API endpoints
curl http://localhost:3001/api/auth/totp/setup/u-123

# 3. Check logs
tail -f logs/server.log

# 4. Browser DevTools
- Network tab shows 2FA API calls
- Console shows no errors
- Security settings load correctly
```

## 📚 Documentation

### For Users
See `.md/2FA_SETUP_GUIDE.md`
- How to set up 2FA
- How to manage devices
- How to review activity
- Troubleshooting tips

### For Developers
See `.md/2FA_IMPLEMENTATION.md`
- Architecture details
- Database schema
- API specifications
- Integration points

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to setup TOTP" | Check backend running on 3001, verify DB tables created |
| "Invalid verification code" | Phone time must match server time (±30 sec) |
| "Device not found" | Page may be cached, refresh and try again |
| "404 on 2FA endpoints" | Restart backend server after code changes |
| "QR code not showing" | Check qrcode npm package installed, clear cache |

## 📞 Support

For issues:
1. Check browser console (F12) for errors
2. Check backend logs: `npm run server`
3. Verify database: `npm run check-db`
4. Run migration again: `npm run migrate:2fa`
5. Restart both backend and frontend

## ✅ Checklist

- [ ] Run `npm run migrate:2fa`
- [ ] Start backend: `npm run server`
- [ ] Start frontend: `npm run dev`
- [ ] Login to portal
- [ ] Go to Settings > Security & 2FA
- [ ] Click "Setup 2FA"
- [ ] Scan QR with phone
- [ ] Enter device name
- [ ] Enter 6-digit code
- [ ] Verify "Authenticator Enabled"
- [ ] Check Trusted Devices shows device
- [ ] Check Login Activity shows entry
- [ ] Test device revocation
- [ ] Test disabling 2FA
- [ ] Re-enable and verify

## 🎉 Done!

Your 2FA authenticator system is ready! Users can now:
- ✅ Set up 2FA with any authenticator app
- ✅ Manage multiple trusted devices
- ✅ Review complete login activity
- ✅ Revoke suspicious devices
- ✅ Track security events

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 2024
