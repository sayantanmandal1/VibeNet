# VibeNet - Social Media Platform

A modern social media platform built with React and Node.js, featuring PostgreSQL + Redis backend with Google OAuth integration.

## ✨ Features

- 🔐 **Dual Authentication**: Email/Password + Google OAuth
- 📝 **Posts**: Create, like, comment, and delete posts with image uploads
- 👥 **Social**: Follow users, user suggestions, and search
- 💬 **Real-time Comments**: Interactive comment system
- 🖼️ **Image Upload**: Direct file uploads (no base64)
- 📱 **Responsive Design**: Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Docker & Docker Compose
- Git

### Option 1: Automated Setup (Recommended)

#### Windows:
```bash
start.bat
```

#### Mac/Linux:
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
npm run setup
```

2. **Start Services**
```bash
# Start databases
docker-compose up -d

# Start backend (new terminal)
cd server && npm start

# Start frontend (new terminal)
npm start
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🏗️ Architecture

### Frontend (React)
- **Authentication**: JWT tokens with localStorage
- **State Management**: React Context + useReducer
- **API Client**: Custom fetch wrapper
- **Routing**: React Router v6

### Backend (Node.js/Express)
- **Database**: PostgreSQL with proper relations
- **Caching**: Redis for sessions and auth
- **Authentication**: JWT + bcrypt + Firebase (Google OAuth)
- **File Upload**: Multer with local storage
- **Security**: Helmet, CORS, rate limiting

### Infrastructure
- **PostgreSQL**: User data, posts, comments, likes, follows
- **Redis**: Session management and caching
- **Docker Compose**: Database orchestration
- **File System**: Image storage (easily upgradeable to S3)

## 📊 Database Schema

```sql
users (id, uid, email, password_hash, name, bio, profile_image_url, auth_provider)
posts (id, user_id, content, image_url, created_at)
likes (id, user_id, post_id)
comments (id, user_id, post_id, content, created_at)
followers (id, follower_id, following_id)
friends (id, user_id, friend_id, status)
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

**Backend (server/.env)**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vibenet
DB_USER=vibenet_user
DB_PASSWORD=vibenet_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start frontend
npm run setup      # Install all dependencies
npm run test-setup # Test configuration
```

### Backend Scripts
```bash
cd server
npm start          # Start backend server
npm run dev        # Start with nodemon (auto-reload)
```

### Database Management
```bash
# View running containers
docker-compose ps

# Access PostgreSQL
docker exec -it vibenet_postgres psql -U vibenet_user -d vibenet

# Access Redis
docker exec -it vibenet_redis redis-cli

# View logs
docker-compose logs postgres
docker-compose logs redis
```

## 🔒 Authentication Flow

### Email/Password
1. User registers/logs in with credentials
2. Backend validates and creates JWT token
3. Token stored in localStorage
4. Token sent with each API request

### Google OAuth
1. User clicks "Sign in with Google"
2. Firebase handles OAuth flow
3. Frontend gets ID token
4. Backend verifies token with Firebase
5. Backend creates JWT token for session

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password  
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Posts
- `GET /api/posts/feed` - Get personalized feed
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments/post/:postId` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/suggestions/list` - Get user suggestions
- `GET /api/users/search/:query` - Search users

## 🚀 Production Deployment

1. **Environment**: Update all environment variables
2. **Database**: Use managed PostgreSQL (AWS RDS, etc.)
3. **Redis**: Use managed Redis (AWS ElastiCache, etc.)
4. **Storage**: Migrate to cloud storage (S3, etc.)
5. **Security**: Enable HTTPS, update CORS origins
6. **Monitoring**: Add logging and monitoring

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
docker-compose down
docker-compose up -d
```

**Backend Won't Start**
```bash
cd server
rm -rf node_modules
npm install
npm start
```

**Frontend Issues**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

**Port Already in Use**
```bash
# Kill process on port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

## 📝 Migration Notes

This application has been migrated from Firebase to a custom backend:

- ✅ **Firestore** → **PostgreSQL** (better performance, relations)
- ✅ **Firebase Storage** → **File System** (easier management)
- ✅ **Firebase Auth** → **JWT + Redis** (better control)
- ✅ **Base64 Images** → **Real File Uploads** (better performance)
- ✅ **Client-side Logic** → **Proper API** (better security)

Google OAuth still uses Firebase for the OAuth flow but tokens are managed by our backend.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Ready to start?** Run `npm run setup` and then use the startup scripts! 🎉