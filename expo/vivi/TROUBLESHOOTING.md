# 🔧 Expo QR Code Login Troubleshooting Guide

## Common Issues & Solutions

### 1. **Network Connection Issues**

**Problem**: Mobile device cannot connect to the development server or backend API.

**Solutions**:
- **Same Network**: Ensure both your computer and mobile device are on the same WiFi network
- **Firewall**: Check if your computer's firewall is blocking connections
- **Router Settings**: Some routers block device-to-device communication

### 2. **Backend API Connection**

**Problem**: Mobile app cannot reach the backend API.

**Solutions**:
- **Local Backend**: Make sure your backend server is running on `localhost:5000`
- **Network IP**: The app will automatically detect your computer's IP address
- **CORS Issues**: Backend should allow requests from mobile devices

### 3. **Development vs Production**

**Problem**: App tries to connect to production backend instead of local development server.

**Solution**: The app automatically detects development mode and uses local backend.

## 🔍 **Debugging Steps**

### Step 1: Check Network Configuration
```bash
# On your computer, find your IP address
# Windows:
ipconfig

# Mac/Linux:
ifconfig
# or
ip addr
```

### Step 2: Verify Backend is Running
```bash
# Make sure your backend is running on port 5000
curl http://localhost:5000/api/health
# or
curl http://YOUR_IP:5000/api/health
```

### Step 3: Check Expo Development Server
```bash
# Start Expo development server
npx expo start

# Look for the QR code and IP address in the terminal
# Example: exp://192.168.1.100:8081
```

### Step 4: Test Network Connectivity
```bash
# From your mobile device, try to access:
http://YOUR_COMPUTER_IP:5000/api/health
```

## 🛠️ **Manual Configuration**

If automatic detection doesn't work, you can manually set the API URL:

### Option 1: Environment Variable
```bash
# Create a .env file in the expo/vivi directory
API_URL=http://YOUR_COMPUTER_IP:5000
```

### Option 2: Direct Configuration
Edit `services/config.ts` and manually set the API URL:
```typescript
export const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

## 📱 **Mobile Device Setup**

### Android
- Enable "Developer options" in Settings
- Enable "USB debugging"
- Allow "Install from unknown sources"

### iOS
- Use Expo Go app from App Store
- Ensure device is on same WiFi network

## 🔧 **Backend Configuration**

Make sure your backend allows connections from mobile devices:

### CORS Configuration
```javascript
// In your backend CORS settings, add:
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://YOUR_IP:3000',
  'http://YOUR_IP:8081',
  // Add your computer's IP address
];
```

### Network Binding
Make sure your backend server binds to all network interfaces:
```javascript
// Instead of:
app.listen(5000);

// Use:
app.listen(5000, '0.0.0.0');
```

## 🚨 **Common Error Messages**

### "Network Error"
- Check if devices are on same network
- Verify backend is running
- Check firewall settings

### "Cannot connect to server"
- Verify API URL is correct
- Check if backend is accessible from mobile device
- Test with browser on mobile device

### "CORS Error"
- Update backend CORS configuration
- Add mobile device IP to allowed origins

## 📞 **Getting Help**

If you're still having issues:

1. Check the console logs in Expo development tools
2. Look at the network tab in browser developer tools
3. Test API endpoints directly from mobile browser
4. Try using a different network (mobile hotspot)

## 🔄 **Alternative Solutions**

### Use Expo Tunnel
```bash
npx expo start --tunnel
```

### Use Expo Development Build
```bash
npx expo install expo-dev-client
npx expo run:android
# or
npx expo run:ios
```

### Use Physical USB Connection
```bash
# Connect device via USB and use:
npx expo start --localhost
``` 