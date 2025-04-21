# Farmers Market Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Starting the Backend Server

First, start the backend server:

```bash
cd backend
npm install
node server.js
```

The backend server will run on [http://localhost:5001](http://localhost:5001)

### Starting the Frontend Server

In a new terminal, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin Account Setup

To set up and use the admin account:

1. Create the admin account (only needs to be done once):
```bash
curl -X POST http://localhost:5001/api/admin/setup
```

2. Login with the following credentials:
- Email: `admin@farmersmarket.com`
- Password: `admin123`
- Role: Select `ADMIN` from the dropdown

The admin account has full access to:
- View and manage all users (farmers and customers)
- View and manage all stores
- View and manage all products
- View and manage all orders

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
