# 🎬 Complete Guide: Self-Hosted Video Storage on Android Tablet + SD Card

This guide will help you set up **Garage** - a free, open-source S3-compatible storage server that runs on your Android tablet using an SD card.

---

## 📋 Prerequisites Checklist

| ✅ | Item | Notes |
|---|------|-------|
| ⬜ | Android tablet | ARM64 processor recommended |
| ⬜ | SD card (32GB+) | Class 10 or UHS-3 for best speed |
| ⬜ | Termux app | Download from F-Droid (NOT Google Play!) |
| ⬜ | WiFi network | Same network as your app |

---

## 🚀 STEP 1: Install Termux

### 1.1 Download Termux (Important!)

⚠️ **DO NOT download from Google Play** - it's outdated and won't work properly.

**Download from F-Droid:**
1. Open your browser on the tablet
2. Go to: https://f-droid.org/en/packages/com.termux/
3. Download the APK
4. Install it (you may need to enable "Install unknown apps" in settings)

### 1.2 Grant Storage Permission

Open Termux and run:
```bash
termux-setup-storage
```

This will prompt you to grant storage access. Tap **Allow**.

### 1.3 Update System Packages

```bash
pkg update && pkg upgrade -y
```

---

## 🚀 STEP 2: Find Your SD Card

### 2.1 Check Available Storage

```bash
df -h
```

### 2.2 List Storage Devices

```bash
ls /storage/
```

You'll see output like:
```
internal/  1234-5678/  self/
```

- `internal/` = Tablet's internal storage
- `1234-5678/` = Your SD card (random hex ID)
- `self/` = Termux-specific storage

### 2.3 Note Your SD Card Path

For this guide, I'll use `1234-5678` as the SD card path. **Replace this with your actual path!**

---

## 🚀 STEP 3: Create Directories

```bash
# Create directories for Garage
mkdir -p /storage/1234-5678/garage-storage
mkdir -p ~/garage-meta
```

---

## 🚀 STEP 4: Install Garage

### 4.1 Install wget (download tool)

```bash
pkg install wget -y
```

### 4.2 Download Garage Binary

**For most Android tablets (ARM64):**
```bash
wget https://garagehq.deuxfleurs.fr/releases/v1.1.0/garage-arm64-unknown-linux-musl.gz
```

