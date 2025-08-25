# Quick Google API Setup

## ✅ **You have the API key - Now let's set it up!**

### **Step 1: Enable Places API**
1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Places API"
5. Click "Enable"

### **Step 2: Add API Key to Backend**

Create a file called `.env` in your `backend` folder with this content:

```env
# Database Configuration
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# Email Configuration (for split bill feature)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# OpenAI API Key (for AI chatbot)
OPENAI_API_KEY=your_openai_api_key_here

# Google Places API Key (for nearby places)
GOOGLE_PLACES_API_KEY=YOUR_ACTUAL_API_KEY_HERE

# Server Configuration
PORT=3001
```

**Replace `YOUR_ACTUAL_API_KEY_HERE` with your Google Maps Platform API key**

### **Step 3: Restart Backend**
```bash
cd backend
npm start
```

### **Step 4: Test It**
1. Start your frontend: `cd eazygame && npm run dev`
2. Go to "Near Me" tab
3. Allow location access
4. You should see real restaurant photos! 🎉

## 🔧 **If It's Not Working**

### **Check These:**
1. **API Key Format**: Should look like `AIzaSyC...` (long string)
2. **Places API Enabled**: Make sure you enabled it in Google Console
3. **Billing**: Google requires billing to be enabled (but you get $200 free credit)
4. **Restrictions**: If you set restrictions, make sure `localhost:3000` is allowed

### **Test Your API Key:**
Try this URL in your browser (replace with your actual key):
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=1.3521,103.8198&radius=1500&type=restaurant&key=YOUR_API_KEY
```

If you see JSON data, your key is working! 🎉

## 💡 **Need Help?**
- Check the browser console for errors
- Check the backend console for API errors
- Make sure your `.env` file is in the `backend` folder
- Restart both frontend and backend after adding the key



