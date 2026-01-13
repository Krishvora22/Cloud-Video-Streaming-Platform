# StreamFlix API Reference

Complete API documentation for the StreamFlix frontend-backend integration.

## Table of Contents

1. [Authentication](#authentication)
2. [Videos](#videos)
3. [History](#history)
4. [Watchlist](#watchlist)
5. [Payments](#payments)
6. [User](#user)

---

## Authentication

### Sign Up

Create a new user account and receive JWT token.

**Request:**
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "USER"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "USER",
    "plan": "free",
    "trialEndsAt": "2024-01-15T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Sign In

Authenticate and receive JWT token.

**Request:**
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User signed in successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "plan": "premium"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Sign Out

Invalidate current session.

**Request:**
```
GET /api/auth/signout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User signed out successfully"
}
```

---

## Videos

### Get All Videos

Retrieve all available videos.

**Request:**
```
GET /api/videos
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "videos": [
    {
      "id": "video-uuid",
      "title": "Sample Video",
      "description": "Video description",
      "thumbnailUrl": "https://...",
      "videoUrl": "https://.../master.m3u8",
      "views": 1500,
      "duration": 3600,
      "category": "Action",
      "status": "COMPLETED",
      "uploader": {
        "id": "uploader-uuid",
        "email": "creator@example.com"
      }
    }
  ]
}
```

### Get Video by ID

Retrieve a specific video with watch history.

**Request:**
```
GET /api/videos/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "video-uuid",
    "title": "Sample Video",
    "description": "Video description",
    "thumbnailUrl": "https://...",
    "videoUrl": "https://.../master.m3u8",
    "views": 1500,
    "duration": 3600,
    "category": "Action",
    "lastPlayedAt": 450,
    "uploader": {
      "id": "uploader-uuid",
      "email": "creator@example.com"
    }
  }
}
```

### Get Featured Video

Get a random featured video for the hero section.

**Request:**
```
GET /api/videos/featured
```

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "video-uuid",
    "title": "Featured Video",
    "thumbnailUrl": "https://...",
    "videoUrl": "https://.../master.m3u8",
    "uploader": {
      "email": "creator@example.com"
    }
  }
}
```

### Search Videos

Search for videos by title, description, or category.

**Request:**
```
GET /api/videos/search?query=action
```

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video-uuid",
      "title": "Action Movie Title",
      "thumbnailUrl": "https://...",
      "views": 5000,
      "uploader": {
        "email": "creator@example.com"
      }
    }
  ]
}
```

### Get Related Videos

Retrieve videos in the same category.

**Request:**
```
GET /api/videos/{id}/related
```

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "related-video-uuid",
      "title": "Related Video",
      "thumbnailUrl": "https://...",
      "views": 3000,
      "uploader": {
        "email": "creator@example.com"
      }
    }
  ]
}
```

---

## History

### Get Watch History

Retrieve user's watch history.

**Request:**
```
GET /api/history
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "video-uuid",
      "title": "Recently Watched Video",
      "thumbnailUrl": "https://...",
      "views": 2000,
      "duration": 5400,
      "uploader": {
        "email": "creator@example.com"
      }
    }
  ]
}
```

### Update Progress (Heartbeat)

Send progress update every 10 seconds while watching. Automatically sent by the frontend player.

**Request:**
```
POST /api/history/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "video-uuid",
  "progress": 450,
  "duration": 3600
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Watchlist

### Toggle Watchlist

Add or remove video from user's watchlist.

**Request:**
```
POST /api/watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "video-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to My List"
}
```

### Get Watchlist

Retrieve user's saved videos.

**Request:**
```
GET /api/watchlist
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video-uuid",
      "title": "Saved Video",
      "thumbnailUrl": "https://...",
      "views": 1500,
      "uploader": {
        "email": "creator@example.com"
      }
    }
  ]
}
```

---

## Payments

### Create Checkout Session

Initiate Stripe checkout for subscription.

**Request:**
```
POST /api/payment/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "planType": "monthly"
}
```

**Plan Types:**
- `monthly`: $9.99/month
- `half_yearly`: $49.99/6 months
- `yearly`: $89.99/year

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

---

## User

### Get Current User

Retrieve authenticated user's profile.

**Request:**
```
GET /api/user/current
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "plan": "premium",
    "subscriptionStatus": "active",
    "currentPeriodEnd": "2024-12-31T00:00:00Z",
    "trialEndsAt": null
  }
}
```

### Update Profile

Update user email.

**Request:**
```
PATCH /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "newemail@example.com"
  }
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error

Error Response Format:
```json
{
  "message": "Error description",
  "error": "Detailed error info"
}
```

---

## Authentication

All protected endpoints require the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token is obtained from signup or signin endpoints and should be stored in localStorage.

---

## Rate Limiting

No explicit rate limiting is implemented. For production, consider adding:
- 100 requests/minute per IP
- 1000 requests/hour per authenticated user

---

## Pagination

Most list endpoints support pagination (implement as needed):

```
GET /api/videos?page=1&limit=20
```

---

## CORS

Frontend CORS is configured to accept requests from:
- `http://localhost:3000` (development)
- Your production domain
