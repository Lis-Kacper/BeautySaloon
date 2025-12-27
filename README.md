# 👁️👄👁️ Beauty Salon – Appointment Booking System

## Project Description

An online booking system for a beauty salon that allows clients to book appointments via a calendar and enables the administrator to manage all visits. The project features a modern frontend, a secure backend, and a cloud-based database.

## Technologies Used

### Frontend

* **React** – building the user interface
* **React Router** – navigation between pages
* **Tailwind CSS** – modern styling
* **React Big Calendar** – booking calendar view
* **Netlify** – cloud hosting for the frontend

### Backend

* **Node.js + Express** – REST API
* **Prisma ORM** – database management
* **Nodemailer** – email notification service
* **Render.com** – cloud hosting for the backend

### Database

* **Supabase** – managed PostgreSQL in the cloud

## Administrator Panel Login

* Visit the website and click "Administrator Panel" or navigate to `/login`.
* Use the following sample credentials:
* **Login:** `admin`
* **Password:** `admin123`



## How It Works

1. The **Client** visits the website (frontend hosted on Netlify) and views the calendar with available slots.
2. After selecting a date and service, the client completes the booking form.
3. The **Frontend** sends a request to the **Backend** (hosted on Render), which verifies availability and saves the appointment to the database (Supabase).
4. Upon successful booking, the client receives a confirmation email.
5. The **Administrator** logs into the admin panel to view, edit, or cancel appointments.
6. All data is stored securely in the cloud, and communication is handled via a REST API.

## Features

* Appointment booking via calendar (available slots only)
* Automatic email notifications for bookings
* Admin panel for appointment management
* Admin authentication (JWT)
* Data validation and security measures
* Modern, responsive user interface (Mobile/Desktop)

## Deployment (Cloud-based)

* **Frontend:** Netlify
* **Backend:** Render.com
* **Database:** Supabase
