# Bike Spare Parts Availability and Service System

This project is a full-stack web application for bike spare parts inventory, location-based filtering, user authentication, order placement, and mechanic search using Google Maps and Google Places APIs.

## Project structure

- `server/` - Node.js + Express backend
- `src/` - React + Vite frontend
- `.env.example` - frontend environment variables
- `server/.env.example` - backend environment variables

## Features included

- User registration and login with secure password hashing
- Session-based authentication and protected dashboard route
- MySQL database for users, shops, parts, and orders
- Dynamic parts table filtered by selected location using AJAX
- Order placement with stock decrement and confirmation message
- Mechanic finder using browser geolocation and Google Places API
- Google Maps display of nearby mechanic shops

## Setup steps

### 1. Install frontend dependencies

```bash
cd /home/abhishekms/Documents/git for devops/part-hop-hero
npm install
```

### 2. Install backend dependencies

```bash
npm run backend:install
```

### 3. Create the MySQL database

Connect to your MySQL server and run:

```sql
CREATE DATABASE bike_spares CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure environment variables

Copy the example files and provide your values:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Update `server/.env` with your MySQL credentials and Google Places API key.
Update `.env` with the backend base URL and Google Maps API key.

### 5. Start the backend server

```bash
npm run backend:start
```

### 6. Start the frontend app

```bash
npm run dev
```

### 7. Open the application

Open the browser at:

```text
http://localhost:5173
```

## API key generation

1. Visit the Google Cloud Console: https://console.cloud.google.com/
2. Create or select a project.
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create an API key in the Credentials section.
5. Restrict the key to your local development origins and enabled APIs.
6. Copy the key into both `.env` and `server/.env`.

## Notes

- The backend seeds sample shops and parts data automatically when the database is empty.
- For production, use a persistent session store and stronger session secrets.
- This setup uses AJAX fetch requests with `credentials: include` to maintain login sessions across the frontend and backend.
