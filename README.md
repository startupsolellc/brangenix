# Bilingual Brand Name Generator

A bilingual brand name generator web application that empowers entrepreneurs and businesses with AI-driven naming solutions and a flexible user credit system.

## 1️⃣ Project Overview

### Purpose
This application helps users generate unique, creative brand names using AI technology, with support for both English and Turkish languages. It features a credit-based system for registered users and limited free generations for guests.

### Tech Stack
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **API Integration**: OpenAI GPT-3.5 for name generation
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

## 2️⃣ Backend Setup

### API Routes

#### Authentication Routes
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

#### Generation Routes
- `POST /api/generate-names` - Generate brand names
- `GET /api/brand-names` - Get recent brand names

#### Admin Routes
- `GET /api/admin/statistics` - Get system statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/:id` - Update user status
- `GET /api/admin/settings` - Get system settings
- `POST /api/admin/settings` - Update system settings

### Database Structure

#### Tables
1. **users**
   - id (serial, primary key)
   - email (text, unique)
   - hashedPassword (text)
   - isAdmin (boolean)
   - generationCredits (integer)
   - createdAt (timestamp)

2. **brand_names**
   - id (serial, primary key)
   - keywords (text[])
   - category (text)
   - generatedNames (jsonb)
   - language (text)

3. **name_generations**
   - id (serial, primary key)
   - userId (integer, foreign key)
   - category (text)
   - keywords (text[])
   - count (integer)
   - language (text)
   - createdAt (timestamp)

4. **premium_subscriptions**
   - id (serial, primary key)
   - userId (integer, foreign key)
   - isActive (boolean)
   - expiresAt (timestamp)
   - createdAt (timestamp)

### PostgreSQL Connection
The application uses Neon's serverless PostgreSQL driver. Connection is configured through the `DATABASE_URL` environment variable and managed in `server/db.ts`.

## 3️⃣ Frontend Setup

### API Communication
- Uses TanStack Query for data fetching and caching
- API requests are centralized in `client/src/lib/queryClient.ts`
- Type-safe API interactions using shared types from `shared/schema.ts`

### Key Frontend Files
```
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
- Configure generation limits
- Manage system parameters
- Update email settings

## 6️⃣ Environment Variables

Required environment variables:
```
DATABASE_URL=           # PostgreSQL connection URL
OPENAI_API_KEY=        # OpenAI API key
SESSION_SECRET=        # Session encryption key
```

Optional email configuration:
```
SMTP_HOST=             # SMTP server host
SMTP_PORT=             # SMTP server port
SMTP_USER=             # SMTP username
SMTP_PASS=             # SMTP password
SMTP_FROM=             # Sender email address
```

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
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
