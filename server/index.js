// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const http = require('http');
const initializeSocket = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', // Development
      'http://192.168.163.3:5173' // Production - replace with your actual Netlify domain
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher']  // Only allow these two values
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Doubt model
const doubtSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'resolved', 'rejected'],
    default: 'pending'
  },
  replies: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Doubt = mongoose.model('Doubt', doubtSchema);

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key'; // In production, use environment variables

// Role-based middleware
const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: `Access denied. Must be a ${role}` });
  }
  next();
};

// Auth Routes
app.post(
  '/api/auth/signup',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    check('role', 'Role must be either student or teacher').isIn(['student', 'teacher'])
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role } = req.body;
      console.log('Received signup request for:', { name, email, role });

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        console.log('User already exists:', email);
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
        role
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to database
      const savedUser = await user.save();
      console.log('User saved successfully:', savedUser);

      // Create JWT token
      const token = jwt.sign(
        {
          user: {
            id: savedUser.id,
            role: savedUser.role
          }
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send response with all required data
      return res.status(201).json({
        token,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role
        }
      });

    } catch (err) {
      console.error('Server error during signup:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

app.post(
  '/api/auth/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Middleware to verify JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Protected Routes
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student Routes
app.get('/api/teachers', auth, checkRole('student'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password -__v')
      .sort({ date: -1 });
    res.json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard/student', auth, checkRole('student'), async (req, res) => {
  try {
    const studentData = {
      studentId: req.user.id,
      stats: {
        totalTeachers: await User.countDocuments({ role: 'teacher' })
      }
    };
    res.json(studentData);
  } catch (err) {
    console.error('Error fetching student dashboard:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher Routes
app.get('/api/students', auth, checkRole('teacher'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password -__v')
      .sort({ date: -1 });

    console.log('Fetched students:', students.length);
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard/teacher', auth, checkRole('teacher'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const teacherData = {
      teacherId: req.user.id,
      stats: {
        totalStudents,
        totalQuestions: 0,
        activeDoubts: 0,
        resolvedDoubts: 0,
        satisfaction: 95
      }
    };
    res.json(teacherData);
  } catch (err) {
    console.error('Error fetching teacher dashboard:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doubt Routes
app.post('/api/doubts', auth, checkRole('student'), async (req, res) => {
  try {
    const { teacherId, subject, topic, description } = req.body;

    // Validate teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }

    const doubt = new Doubt({
      student: req.user.id,
      teacher: teacherId,
      subject,
      topic,
      description
    });

    await doubt.save();
    
    // Populate student and teacher details
    const populatedDoubt = await Doubt.findById(doubt._id)
      .populate('student', 'name email')
      .populate('teacher', 'name email');

    // Emit socket event for new doubt
    io.emit('newDoubt', {
      doubt: populatedDoubt,
      teacherId: teacherId
    });

    res.status(201).json(populatedDoubt);
  } catch (err) {
    console.error('Error creating doubt:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doubts for a teacher
app.get('/api/doubts/teacher', auth, checkRole('teacher'), async (req, res) => {
  try {
    const doubts = await Doubt.find({ teacher: req.user.id })
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('replies.sender', 'name email role')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) {
    console.error('Error fetching teacher doubts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doubts for a student
app.get('/api/doubts/student', auth, checkRole('student'), async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.user.id })
      .populate('teacher', 'name email')
      .populate('student', 'name email')
      .populate('replies.sender', 'name email role')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) {
    console.error('Error fetching student doubts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doubt status
app.patch('/api/doubts/:id/status', auth, checkRole('teacher'), async (req, res) => {
  try {
    const { status } = req.body;
    const doubt = await Doubt.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.id },
      { status },
      { new: true }
    ).populate('student', 'name email');
    
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    
    // Emit socket event for status update
    io.emit(`doubt:${doubt._id}:status`, {
      status: doubt.status
    });

    res.json(doubt);
  } catch (err) {
    console.error('Error updating doubt status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to a doubt (for both teacher and student)
app.post('/api/doubts/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Reply cannot be empty' });
    }

    // Find the doubt and verify permissions
    const doubt = await Doubt.findById(req.params.id)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('replies.sender', 'name email role');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is either the teacher or the student of this doubt
    if (doubt.teacher._id.toString() !== req.user.id && doubt.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reply to this doubt' });
    }

    // If it's the first reply from teacher, update status to resolved
    if (req.user.id === doubt.teacher._id.toString() && doubt.status === 'accepted') {
      doubt.status = 'resolved';
    }

    // Get sender info
    const sender = await User.findById(req.user.id).select('name email role');

    // Add the reply
    const newReply = {
      sender: sender._id,
      message,
      createdAt: new Date()
    };

    doubt.replies.push(newReply);
    await doubt.save();

    // Populate the new reply's sender information
    const populatedDoubt = await Doubt.findById(doubt._id)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('replies.sender', 'name email role');

    // Get the newly added reply
    const latestReply = populatedDoubt.replies[populatedDoubt.replies.length - 1];

    // Emit socket event with complete sender information
    io.emit(`doubt:${doubt._id}`, {
      reply: {
        _id: latestReply._id,
        message: latestReply.message,
        createdAt: latestReply.createdAt,
        sender: {
          _id: sender._id,
          name: sender.name,
          role: sender.role
        }
      }
    });

    res.json(populatedDoubt);
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('Auth Routes:');
  console.log('  POST /api/auth/signup');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/user');
  console.log('\nTeacher Routes:');
  console.log('  GET  /api/students');
  console.log('  GET  /api/dashboard/teacher');
  console.log('\nStudent Routes:');
  console.log('  GET  /api/teachers');
  console.log('  GET  /api/dashboard/student');
  console.log('\nDoubt Routes:');
  console.log('  POST /api/doubts');
  console.log('  GET  /api/doubts/teacher');
  console.log('  GET  /api/doubts/student');
  console.log('  PATCH /api/doubts/:id/status');
  console.log('  POST /api/doubts/:id/reply');
});