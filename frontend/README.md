# StreamFlix - Netflix-Style Video Streaming Frontend

A professional, fully-responsive Netflix-style video streaming platform built with Next.js 16, TypeScript, and Tailwind CSS. This frontend connects to a robust Node.js/Express backend with Prisma ORM and Stripe integration.

## Features

- **Authentication**: Secure login and signup with JWT tokens
- **Video Streaming**: HLS-based video player with custom controls
- **Video Library**: Browse videos with horizontal scrolling rows
- **Hero Banner**: Featured video on the home page
- **User History**: Track and resume watched videos
- **Watchlist**: Save videos to your personal list
- **Pricing**: Beautiful 3-tier pricing plans with Stripe Checkout
- **User Profile**: Manage account settings and subscription status
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Theme**: Netflix-inspired dark color scheme (#141414, #E50914)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see Backend Setup below)
- NEXT_PUBLIC_API_BASE_URL environment variable set

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd streamflix-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Update environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
streamflix-frontend/
├── app/
│   ├── layout.tsx              # Root layout with dark theme
│   ├── page.tsx                # Landing page
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   └── page.tsx            # Signup page
│   ├── home/
│   │   └── page.tsx            # Home page with hero & rows
│   ├── watch/
│   │   └── [id]/
│   │       └── page.tsx        # Video player page
│   ├── pricing/
│   │   └── page.tsx            # Pricing plans page
│   ├── profile/
│   │   └── page.tsx            # User profile & settings
│   ├── my-list/
│   │   └── page.tsx            # Watchlist page
│   └── globals.css             # Netflix dark theme tokens
├── components/
│   ├── navbar.tsx              # Navigation bar with menu
│   ├── hero-banner.tsx         # Featured video hero
│   ├── video-row.tsx           # Horizontal scrolling video row
│   ├── video-card.tsx          # Individual video card
│   ├── hls-player.tsx          # HLS video player
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── axios.ts                # Axios instance with interceptors
│   └── utils.ts                # Utility functions
├── proxy.ts                    # Next.js authentication middleware
└── public/                     # Static assets
```

## API Integration

### Authentication Flow

**Signup**
```bash
POST /api/auth/signup
Body: { email: string, password: string, role?: string }
Response: { token: string, user: User }
```

**Login**
```bash
POST /api/auth/signin
Body: { email: string, password: string }
Response: { token: string, user: User }
```

**Logout**
```bash
GET /api/auth/signout
Response: { message: string }
```

### Video Endpoints

**Get All Videos**
```bash
GET /api/videos
Response: { videos: Video[], count: number }
```

**Get Single Video**
```bash
GET /api/videos/{id}
Headers: Authorization: Bearer <token>
Response: { video: Video }
```

**Get Featured Video**
```bash
GET /api/videos/featured
Response: { video: Video }
```

**Search Videos**
```bash
GET /api/videos/search?query=<search_query>
Response: { videos: Video[] }
```

**Get Related Videos**
```bash
GET /api/videos/{id}/related
Response: { videos: Video[] }
```

### History & Progress

**Get Watch History**
```bash
GET /api/history
Headers: Authorization: Bearer <token>
Response: { history: Video[] }
```

**Update Progress (Heartbeat)**
```bash
POST /api/history/progress
Headers: Authorization: Bearer <token>
Body: { videoId: string, progress: number, duration: number }
Response: { success: true }
```

The frontend automatically sends heartbeat updates every 10 seconds while watching.

### Watchlist

**Toggle Watchlist**
```bash
POST /api/watchlist
Headers: Authorization: Bearer <token>
Body: { videoId: string }
Response: { message: string }
```

**Get Watchlist**
```bash
GET /api/watchlist
Headers: Authorization: Bearer <token>
Response: { videos: Video[] }
```

### Payments

**Create Checkout Session**
```bash
POST /api/payment/create-checkout-session
Headers: Authorization: Bearer <token>
Body: { planType: "monthly" | "half_yearly" | "yearly" }
Response: { url: string }
```

Plans:
- `monthly`: $9.99/month
- `half_yearly`: $49.99/6 months
- `yearly`: $89.99/year

### User Profile

**Get Current User**
```bash
GET /api/user/current
Headers: Authorization: Bearer <token>
Response: { user: User }
```

**Update Profile**
```bash
PATCH /api/user/profile
Headers: Authorization: Bearer <token>
Body: { email: string }
Response: { user: User }
```

## Backend Setup

Your backend should be running on `http://localhost:5000`. The API structure and endpoints are already defined in the Node.js/Express backend file you provided.

### Environment Variables Required

In your backend `.env`:
```env
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=<aws-region>
AWS_BUCKET_NAME=<s3-bucket-name>
NODE_ENV=development
PORT=5000
```

## Styling

The frontend uses:
- **Tailwind CSS v4** with semantic design tokens
- **Dark Theme** inspired by Netflix
- **Color Scheme**: 
  - Background: #0f0f0f
  - Primary (Accent): #e50914 (Netflix Red)
  - Secondary: #1a1a1a
  - Borders: #2d2d2d
- **Fonts**: Inter (headings & body)
- **Components**: shadcn/ui + custom components

## Key Components

### HLSPlayer
Handles video playback with HLS support (`.m3u8` files):
- Custom controls (play, pause, volume, seek, fullscreen)
- Progress tracking with heartbeat mechanism
- Auto-hiding controls when playing

### Navbar
Fixed navigation bar with:
- Logo
- Navigation links (Home, Pricing, My List)
- User menu (Profile, Logout)
- Mobile-responsive hamburger menu

### VideoRow
Horizontal scrolling video carousel with:
- Smooth scrolling animation
- Pagination arrows on hover
- Lazy loading of videos
- Responsive sizing

### VideoCard
Individual video tile with:
- Thumbnail image
- Hover effects with play button
- Video title and view count
- Smooth transitions

## Authentication Flow

1. User signs up/in → Token stored in localStorage
2. Axios interceptor automatically attaches token to all requests
3. Middleware checks if user is authenticated before protected routes
4. If token expires, user is redirected to login page
5. Token persists across page refreshes

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
npm run build
npm run start
```

### Other Platforms

1. Build the project: `npm run build`
2. Start the server: `npm run start`
3. Ensure NEXT_PUBLIC_API_BASE_URL points to your backend

## Troubleshooting

**Videos not loading?**
- Check NEXT_PUBLIC_API_BASE_URL in `.env.local`
- Ensure backend is running on correct port
- Check browser console for CORS errors

**Login not working?**
- Verify backend /api/auth/signin endpoint is working
- Check localStorage for token
- Ensure token is valid and not expired

**Video player not working?**
- Verify video URL is in HLS format (.m3u8)
- Check if video URL is accessible
- Test video playback in a direct HTML5 player

**Payment not working?**
- Ensure Stripe keys are correctly set in backend
- Check webhook endpoint configuration
- Verify plan types match backend (monthly, half_yearly, yearly)

## Technologies Used

- **Frontend Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios with interceptors
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Video Player**: HTML5 Video with HLS support
- **Authentication**: JWT tokens in localStorage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Image lazy loading
- Code splitting with Next.js
- Optimized re-renders with React hooks
- Cached API responses
- Responsive images
- CSS-in-JS with Tailwind

## Security

- Secure token storage in localStorage (consider httpOnly cookies for production)
- CORS properly configured
- Axios interceptors prevent unauthorized requests
- Protected routes with middleware
- Environment variables for sensitive data

## Future Enhancements

- Dark/Light theme toggle
- Search autocomplete
- Advanced video filters
- Social sharing
- Comments & ratings
- Recommendations algorithm
- Admin dashboard
- Video upload for admins
- HDR & Dolby Atmos support
- Offline viewing

## License

MIT

## Support

For issues or questions, please reach out to the development team.
