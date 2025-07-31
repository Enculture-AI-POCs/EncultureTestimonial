# Testimonial Survey Application

A modern web application for collecting testimonials with photo uploads and MongoDB storage.

## Features

- ✨ Beautiful, responsive UI with modern design
- 📝 5 comprehensive survey questions
- 📸 Photo upload with drag & drop functionality
- 💾 MongoDB database storage
- 🔄 Real-time form validation
- 📱 Mobile-friendly design
- ⚡ Fast and efficient file handling

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Axios** - HTTP client
- **React Dropzone** - File upload component
- **Lucide React** - Icon library
- **CSS3** - Styling with animations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd testimonial-survey-app
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/testimonial-survey
   PORT=5000
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   npm run client
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## API Endpoints

### POST `/api/survey`
Submit a new survey response with photo upload.

**Request Body (multipart/form-data):**
- `name` (string, required) - Full name
- `email` (string, required) - Email address
- `question1` (string, required) - What's your title + the amazing place you call work?
- `question2` (string, required) - What kind of awesome did we create together? (JSON array)
- `question3` (string, required) - What was it like working with the NamanHR crew?
- `question4` (string, required) - Cool if we put your name, title, and this quote on our website?
- `photo` (file, required) - Photo upload (max 5MB)

**Response:**
```json
{
  "message": "Survey submitted successfully!",
  "survey": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "question1": "...",
    "question2": "...",
    "question3": "...",
    "question4": "...",
    "question5": "...",
    "photoUrl": "/uploads/photo-123456789.jpg",
    "submittedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/surveys`
Retrieve all survey responses.

**Response:**
```json
[
  {
    "_id": "...",
    "name": "...",
    "email": "...",
    "question1": "...",
    "question2": "...",
    "question3": "...",
    "question4": "...",
    "question5": "...",
    "photoUrl": "/uploads/photo-123456789.jpg",
    "submittedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

## Database Schema

```javascript
const surveySchema = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  question1: { type: String, required: true },
  question2: { type: String, required: true },
  question3: { type: [String], required: true },
  question4: { type: String, required: true },
  question5: { type: String, required: true },
  photoUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
}
```

## File Structure

```
testimonial-survey-app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── uploads/               # Photo uploads directory
├── server.js              # Express server
├── package.json           # Backend dependencies
├── .env                   # Environment variables
└── README.md
```

## Features in Detail

### Survey Questions
1. **Name** - Let's start with the basics — what's your name?
2. **Title & Workplace** - What's your title + the amazing place you call work?
3. **Services Used** - What kind of awesome did we create together? (Multi-select)
   - Leadership Development
   - Talent Assessment
   - Assessment and Development Centre
   - Strength Based Development
   - Competency Mapping
   - Executive Coaching
   - Learning Design & Delivery
   - Performance Management System (PMS)
   - OD & Culture Change
   - Climate Survey
   - Other
4. **Experience** - What was it like working with the NamanHR crew?
5. **Permission** - Cool if we put your name, title, and this quote on our website?
   - Yes, go for it!
   - I'd rather not — keeping it between us
   - Sure, but show me before you post

### Photo Upload
- Drag & drop functionality
- Click to select files
- Image preview
- File type validation (JPG, PNG, GIF)
- File size limit (5MB)
- Automatic file naming with timestamps

### UI/UX Features
- Responsive design for all devices
- Real-time form validation
- Loading states and feedback
- Success/error messages
- Smooth animations and transitions
- Modern gradient backgrounds
- Accessible form elements

## Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables:
   - `MONGODB_URI`
   - `PORT`
3. Deploy using Heroku CLI or GitHub integration

### Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 