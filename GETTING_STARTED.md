# Getting Started with Apartment Rentals SL

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**
- **Git**

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd apartments
```

### 2. Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/apartments_db"
JWT_SECRET=your-super-secret-key-change-this
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
```

**Create PostgreSQL Database:**

```bash
psql -U postgres
CREATE DATABASE apartments_db;
\q
```

**Run Database Migrations:**

```bash
npx prisma migrate dev
npx prisma generate
```

**Start Backend Server:**

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

**Start Frontend Server:**

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Visit the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health

---

## 📦 Project Structure

```
apartments/
├── backend/              # Express.js API
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Authentication, etc.
│   │   ├── routes/      # API routes
│   │   └── server.ts    # Entry point
│   └── package.json
│
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # Pages (App Router)
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities
│   │   └── store/      # State management
│   └── package.json
│
├── database/            # SQL schemas
├── docs/               # Documentation
└── README.md
```

---

## 🔧 Development Workflow

### Backend Development

```bash
cd backend

# Run in development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio         # Open database GUI
npx prisma migrate dev    # Create migration
npx prisma generate       # Generate Prisma client
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check
```

---

## 🧪 Testing the API

### Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+23276123456",
    "role": "RENTER"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for authenticated requests.

### Get Apartments

```bash
curl http://localhost:5000/api/v1/apartments?city=Freetown
```

---

## 🔑 Environment Variables

### Backend (.env)

| Variable                | Description                  | Example                                    |
| ----------------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL`          | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`            | Secret key for JWT           | `your-secret-key`                          |
| `PORT`                  | Server port                  | `5000`                                     |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name        | `your_cloud`                               |
| `STRIPE_SECRET_KEY`     | Stripe secret key            | `sk_test_...`                              |

### Frontend (.env.local)

| Variable                             | Description            | Example                        |
| ------------------------------------ | ---------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL`                | Backend API URL        | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...`                  |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`    | Google Maps API key    | `AIza...`                      |

---

## 📚 API Documentation

Full API documentation is available at: [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md)

**Key Endpoints:**

- **Auth**: `/api/v1/auth/*`
  - POST `/register` - Register user
  - POST `/login` - Login user
  - GET `/me` - Get current user

- **Apartments**: `/api/v1/apartments/*`
  - GET `/` - List apartments
  - GET `/:id` - Get apartment details
  - POST `/` - Create apartment (landlord)
  - PUT `/:id` - Update apartment
  - DELETE `/:id` - Delete apartment

- **Bookings**: `/api/v1/bookings/*`
  - POST `/` - Create booking
  - GET `/my-bookings` - Get user bookings
  - PATCH `/:id/cancel` - Cancel booking

- **Reviews**: `/api/v1/reviews/*`
  - POST `/` - Create review
  - GET `/apartment/:id` - Get apartment reviews

- **Payments**: `/api/v1/payments/*`
  - POST `/create-intent` - Create Stripe payment

- **Admin**: `/api/v1/admin/*`
  - GET `/stats` - Dashboard statistics
  - GET `/apartments` - All apartments
  - PATCH `/apartments/:id/status` - Approve/reject

---

## 🐛 Troubleshooting

### Backend won't start

**Issue**: `Error: connect ECONNREFUSED`

**Solution**: Ensure PostgreSQL is running:

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services
```

### Database connection error

**Issue**: `Can't reach database server`

**Solution**: Check your `DATABASE_URL` in `.env`:

```bash
# Test connection
psql postgresql://user:password@localhost:5432/apartments_db
```

### Frontend API calls fail

**Issue**: `Network Error` or `CORS error`

**Solution**:

1. Ensure backend is running on port 5000
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Verify CORS is configured in backend `server.ts`

### Prisma errors

**Issue**: `@prisma/client did not initialize yet`

**Solution**: Regenerate Prisma client:

```bash
cd backend
npx prisma generate
```

---

## 📖 Next Steps

1. **Create an admin user** to approve apartments
2. **Set up Cloudinary** for image uploads
3. **Configure Stripe** for payments
4. **Set up email service** (SendGrid/Resend)
5. **Deploy to production** (see `docs/DEPLOYMENT_GUIDE.md`)

---

## 🤝 Need Help?

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Email**: support@yourdomain.com

---

**Happy Coding!** 🚀
