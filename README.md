# Modern E-Commerce Platform

A complete, production-ready MERN stack e-commerce application with modern animations, 3D effects, and a beautiful responsive design.

## Features

### Customer Features
- **Modern Homepage** with 3D hero section and animations
- **Product Catalog** with advanced filtering, search, and sorting
- **Product Details** with image gallery and 3D effects
- **Shopping Cart** with persistent storage and animations
- **Guest Checkout** - no login required to place orders
- **User Accounts** - save profile info for faster checkout
- **Order History** - track all your orders
- **Dark/Light Theme** toggle with persistence
- **Fully Responsive** - optimized for mobile, tablet, and desktop

### Admin Features
- **Dashboard** with overview statistics
- **Order Management** - view and update order status
- **Product Management** - full CRUD operations
- **Category Management**
- **User Management**
- **Real-time Analytics**

### Technical Features
- **JWT Authentication** with HTTP-only cookies
- **MongoDB Database** with Mongoose ODM
- **React Query** for data fetching and caching
- **Zustand** for global state management
- **Framer Motion** for smooth animations
- **React Three Fiber** for 3D elements
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **REST API** with Express.js

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- React Three Fiber + Drei for 3D
- React Query for data fetching
- Zustand for state management
- React Router for routing
- Axios for HTTP requests

## Project Structure

```
animated-ecommerce/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   └── Order.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── productController.js
│   │   │   ├── categoryController.js
│   │   │   └── orderController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   └── orderRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── seed.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or pnpm

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd "c:\Users\Riyan\Desktop\animated e comm"

# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### Step 2: Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB - Update this with your MongoDB URI
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Secrets - CHANGE THESE IN PRODUCTION!
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:5173

# Admin Credentials
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=Admin@123
```

### Step 3: Seed Database

```bash
# From the root directory
npm run seed
```

This will create:
- Admin user (admin@ecommerce.com / Admin@123)
- Demo user (john@example.com / password123)
- 5 categories
- 14+ products
- 1 sample order

### Step 4: Run the Application

```bash
# From the root directory - runs both server and client
npm run dev

# Or run them separately:
npm run server    # Runs backend on http://localhost:5000
npm run client    # Runs frontend on http://localhost:5173
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters, search, pagination)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/related` - Get related products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `POST /api/orders` - Create order (Guest or Logged in)
- `GET /api/orders` - Get orders (User's orders or all for Admin)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/stats/overview` - Get order statistics (Admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)

## Default Credentials

### Admin Account
- Email: `admin@ecommerce.com`
- Password: `Admin@123`

### Demo User Account
- Email: `john@example.com`
- Password: `password123`

## Important Business Rules

### No Payment Gateway
- This application does **NOT** include online payment integration
- Orders are recorded in the database with "Pending" status
- Admin can update order status through the admin panel

### Guest Checkout
- Users can place orders **without** creating an account
- Guest users provide: name, email, phone, and delivery address
- Logged-in users have their info auto-filled

### Checkout Flow
- **Not logged in**: Manual entry of all contact/address info
- **Logged in**: Auto-prefill from user profile, with option to edit

## Development

### Backend Structure
The backend follows a clean layered architecture:
- **Routes**: Define API endpoints
- **Controllers**: Handle request/response logic
- **Services**: Business logic (if needed)
- **Models**: Mongoose schemas
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions

### Frontend Structure
- **Components**: Reusable UI components
- **Pages**: Route-based page components
- **Hooks**: Custom React hooks for API calls
- **Stores**: Zustand state management
- **Lib**: Third-party library configurations
- **Types**: TypeScript type definitions

## Animations & Effects

The application includes:
- **Framer Motion**: Page transitions, card hover effects, button animations
- **React Three Fiber**: 3D hero section elements
- **CSS Animations**: Loading skeletons, fade-ins, slide effects
- **Tailwind Utilities**: Custom animation classes

## Responsive Design

Fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Features:
- Collapsible navigation on mobile
- Touch-friendly UI elements
- Optimized images
- Responsive grid layouts

## Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)
1. Set environment variables
2. Ensure `NODE_ENV=production`
3. Update `CLIENT_URL` to your frontend URL
4. Run `npm start` in server directory

### Frontend Deployment (e.g., Vercel, Netlify)
1. Build: `npm run build` in client directory
2. Deploy `dist` folder
3. Set up API proxy or update API base URL

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in `.env`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or connection string is correct
- Check firewall settings for MongoDB Atlas

### CORS Errors
- Verify `CLIENT_URL` in server `.env` matches your frontend URL
- Check CORS configuration in `server.js`

### Authentication Issues
- Clear browser cookies
- Check JWT secrets are set in `.env`
- Verify tokens haven't expired

## Future Enhancements

Potential features to add:
- Payment gateway integration (Stripe, PayPal)
- Product reviews and ratings
- Wishlist functionality
- Email notifications
- Image upload for products
- Advanced search with Elasticsearch
- Real-time order tracking
- Multi-language support
- Product variants (size, color)
- Inventory management
- Sales analytics dashboard

## License

ISC

## Contributing

This is a demo project. Feel free to fork and customize for your needs.

## Support

For issues or questions, please create an issue in the repository.

---

**Note**: This is a demonstration project. For production use:
- Change all default secrets and passwords
- Implement proper security measures
- Add comprehensive error logging
- Set up monitoring and analytics
- Implement rate limiting
- Add input sanitization
- Use HTTPS
- Implement proper backup strategies
