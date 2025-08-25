# Google Places API Setup Guide

## 🎯 **What You'll Get**
- Real photos from Google Places instead of emoji icons
- Accurate restaurant information and ratings
- Real-time distance calculations
- Professional-looking place cards

## 📋 **Step-by-Step Setup**

### **1. Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select Your Project**
   - Choose your existing project or create a new one
   - Make sure you're in the correct project

3. **Enable Places API**
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click on "Places API"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict API Key (Recommended)**
   - Click on the created API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `localhost:3000/*` for development)
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" from the dropdown
   - Click "Save"

### **2. Environment Configuration**

1. **Add to Backend .env File**
   ```env
   # Add this line to your backend/.env file
   GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   ```

2. **Restart Backend Server**
   ```bash
   cd backend
   npm start
   ```

### **3. Test the Integration**

1. **Start Your Application**
   ```bash
   cd eazygame
   npm run dev
   ```

2. **Navigate to "Near Me" Tab**
   - Click on the "Near Me" tab in your app
   - Allow location access when prompted
   - You should see real restaurant photos instead of emojis

## 🔧 **How It Works**

### **Backend API Endpoint**
- **URL**: `GET /api/places/nearby`
- **Parameters**:
  - `lat`: Latitude
  - `lng`: Longitude  
  - `type`: Place type (restaurant, cafe, etc.)
  - `radius`: Search radius in meters (default: 1500)

### **Response Format**
```json
{
  "places": [
    {
      "id": "place_id",
      "name": "Restaurant Name",
      "category": "restaurant",
      "rating": 4.5,
      "distance": "0.3km",
      "deliveryTime": "15-25 min",
      "image": "https://maps.googleapis.com/maps/api/place/photo?...",
      "priceRange": "$$",
      "address": "123 Main St",
      "openNow": true,
      "userRatingsTotal": 150
    }
  ]
}
```

## 🎨 **Features**

### **Real Photos**
- High-quality restaurant photos from Google Places
- Automatic fallback to emoji if photo fails to load
- Optimized image sizes for mobile

### **Accurate Information**
- Real ratings and review counts
- Actual distance calculations
- Opening hours status
- Price level indicators

### **Smart Fallbacks**
- If Google Places API fails, shows mock data
- If photos fail to load, shows emoji icons
- Graceful error handling

## 💰 **Cost Considerations**

### **Google Places API Pricing**
- **Nearby Search**: $17 per 1000 requests
- **Place Photos**: $7 per 1000 requests
- **Free Tier**: $200 credit per month

### **Typical Usage**
- 1000 searches per month = ~$17
- 1000 photo requests per month = ~$7
- **Total**: ~$24/month for moderate usage

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"API key not configured" error**
   - Check that `GOOGLE_PLACES_API_KEY` is in your `.env` file
   - Restart the backend server

2. **"Failed to fetch places" error**
   - Verify Places API is enabled in Google Console
   - Check API key restrictions
   - Ensure you have billing enabled

3. **Photos not loading**
   - Check network connectivity
   - Verify photo permissions in API key
   - Photos will fallback to emojis automatically

4. **No places found**
   - Check your location permissions
   - Try a different location
   - Verify the search radius

### **Debug Mode**
Add this to your backend for debugging:
```javascript
console.log('Places API Response:', data);
```

## 🚀 **Next Steps**

### **Enhancements You Can Add**
1. **More Place Types**: Add cafes, bars, fast food, etc.
2. **Search Functionality**: Let users search for specific places
3. **Place Details**: Show full place information when clicked
4. **Reviews**: Display user reviews and ratings
5. **Directions**: Add navigation to places
6. **Favorites**: Let users save favorite places

### **Advanced Features**
1. **Caching**: Cache place data to reduce API calls
2. **Offline Support**: Store places locally for offline access
3. **Personalization**: Learn user preferences
4. **Integration**: Connect with food delivery APIs

## 📞 **Support**

If you encounter issues:
1. Check the Google Cloud Console for API usage and errors
2. Verify your API key is working with a simple test
3. Check the browser console for frontend errors
4. Check the backend console for API errors

## 🎉 **You're All Set!**

Your app now has real Google Places integration with beautiful photos and accurate information. Users will see professional-looking place cards instead of emoji icons!



