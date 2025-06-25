# Beauty Salon Booking System - Backend

This is the backend service for the Beauty Salon Booking System. It provides APIs for appointment management and admin authentication.

## Features

- Appointment booking system
- Available time slots calculation
- Admin authentication with JWT
- Email confirmation for appointments
- PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- SMTP email service (e.g., Gmail)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/beauty_salon"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"

   # Email
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-specific-password"

   # Server
   PORT=3001
   ```

3. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/login` - Admin login

### Appointments
- `GET /api/availability?date=YYYY-MM-DD` - Get available time slots
- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments` - Get all appointments (requires admin authentication)

## Development

- Run in development mode: `npm run dev`
- Run in production mode: `npm start`
- Generate Prisma client: `npm run prisma:generate`
- Create database migrations: `npm run prisma:migrate` 