# Sierra Leone Apartment Rental Platform 🏠

A modern apartment rental marketplace connecting landlords with renters across Sierra Leone.

## 🎯 Project Overview

This platform enables:

- **Landlords** to list and manage their properties
- **Renters** to search and book apartments
- **International visitors** to reserve accommodation before arriving in Sierra Leone

**Target Cities**: Freetown, Bo, Kenema, Makeni

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod
- **Maps**: Google Maps API

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT + OAuth
- **File Upload**: Cloudinary
- **Email**: SendGrid / Resend

### Database

- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis (optional)

### Payments

- **International**: Stripe
- **Mobile Money**: Orange Money, Africell Money

### Infrastructure

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway / DigitalOcean
- **Database**: Railway / Supabase
- **CDN**: Cloudflare

## 📁 Project Structure

```
apartments/
├── frontend/          # Next.js application
├── backend/           # Express API server
├── database/          # Database schemas & migrations
├── docs/              # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd apartments
```

2. Install frontend dependencies

```bash
cd frontend
npm install
cp .env.example .env.local
```

3. Install backend dependencies

```bash
cd backend
npm install
cp .env.example .env
```

4. Set up database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Run development servers

Frontend:

```bash
cd frontend
npm run dev
# Visit http://localhost:3000
```

Backend:

```bash
cd backend
npm run dev
# API runs on http://localhost:5000
```

## 💰 Revenue Model

1. **Booking Commission**: 10-15% per booking
2. **Featured Listings**: $10-30/month for promoted listings
3. **Service Fee**: $5-15 per booking for renters
4. **Premium Tools**: $20/month subscription for landlords
5. **Advertising**: Local business promotions
6. **Enterprise Plans**: $50/month for property managers

## 🔐 Security Features

- HTTPS encryption (SSL)
- Password hashing (bcrypt)
- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens

## 📱 Core Features

### Phase 1 (MVP)

- [x] User authentication (renter & landlord)
- [x] Apartment listing creation
- [x] Search and filter system
- [x] Basic booking flow
- [x] Image upload

### Phase 2

- [ ] Payment integration (Stripe + Mobile Money)
- [ ] Reviews and ratings
- [ ] Admin dashboard
- [ ] Email notifications

### Phase 3

- [ ] Advanced map search
- [ ] Featured listings
- [ ] Analytics dashboard
- [ ] Calendar sync
- [ ] Multi-language support

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 📧 Contact

For questions or support, contact: [your-email@example.com]

---

**Building the leading rental marketplace in Sierra Leone** 🇸🇱
