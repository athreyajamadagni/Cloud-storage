// server.js - Main Express Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create necessary directories
const createDirectories = async () => {
  const dirs = ['./uploads', './data'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory ${dir}:`, err);
    }
  }
};

createDirectories();

// In-memory database (replace with MongoDB/PostgreSQL in production)
let users = [];
let files = [];

// Load data from files
const loadData = async () => {
  try {
    const usersData = await fs.readFile('./data/users.json', 'utf8');
    users = JSON.parse(usersData);
  } catch (err) {
    users = [];
  }

  try {
    const filesData = await fs.readFile('./data/files.json', 'utf8');
    files = JSON.parse(filesData);
  } catch (err) {
    files = [];
  }
};

// Save data to files
const saveData = async () => {
  await fs.writeFile('./data/users.json', JSON.stringify(users, null, 2));
  await fs.writeFile('./data/files.json', JSON.stringify(files, null, 2));
};

loadData();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userDir = `./uploads/${req.userId}`;
    await fs.mkdir(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per file
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = user.userId;
    next();
  });
};

// ===== AUTH ROUTES =====

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
      storageUsed: 0,
      storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await saveData();

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    storageUsed: user.storageUsed,
    storageLimit: user.storageLimit
  });
});

// ===== FILE ROUTES =====

// Upload files
app.post('/api/files/upload', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const user = users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const uploadedFiles = [];
    let totalSize = 0;

    for (const file of req.files) {
      totalSize += file.size;

      // Check storage limit
      if (user.storageUsed + totalSize > user.storageLimit) {
        // Delete uploaded files
        for (const f of req.files) {
          await fs.unlink(f.path).catch(() => {});
        }
        return res.status(400).json({ error: 'Storage limit exceeded' });
      }

      const fileData = {
        id: uuidv4(),
        userId: req.userId,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date().toISOString()
      };

      files.push(fileData);
      uploadedFiles.push({
        id: fileData.id,
        name: fileData.originalName,
        size: fileData.size,
        type: fileData.mimetype,
        uploadedAt: fileData.uploadedAt
      });
    }

    // Update user storage
    user.storageUsed += totalSize;
    await saveData();

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      storageUsed: user.storageUsed
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all files for user
app.get('/api/files', authenticateToken, (req, res) => {
  const userFiles = files
    .filter(f => f.userId === req.userId)
    .map(f => ({
      id: f.id,
      name: f.originalName,
      size: f.size,
      type: f.mimetype,
      uploadedAt: f.uploadedAt
    }));

  res.json({ files: userFiles });
});

// Download file
app.get('/api/files/download/:fileId', authenticateToken, async (req, res) => {
  try {
    const file = files.find(f => f.id === req.params.fileId && f.userId === req.userId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete file
app.delete('/api/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const fileIndex = files.findIndex(f => f.id === req.params.fileId && f.userId === req.userId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[fileIndex];
    const user = users.find(u => u.id === req.userId);

    // Delete physical file
    await fs.unlink(file.path).catch(() => {});

    // Update user storage
    user.storageUsed -= file.size;

    // Remove from files array
    files.splice(fileIndex, 1);
    await saveData();

    res.json({ 
      message: 'File deleted successfully',
      storageUsed: user.storageUsed
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search files
app.get('/api/files/search', authenticateToken, (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const userFiles = files
    .filter(f => f.userId === req.userId && 
                 f.originalName.toLowerCase().includes(query.toLowerCase()))
    .map(f => ({
      id: f.id,
      name: f.originalName,
      size: f.size,
      type: f.mimetype,
      uploadedAt: f.uploadedAt
    }));

  res.json({ files: userFiles });
});

// ===== STORAGE INFO =====

app.get('/api/storage', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    storageUsed: user.storageUsed,
    storageLimit: user.storageLimit,
    percentage: (user.storageUsed / user.storageLimit) * 100
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});