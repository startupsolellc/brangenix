client/src/
├── components/      # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/           # Utility functions and API clients
├── pages/         # Page components
│   ├── admin/     # Admin panel pages
│   ├── auth.tsx   # Authentication page
│   ├── home.tsx   # Landing page
│   └── results.tsx # Name generation results
└── App.tsx        # Main application component
```

## 4️⃣ Authentication & User Management

### Authentication Flow
- Session-based authentication using Passport.js
- Password hashing using scrypt
- Session storage in PostgreSQL using connect-pg-simple

### User Roles
1. **Guest Users**
   - Limited to 5 free generations
   - Tracked using browser local storage
   - Redirected to signup when limit reached

2. **Registered Users**
   - Basic generation credits
   - Can purchase additional credits
   - Access to generation history

3. **Admin Users**
   - Full access to admin panel
   - Can manage users and system settings
   - Access to analytics and statistics

## 5️⃣ Admin Panel Functionality

### Dashboard
- User statistics overview
- Total generations counter
- Active users tracking

### User Management
- List all users
- Filter by user type
- Edit user credits and roles
- View user activity

### Activity Log
- Track system events
- Monitor user actions
- View generation statistics

### System Settings
- Configure generation limits for different user types:
  - Set maximum free generations for guest users
  - Configure generation credits for registered users
  - Adjust generation cooldown periods
- Update system parameters:
  - Guest generation limit (default: 5)
  - Free user generation limit (default: 10)
  - Premium user features
- Manage email settings

#### Managing Generation Limits
1. Navigate to Admin Panel > System Settings
2. Locate the following configuration options:
   - `guest_limit`: Maximum generations allowed for guest users
   - `free_user_limit`: Default credits for new registered users
   - `generation_cooldown`: Time between generations (in seconds)
3. Update the values as needed
4. Changes take effect immediately for new generations

## 6️⃣ Environment Variables

Required environment variables:
```
DATABASE_URL=           # PostgreSQL connection URL
OPENAI_API_KEY=        # OpenAI API key
SESSION_SECRET=        # Session encryption key
```

Optional email configuration:
```
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@example.com"
```

#### Testing SMTP Configuration
1. After setting up SMTP variables, verify the configuration:
   ```bash
   # Use the admin panel's email test feature
   1. Navigate to Admin Panel > System Settings
   2. Locate the Email Configuration section
   3. Click "Test Email Configuration"
   4. Enter a test email address
   5. Check for success message and received email
   ```
2. Common SMTP providers and their settings:
   - Gmail:
     - Host: smtp.gmail.com
     - Port: 587
     - Required: App Password for 2FA accounts
   - Amazon SES:
     - Host: email-smtp.[region].amazonaws.com
     - Port: 587
     - Required: SMTP credentials from AWS Console
   - SendGrid:
     - Host: smtp.sendgrid.net
     - Port: 587
     - Required: API Key with mail send permissions


## 7️⃣ Deployment & Running the Project

### Prerequisites
- Node.js 20 or later
- PostgreSQL database
- OpenAI API key

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd brand-name-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

### Production Deployment

For production deployment:
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start