*(If the link doesn't work, check https://garagehq.deuxfleurs.fr/ for the latest version)*

### 4.3 Extract and Setup

```bash
# Decompress
gunzip garage-arm64-unknown-linux-musl.gz

# Make executable
chmod +x garage-arm64-unknown-linux-musl

# Rename to simple name
mv garage-arm64-unknown-linux-musl garage

# Verify it works
./garage --version
```

You should see something like: `Garage v1.1.0`

---

## 🚀 STEP 5: Configure Garage

### 5.1 Create Config Directory

```bash
mkdir -p ~/.config/garage
```

### 5.2 Create Configuration File

```bash
nano ~/.config/garage/garage.toml
```

### 5.3 Paste This Configuration

**IMPORTANT:** Replace `1234-5678` with your actual SD card path!

```toml
# Garage Configuration
# Self-hosted S3 storage for Android Tablet

# Meta data directory (stores database, keep on internal storage)
meta_dir = "/data/data/com.termux/files/home/garage-meta"

# Data directory (stores your videos - use SD card!)
data_dir = "/storage/1234-5678/garage-storage"

# Network Configuration
# Bind to all interfaces so other devices can connect
rpc_bind = "0.0.0.0:3901"
s3_api_bind = "0.0.0.0:3900"
admin_api_bind = "0.0.0.0:3903"

# Single node mode (no replication needed for single device)
replication_factor = 1

# IMPORTANT: Change these credentials!
# Replace with your own secure keys (use letters, numbers, no spaces)
root_admin_access_key = "AKIAIOSFODNN7EXAMPLE"
root_admin_secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# Your tablet's IP address (we'll find this in next step)
rpc_server_ip = "192.168.1.100"

# S3 Region name
s3_region = "garage"

# Compression (optional, saves space but uses CPU)
# compression = "zstd"
```

### 5.4 Save and Exit Nano

1. Press `Ctrl+X`
2. Press `Y` to confirm save
3. Press `Enter` to confirm filename

---

## 🚀 STEP 6: Find Your Tablet's IP Address

```bash
ip addr show wlan0
```

Look for a line like:
```
inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic wlan0
```

**The IP is `192.168.1.100`** (yours might be different!)

### Update Config with Your IP

```bash
nano ~/.config/garage/garage.toml
```

Find the line `rpc_server_ip = "192.168.1.100"` and update it with your actual IP.

---

## 🚀 STEP 7: Initialize Garage

### 7.1 Initialize the Database

```bash
./garage init
```

### 7.2 Create a Bucket

A bucket is like a folder for organizing files:

```bash
./garage bucket create videos
```

### 7.3 Create an API Key for Your App

```bash
./garage key create social-media-tool --bucket videos
```

**IMPORTANT:** This will output your API credentials:

```
✅ Created access key: AKIAXXXXXXXXXXXXXXXXX
✅ Created secret key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**SAVE THESE! You cannot see the secret key again!**

Example output:
```
Created access key: AKIAIOSFODNN7EXAMPLE
Created secret key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

## 🚀 STEP 8: Start Garage Server

### 8.1 Run Garage in Background

```bash
./garage server run &
```

You should see:
```
Garage v1.1.0 starting...
Listening for RPC on 0.0.0.0:3901
S3 API listening on 0.0.0.0:3900
```

### 8.2 Test the Connection

From your **computer** (not tablet), open a browser and go to:
```
http://192.168.1.100:3900
```

You should see an XML error like:
```xml
<Error><Code>InvalidBucketName</Code><Message>The specified bucket name is empty or not valid.</Message></Error>
```

**This means it's working!** The error is normal - it just means Garage received your request.

---

## 🚀 STEP 9: Configure Your App

Create or update the `.env.local` file in your project:

```bash
# Storage Provider Configuration
# Tell your app to use Garage
STORAGE_PROVIDER=garage

# Garage Connection (use your tablet's IP!)
GARAGE_ENDPOINT=http://192.168.1.100:3900

# API Credentials (from Step 7.3)
GARAGE_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
GARAGE_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Bucket name (from Step 7.2)
GARAGE_BUCKET=videos

# Public URL for accessing files
# This can be the same as endpoint for local access
GARAGE_PUBLIC_URL=http://192.168.1.100:3900
```

---

## 🚀 STEP 10: Test Everything

### 10.1 Restart Your App

```bash
npm run dev
```

### 10.2 Go to Media Library

Open your browser and go to:
```
http://localhost:3000/media-library
```

### 10.3 Upload a Test File

1. Click the upload area or drag a file
2. Upload an image or small video
3. If successful, it should appear in the grid!

---

## 🔧 Troubleshooting

### Problem: "Permission Denied" on SD Card

**Solution:**
```bash
# Re-run setup
termux-setup-storage

# Check permissions
ls -la /storage/
```

### Problem: Can't Connect from App

**Check:**
1. Is Garage running? (look for the "Garage v1.1.0 starting..." message)
2. Is the tablet on the same WiFi network?
3. Is your IP correct in the .env.local?

**Test from computer:**
```bash
curl http://192.168.1.100:3900
```

### Problem: Connection Refused

**Check if ports are in use:**
```bash
# On tablet, check what's using port 3900
netstat -an | grep 3900
```

### Problem: App Shows "Upload Failed"

**Check:**
1. Are credentials correct in .env.local?
2. Is the bucket name correct (`videos`)?
3. Check browser console for error details

### Problem: Slow Upload Speeds

**Solutions:**
- Use a faster SD card (UHS-3)
- Try using internal storage instead of SD card
- Move Garage meta data to faster storage

---

## 📊 Storage Capacity

| SD Card | Videos (~500MB each) | Images (~5MB each) |
|---------|---------------------|-------------------|
| 32 GB | ~58 videos | ~5,000 images |
| 64 GB | ~118 videos | ~10,000 images |
| 128 GB | ~238 videos | ~20,000 images |
| **256 GB** | **~476 videos** | **~40,000 images** |
| 512 GB | ~952 videos | ~80,000 images |

*Your 256GB SD card provides plenty of space for your video library!*

---

## 🔒 Security Notes

1. **Change the default credentials!** The example keys are not secure.
2. **Keep your .env.local private** - don't commit it to git
3. **Don't expose Garage to the internet** - it's only for local network use
4. **Backup your credentials** - if you lose them, you can't access your files

---

## 🎯 Quick Commands Reference

Run these in Termux on your tablet:

```bash
# Start Garage (run this each time you restart Termux)
./garage server run &

# Check status
./garage status

# List buckets
./garage bucket list

# List files in bucket
./garage object list videos

# Check storage usage
./garage layout show

# Stop Garage
pkill garage

# See help
./garage --help
```

---

## 🚀 Auto-Start Garage (Optional)

Want Garage to start automatically when you open Termux?

```bash
# Create startup script
nano ~/.bashrc
```

Add this line at the end:
```bash
~/garage server run &
```

Then save and restart Termux.

---

## 📚 Resources

- **Garage Official Site:** https://garagehq.deuxfleurs.fr/
- **Garage GitHub:** https://github.com/deuxfleurs-org/garage
- **Termux Wiki:** https://wiki.termux.com/wiki/

---

## ✅ Checklist - Did You Complete Everything?

- [ ] Installed Termux from F-Droid
- [ ] Ran `termux-setup-storage`
- [ ] Downloaded Garage binary
- [ ] Created directories
- [ ] Configured garage.toml
- [ ] Found tablet IP address
- [ ] Initialized Garage with `garage init`
- [ ] Created bucket `videos`
- [ ] Created API key
- [ ] Saved API credentials
- [ ] Started Garage server
- [ ] Updated .env.local with credentials
- [ ] Tested upload in app

---

## 🎉 You're All Set!

Your Android tablet is now a self-hosted video storage server!

**What you can do now:**
- Upload videos and images through the Media Library
- Schedule posts that use your stored videos
- Access files from multiple devices on your network
- Store up to your SD card's capacity for free

**Need help?** Check the troubleshooting section above or review the Garage documentation.