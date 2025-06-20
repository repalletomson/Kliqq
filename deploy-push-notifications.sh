#!/bin/bash

# 🔔 Push Notification System Deployment Script
# This script automates the deployment of your push notification system

set -e

echo "🚀 Starting Push Notification System Deployment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please login to Supabase:"
    supabase login
fi

echo "✅ Supabase authentication verified"

# Get project reference from config (auto-detected)
PROJECT_REF="vsupqohqsgmpvzaszmtb"
echo "📋 Detected Project Reference: $PROJECT_REF"

# Confirm with user
read -p "Is this correct? (y/n): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "📋 Please enter your Supabase project reference ID manually:"
    read -p "Project Reference: " PROJECT_REF
    if [ -z "$PROJECT_REF" ]; then
        echo "❌ Project reference is required"
        exit 1
    fi
fi

# Link project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF"

# Get Supabase URL from config (auto-detected)
SUPABASE_URL="https://vsupqohqsgmpvzaszmtb.supabase.co"
echo "📋 Detected Supabase URL: $SUPABASE_URL"

echo "📋 Please enter your Supabase Service Role Key:"
echo "   (You can find this in Supabase Dashboard → Settings → API → service_role key)"
read -p "Service Role Key: " SERVICE_ROLE_KEY

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Service Role Key is required"
    echo "💡 Get it from: https://vsupqohqsgmpvzaszmtb.supabase.co/project/settings/api"
    exit 1
fi

# Set secrets for Edge Function
echo "🔐 Setting up Edge Function secrets..."
supabase secrets set SUPABASE_URL="$SUPABASE_URL"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"

echo "✅ Secrets configured"

# Deploy Edge Function
echo "📡 Deploying Edge Function..."
supabase functions deploy send-push-notification

echo "✅ Edge Function deployed successfully"

# Prompt for database setup
echo "🗄️  Database Setup Required:"
echo "1. Go to your Supabase Dashboard → SQL Editor"
echo "2. Copy and paste the contents of PUSH_NOTIFICATION_SETUP.sql"
echo "3. Click 'Run' to execute the script"
echo ""
read -p "Press Enter when you've completed the database setup..."

# Check if the required dependencies are installed
echo "📦 Checking React Native dependencies..."

if [ -f "package.json" ]; then
    if ! grep -q "expo-notifications" package.json; then
        echo "📦 Installing expo-notifications..."
        npm install expo-notifications expo-device expo-constants
    else
        echo "✅ Required dependencies already installed"
    fi
else
    echo "⚠️  package.json not found. Please make sure you're in your React Native project directory"
    echo "📦 Please install these dependencies manually:"
    echo "npm install expo-notifications expo-device expo-constants"
fi

# Create a simple test script
cat > test-push-notification.js << 'EOF'
// Simple test script for push notifications
// Run with: node test-push-notification.js

const testPushNotification = async () => {
  const testPayload = {
    type: 'test',
    actorUserId: 'test-user-id',
    affectedUserIds: ['test-user-id'],
    title: 'Test Notification',
    body: 'This is a test notification from your deployment script!',
    data: { test: true }
  };

  try {
    const response = await fetch('https://vsupqohqsgmpvzaszmtb.supabase.co/functions/v1/send-push-notification', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdXBxb2hxc2dtcHZ6YXN6bXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjYzNjMsImV4cCI6MjA2NDYwMjM2M30.oo9u0aVp_mXugg6ZdrZuv2FDRZrRtz0Uy9IoextLOHc',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    console.log('Test notification result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Test the push notification function
testPushNotification();
EOF

echo "✅ Created test-push-notification.js"

# Summary
echo ""
echo "🎉 Push Notification System Deployment Complete!"
echo ""
echo "📋 Summary of what was deployed:"
echo "  ✅ Edge Function: send-push-notification"
echo "  ✅ Environment variables configured"
echo "  ✅ Dependencies checked/installed"
echo "  ✅ Test script created"
echo ""
echo "📝 Next Steps:"
echo "1. Complete the database setup (if not done yet)"
echo "2. Add the usePushNotifications hook to your app"
echo "3. Test with the PushNotificationExample component"
echo "4. Run test-push-notification.js to verify the Edge Function"
echo ""
echo "📚 Documentation:"
echo "  - See PUSH_NOTIFICATION_DEPLOYMENT_GUIDE.md for detailed instructions"
echo "  - Use the PushNotificationExample component for testing"
echo "  - Check Supabase Dashboard → Edge Functions for monitoring"
echo ""
echo "🐛 Troubleshooting:"
echo "  - View logs: supabase functions logs send-push-notification"
echo "  - Test endpoint: supabase functions serve"
echo "  - Check token table: expo_tokens in your Supabase dashboard"
echo ""
echo "Happy pushing! 🔔" 