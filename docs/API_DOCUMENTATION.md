# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+23276123456",
  "role": "renter" // or "landlord"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Apartments

#### Get All Apartments (with filtering)

```http
GET /apartments?city=Freetown&minPrice=50&maxPrice=200&bedrooms=2

Query Parameters:
- city: string
- minPrice: number
- maxPrice: number
- bedrooms: number
- bathrooms: number
- amenities: string[] (comma-separated IDs)
- sort: string (price_asc, price_desc, rating, newest)
- page: number (default: 1)
- limit: number (default: 20)

Response: 200 OK
{
  "success": true,
  "data": {
    "apartments": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### Get Single Apartment

```http
GET /apartments/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "apartment": { ... }
  }
}
```

#### Create Apartment (Landlord only)

```http
POST /apartments
Authorization: Bearer <landlord_token>
Content-Type: application/json

{
  "title": "Beautiful 2BR in Freetown",
  "description": "...",
  "pricePerNight": 75,
  "pricePerMonth": 1500,
  "city": "Freetown",
  "neighborhood": "Aberdeen",
  "address": "123 Main St",
  "latitude": 8.4657,
  "longitude": -13.2317,
  "bedrooms": 2,
  "bathrooms": 2,
  "maxGuests": 4,
  "propertyType": "apartment",
  "amenities": ["uuid1", "uuid2"]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "apartment": { ... }
  }
}
```

#### Update Apartment

```http
PUT /apartments/:id
Authorization: Bearer <landlord_token>
Content-Type: application/json

Response: 200 OK
```

#### Delete Apartment

```http
DELETE /apartments/:id
Authorization: Bearer <landlord_token>

Response: 200 OK
```

### Bookings

#### Create Booking

```http
POST /bookings
Authorization: Bearer <renter_token>
Content-Type: application/json

{
  "apartmentId": "uuid",
  "checkinDate": "2026-04-01",
  "checkoutDate": "2026-04-05",
  "guestsCount": 2,
  "specialRequests": "Early check-in if possible"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "booking": { ... }
  }
}
```

#### Get User Bookings

```http
GET /bookings/my-bookings
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "bookings": [...]
  }
}
```

#### Get Apartment Availability

```http
GET /apartments/:id/availability?month=2026-04&year=2026

Response: 200 OK
{
  "success": true,
  "data": {
    "availableDates": [...],
    "bookedDates": [...],
    "blockedDates": [...]
  }
}
```

### Reviews

#### Create Review

```http
POST /reviews
Authorization: Bearer <renter_token>
Content-Type: application/json

{
  "bookingId": "uuid",
  "apartmentId": "uuid",
  "rating": 5,
  "cleanlinessRating": 5,
  "accuracyRating": 4,
  "locationRating": 5,
  "valueRating": 4,
  "comment": "Amazing place!"
}

Response: 201 Created
```

#### Get Apartment Reviews

```http
GET /apartments/:id/reviews?page=1&limit=10

Response: 200 OK
{
  "success": true,
  "data": {
    "reviews": [...],
    "average": 4.8,
    "total": 23
  }
}
```

### Payments

#### Create Payment Intent (Stripe)

```http
POST /payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "uuid"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "clientSecret": "..."
  }
}
```

#### Initiate Mobile Money Payment

```http
POST /payments/mobile-money
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "uuid",
  "phoneNumber": "+23276123456",
  "provider": "orange_money"
}

Response: 200 OK
```

### Admin

#### Get Dashboard Stats

```http
GET /admin/stats
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "totalApartments": 567,
    "totalBookings": 890,
    "revenue": 45678.90,
    "pendingVerifications": 12
  }
}
```

#### Approve/Reject Apartment

```http
PATCH /admin/apartments/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "active" // or "rejected"
}

Response: 200 OK
```

## Error Responses

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common Status Codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
