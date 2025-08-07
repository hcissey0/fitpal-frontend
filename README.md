# FitPal - AI-Powered Fitness & Nutrition Planner

## Overview

FitPal is a comprehensive fitness and nutrition planning application that helps users achieve their health goals through AI-powered personalized workout routines and meal plans. The application provides detailed tracking, progress visualization, and intelligent recommendations based on user preferences and goals.

## Technologies

- **Frontend Framework**: Next.js 15 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass morphism effects
- **UI Components**: Custom component library with shadcn/ui integration
- **Charts & Visualization**: Recharts for progress tracking
- **Authentication**: JWT-based authentication with cookie storage
- **HTTP Client**: Axios with request/response interceptors
- **State Management**: React Context API and local state
- **Calendar Integration**: Google Calendar API for workout/meal scheduling

## Key Features

### 🏋️ Workout Management
- AI-generated personalized workout plans
- Exercise tracking with sets, reps, and weights
- Rest day management
- Weekly workout completion visualization
- Progress tracking with charts and statistics

### 🥗 Nutrition Planning
- Personalized meal plans with calorie and macronutrient targets
- Meal tracking and logging
- Water intake monitoring
- Nutritional progress visualization
- Dietary preference and allergy management

### 📊 Progress Tracking
- Comprehensive dashboard with key metrics
- Weekly completion rates for workouts and nutrition
- Visual progress charts using Recharts
- BMI tracking and health metrics
- Goal achievement monitoring

### 🎨 User Experience
- Modern glass morphism design
- Dark/light theme support
- Fully responsive mobile-first design
- Smooth animations and transitions
- Intuitive navigation and user flows

### ⚙️ Advanced Features
- Google Calendar integration for scheduling
- Profile customization with health data
- Multiple dietary preferences support
- Exercise and meal preferences
- Account deletion and data management

## Project Structure

```
fitpal-frontend/
├── app/                         # Next.js App Router
│   ├── actions.ts              # Server actions
│   ├── dashboard/              # Main dashboard
│   ├── login/                  # Authentication
│   ├── register/               # User registration
│   ├── profile/                # User profile management
│   ├── plans/                  # Fitness plans management
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
├── components/                 # Reusable UI components
│   ├── weekly-workout-completion.tsx
│   ├── nutrition-stats.tsx
│   ├── api-status.tsx
│   └── ui/                     # Base UI components
├── context/                    # React Context providers
│   └── auth-context.tsx        # Authentication context
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities and configurations
│   ├── api-service.ts          # API service functions
│   ├── axios.ts                # Axios configuration
│   └── constants.ts            # Application constants
├── interfaces.ts               # TypeScript interfaces
├── middleware.ts               # Authentication middleware
├── components.json             # UI components configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## Core Interfaces

The application uses well-defined TypeScript interfaces:

- **User & Profile**: User authentication and profile management
- **FitnessPlan**: Complete fitness planning with workout and nutrition days
- **WorkoutDay**: Daily workout structure with exercises and tracking
- **NutritionDay**: Daily nutrition planning with meals and targets
- **Tracking**: Workout, meal, and water intake tracking
- **Progress**: Comprehensive progress tracking and analytics

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Backend API server running (Django REST Framework)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hcissey0/fitpal-frontend.git
   cd fitpal-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Integration

The application integrates with a Django REST Framework backend through:

- **[`api`](lib/axios.ts)**: Configured Axios instance with interceptors
- **[`api-service.ts`](lib/api-service.ts)**: Comprehensive API service functions including:
  - Profile management ([`createProfile`](lib/api-service.ts), [`getProfile`](lib/api-service.ts), [`updateProfile`](lib/api-service.ts))
  - Fitness plan operations ([`getPlans`](lib/api-service.ts), [`createPlan`](lib/api-service.ts), [`deletePlan`](lib/api-service.ts))
  - Tracking functions ([`createWorkoutTracking`](lib/api-service.ts), [`createMealTracking`](lib/api-service.ts), [`createWaterTracking`](lib/api-service.ts))
  - Progress analytics ([`getProgress`](lib/api-service.ts), [`getWeeklyProgress`](lib/api-service.ts))
  - Google Calendar integration ([`addPlanToGoogleCalendar`](lib/api-service.ts))

## Authentication & Security

- JWT token-based authentication stored in cookies
- **[`AUTH_TOKEN_KEY`](lib/constants.ts)** and **[`USER_KEY`](lib/constants.ts)** constants for secure storage
- Middleware protection for authenticated routes
- Automatic token refresh and error handling
- **[`setAuthToken`](lib/axios.ts)** function for request authorization

## Key Components

### Dashboard Components
- **[`weekly-workout-completion.tsx`](components/weekly-workout-completion.tsx)**: Weekly workout progress visualization
- **[`nutrition-stats.tsx`](components/nutrition-stats.tsx)**: Nutrition tracking and statistics
- **[`api-status.tsx`](components/api-status.tsx)**: API connection status monitoring

### UI Features
- Glass morphism styling with Tailwind CSS
- Responsive design for mobile and desktop
- Interactive charts using Recharts
- Modern component architecture

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

The application is optimized for deployment on platforms like Vercel:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS