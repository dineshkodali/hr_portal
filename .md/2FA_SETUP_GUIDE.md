# Two-Factor Authentication (2FA) Setup Guide

## Overview

The SD Commercial UK LTD HR Portal now includes a comprehensive Two-Factor Authentication (2FA) system using authenticator apps. This guide explains how to set up and manage 2FA.

## Features

### 1. **Authenticator App Setup**
- Generate QR codes for easy setup with any authenticator app
- Support for Google Authenticator, Authy, Microsoft Authenticator, and compatible apps
- Manual secret key entry as fallback
- Device naming for easy identification

### 2. **Trusted Device Management**
- Track all devices used for 2FA login
- View device details (browser, OS, IP address)
- Revoke/remove suspicious devices
- Mark current device as trusted

### 3. **Login Activity Logging**
- Complete audit trail of all MFA login attempts
- View IP addresses and device information
- Track login success/failure status
- Identify suspicious activity

## User Guide

### Setting Up 2FA

1. **Navigate to Security Settings**
   - Go to Settings → Security & 2FA
   - Click "Setup 2FA" tab

2. **Choose Authenticator App**
   - Download and install one of these apps on your phone:
     - Google Authenticator
     - Authy
     - Microsoft Authenticator
     - Any other TOTP-compatible app

3. **Generate QR Code**
   - Click "Start Setup" in the Security Settings
   - Scan the QR code with your authenticator app
   - Or manually enter the provided secret key

4. **Name Your Device**
   - Enter a friendly name (e.g., "Personal iPhone")
   - This helps you identify the device later

5. **Verify Setup**
   - Enter the 6-digit code from your authenticator app
   - Click "Verify & Enable"
   - Setup is complete!

### Managing Trusted Devices

1. **View Devices**
   - Go to Settings → Security & 2FA
   - Click "Trusted Devices" tab
   - See all your registered devices with details:
     - Device name and type
     - Browser and OS
     - IP address
     - Added date and last used date

2. **Remove a Device**
   - Find the device you want to remove
   - Click the trash icon
   - Confirm removal
   - The device will no longer be trusted

### Reviewing Login Activity

1. **View Login History**
   - Go to Settings → Security & 2FA
   - Click "Login Activity" tab
   - See all your login attempts with:
     - Date and time
     - Device name
     - Browser and OS
     - IP address
     - Success/failure status

2. **Monitor for Suspicious Activity**
   - Check for logins from unknown locations
   - Verify all devices shown are yours
   - Remove any unrecognized devices immediately

## System Architecture

### Database Tables

#### `user_totp`
Stores TOTP secret keys and setup status.
```sql
- id: Unique identifier
- userId: User reference
- secret: Encrypted TOTP secret
- enabled: Setup status
- setupDate: When TOTP was initially configured
- verifiedAt: When TOTP was verified
```

#### `trusted_devices`
Tracks all devices used for MFA login.
```sql
- id: Unique device ID
- userId: User reference
- deviceName: User-friendly name
- deviceType: Device category (primary, mobile, etc.)
- browser: Browser name
- os: Operating system
- ipAddress: Login IP address
- deviceFingerprint: Hash of device characteristics
- addedAt: Registration timestamp
- lastUsedAt: Last login timestamp
- revokedAt: Revocation timestamp (if removed)
- isCurrentDevice: Boolean flag for current session
```

#### `mfa_logs`
Complete audit trail of all MFA activities.
```sql
- id: Log entry ID
- userId: User reference
- deviceId: Trusted device reference
- timestamp: Login attempt time
- ipAddress: Login source IP
- browser: Browser information
- os: Operating system
- device: Device type (Mobile/Tablet/Desktop)
- status: success, failed, or compromised
- loginAttempt: Detailed attempt description
```

#### `user_security_settings`
Overall security configuration per user.
```sql
- id: Settings record ID
- userId: User reference
- totpEnabled: TOTP status
- otpEnabled: Email OTP status
- backupCodesUsed: Counter for backup codes
- lastSecurityCheck: Last security audit timestamp
```

### API Endpoints

#### Setup TOTP
```
GET /api/auth/totp/setup/:userId
- Returns: { secret, qrCode, otpauthUrl }
```

#### Verify TOTP
```
POST /api/auth/totp/verify
- Body: { userId, code, deviceName }
- Returns: { success, message }
```

#### Disable TOTP
```
POST /api/auth/totp/disable
- Body: { userId }
- Returns: { success, message }
```

#### Get Trusted Devices
```
GET /api/auth/trusted-devices/:userId
- Returns: Array of device objects
```

#### Revoke Device
```
POST /api/auth/device/revoke
- Body: { userId, deviceId }
- Returns: { success, message }
```

#### Get MFA Logs
```
GET /api/auth/mfa-logs/:userId
- Returns: Array of login activity logs
```

#### Get Security Settings
```
GET /api/auth/security-settings/:userId
- Returns: { totpEnabled, otpEnabled }
```

## Security Best Practices

1. **Backup Your Authenticator**
   - Save recovery codes in a secure location
   - Keep your authenticator app backed up

2. **Keep Device List Clean**
   - Regularly review trusted devices
   - Remove devices you no longer use
   - Revoke immediately if compromised

3. **Monitor Login Activity**
   - Check login activity regularly
   - Look for suspicious logins from unknown locations
   - Review new devices added to your account

4. **Protect Your Secret Key**
   - The QR code/secret key is sensitive information
   - Don't share it with anyone
   - Keep a backup in a secure vault (optional)

5. **Update Passwords Regularly**
   - Change password every 90 days
   - Use strong, unique passwords
   - Never reuse passwords across accounts

## Troubleshooting

### "Invalid verification code"
- Ensure your phone's time is synced correctly
- Time drift can cause TOTP codes to be invalid
- Check that you're using the correct authenticator app
- Wait a few seconds and try again

### "Device not found"
- The device may have been revoked
- Set up a new device
- Check your trusted devices list

### "Setup failed"
- Ensure JavaScript is enabled
- Check your internet connection
- Try a different browser
- Clear browser cache and cookies

### Lost Access to Authenticator App
- Contact your IT administrator
- Provide identity verification
- Request account recovery

## Administrator Notes

### Bulk Operations
Administrators can view user 2FA status and manage devices through the admin dashboard.

### Audit Trail
All MFA activities are logged in `mfa_logs` table for compliance.

### Device Fingerprinting
Device fingerprints are generated using:
- User ID
- IP address
- User agent string
- SHA-256 hashing

This helps identify returning devices automatically.

### Recovery Options
Users should save recovery codes during setup for account recovery scenarios.

## Integration with Login Flow

1. User enters credentials
2. If TOTP is enabled, they see authenticator prompt
3. They enter 6-digit code from their authenticator app
4. System logs the login attempt with device info
5. On first login with new device, device is registered as "trusted"
6. All activity is logged for audit trail

## Future Enhancements

- [ ] Backup recovery codes
- [ ] WebAuthn/FIDO2 support
- [ ] Biometric authentication
- [ ] Risk-based authentication
- [ ] Geolocation tracking
- [ ] Email notifications for new devices
- [ ] One-time bypass codes for recovery

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Status:** Production Ready
