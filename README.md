# Agazian - Ge'ez Learning Platform

A modern, full-featured e-learning platform for mastering Ge'ez language with premium courses, AI assistance, and gamified learning experience.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![MongoDB](https://img.shields.io/badge/MongoDB-8.19-47a248)

## ✨ Features

### 🎓 Learning Features
- **Bilingual Support**: English and Amharic (አማርኛ) language support throughout the platform
- **Interactive Courses**: Structured courses with modules, video lessons, and text content
- **Rich Content**: Markdown support for course content with images and formatting
- **Quizzes**: Interactive quizzes with multiple-choice questions and instant feedback
- **Progress Tracking**: Track your learning progress, completed modules, and earned points
- **Course Enrollment**: Easy course enrollment and learning path management

### 🤖 AI Assistant
- **Global AI Chatbot**: Accessible via floating button on all pages
- **Context-Aware**: Provides reliable answers about the website, courses, and learning
- **Bilingual Support**: Responds in both English and Amharic
- **No Login Required**: Works for anonymous users

### 🎮 Gamification
- **Points System**: Earn points by completing quizzes and modules
- **Level System**: Progress through levels based on accumulated points
- **Badges**: Unlock achievements like "Ge'ez Scholar" and "Master Linguist"
- **Leaderboard**: Compete with other learners on the global leaderboard
- **Progress Dashboard**: Visualize your learning journey

### 👨‍💼 Admin Panel
- **Course Management**: Create, edit, and delete courses with bilingual titles and descriptions
- **Module Management**: Add modules with text content, video URLs, and thumbnails
- **Quiz Management**: Create quizzes with bilingual questions and options
- **Drag & Drop**: Reorder modules with intuitive drag-and-drop interface
- **Analytics Dashboard**: View comprehensive statistics including:
  - Total users, courses, modules, quizzes
  - Enrollment statistics
  - Top enrolled courses
  - Recent user registrations
- **Cloudinary Integration**: Upload and manage course thumbnails and module images

### 🔐 Authentication & Security
- **User Registration & Login**: Secure JWT-based authentication
- **Password Reset**: Forgot password functionality with email support
- **Role-Based Access**: Admin and user role management
- **Protected Routes**: Secure admin panel and user dashboard

### 🎨 Design
- **Modern UI**: Dark theme with elegant golden accents
- **Glassmorphism**: Beautiful glassmorphic card designs
- **Smooth Animations**: Fluid transitions and hover effects
- **Responsive Design**: Works seamlessly on all devices
- **Premium Aesthetic**: Professional dark/golden color scheme

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Cloudinary account (for file uploads)
- OpenAI API key (for AI Assistant)
- Resend API key (for email functionality - optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd agazian
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# Database
MONGO_URI=your_mongodb_connection_string
# or
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI (for AI Assistant)
OPENAI_API_KEY=your_openai_api_key

# Resend (for emails - optional)
RESEND_API_KEY=your_resend_api_key

# Base URL (for password reset links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Create an admin user:
```bash
npx tsx scripts/createAdmin.ts
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
agazian/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── admin/           # Admin panel
│   │   ├── api/             # API routes
│   │   │   ├── admin/       # Admin APIs
│   │   │   ├── auth/        # Authentication APIs
│   │   │   ├── courses/     # Course APIs
│   │   │   ├── modules/     # Module APIs
│   │   │   ├── progress/    # Progress tracking APIs
│   │   │   └── upload/      # File upload API
│   │   ├── courses/         # Course listing and details
│   │   ├── dashboard/       # User dashboard
│   │   ├── modules/         # Module learning pages
│   │   ├── progress/       # Progress and leaderboard
│   │   └── page.tsx         # Homepage
│   ├── components/          # React components
│   │   ├── Assistant.tsx   # AI Assistant component
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── LanguageToggle.tsx
│   ├── context/            # React Context providers
│   ├── middleware/         # Auth middleware
│   ├── models/             # MongoDB Mongoose models
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── scripts/                # Utility scripts
└── tailwind.config.js      # Tailwind configuration
```

## 🎯 Key Pages

- **Homepage** (`/`): Welcome page with features and AI assistant
- **Courses** (`/courses`): Browse and search all available courses
- **Course Details** (`/courses/[courseId]`): View course modules and enroll
- **Module Learning** (`/modules/[moduleId]`): Interactive module content with navigation
- **Quizzes** (`/modules/[moduleId]/quizzes`): Take quizzes and earn points
- **Dashboard** (`/dashboard`): User dashboard with enrolled courses
- **My Progress** (`/progress/me`): Detailed progress tracking
- **Leaderboard** (`/progress/leaderboard`): User rankings by points
- **Admin Panel** (`/admin`): Full admin interface for content management
- **Login/Register**: User authentication pages
- **Contact**: Contact form with email integration
- **404 Page**: Custom not found page

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **AI**: OpenAI API
- **Email**: Resend API
- **Markdown**: react-markdown with remark-gfm
- **Notifications**: react-hot-toast

## 🌐 Environment Variables

See `.env.local` example above. Make sure to set all required variables before running the application.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Features in Detail

### Bilingual Support
All content supports both English and Amharic:
- Course titles and descriptions
- Module titles and content
- Quiz questions and options
- UI text and navigation
- AI Assistant responses

### Admin Features
- **Dashboard Tab**: Analytics and statistics
- **Add Course Tab**: Create new courses with thumbnails
- **Manage Courses Tab**: Edit, delete, and organize courses
  - Add/Edit/Delete modules
  - Add/Edit/Delete quizzes
  - Drag-and-drop module reordering
  - Image upload to content

### Progress System
- Points awarded for completing quizzes (only once per module)
- Automatic module completion when quiz is passed
- Course completion when all modules are completed
- Level calculation based on total points
- Badge unlocking at milestone points

## 🤝 Contributing

This is a private project. For contributions, please contact the maintainer.

## 📄 License

Private - All rights reserved

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for beautiful utility classes
- MongoDB for robust database solution
- All open-source contributors

---

Built with ❤️ for Ge'ez language learners
