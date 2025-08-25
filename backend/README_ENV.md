# Environment Variables Setup

Create a `.env` file in the backend directory with the following variables:

## Required Variables

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
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Server Configuration
PORT=3001
```

## Getting OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in the .env file

## Features that require API keys:

### OpenAI API (AI Chatbot)
- Used in the AI Eaze chatbot feature
- Provides intelligent responses to user queries
- Falls back to simple responses if API key is not provided

### Google Places API (Near Me Feature)
- Used for finding nearby restaurants and food places
- Provides real photos and information from Google Places
- Requires Google Cloud Console project with Places API enabled

### Email Configuration (Split Bill)
- Used for sending split bill requests via email
- Requires Gmail account with app password

## Security Notes

- Never commit the .env file to version control
- Keep your API keys secure and private
- Rotate API keys regularly
- Use environment-specific .env files for different deployments
