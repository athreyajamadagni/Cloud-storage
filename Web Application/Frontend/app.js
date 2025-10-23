import React, { useState, useEffect } from 'react';
import { Upload, Download, File, Folder, Image, Video, FileText, Trash2, LogOut, User, Plus, Search, Grid, List } from 'lucide-react';

const CloudStorageApp = () => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(10 * 1024 * 1024 * 1024); // 10GB limit

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await window.storage.get('current_user');
      if (userData) {
        const u = JSON.parse(userData.value);
        setUser(u);
        await loadFiles(u.id);
      }
    } catch (error) {
      console.log('No user logged in');
    }
  };

  const loadFiles = async (userId) => {
    try {
      const result = await window.storage.get(`files_${userId}`);
      if (result) {
        const fileData = JSON.parse(result.value);
        setFiles(fileData.files);
        setStorageUsed(fileData.storageUsed || 0);
      }
    } catch (error) {
      setFiles([]);
    }
  };

  const handleSignUp = async (email, password, name) => {
    const userId = 'user_' + Date.now();
    const newUser = {
      id: userId,
      email,
      name,
      password,
      createdAt: new Date().toISOString()
    };

    await window.storage.set(`user_${userId}`, JSON.stringify(newUser));
    await window.storage.set('current_user', JSON.stringify(newUser));
    await window.storage.set(`files_${userId}`, JSON.stringify({ files: [], storageUsed: 0 }));
    setUser(newUser);
    setFiles([]);
  };

  const handleLogin = async (email, password) => {
    try {
      const keys = await window.storage.list('user_');
      if (keys && keys.keys) {
        for (const key of keys.keys) {
          try {
            const result = await window.storage.get(key);
            if (result) {
              const userData = JSON.parse(result.value);
              if (userData.email === email && userData.password === password) {
                await window.storage.set('current_user', JSON.stringify(userData));
                setUser(userData);
                await loadFiles(userData.id);
                return true;
              }
            }
          } catch (e) {
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    alert('Invalid credentials');
    return false;
  };

  const handleGoogleSignIn = () => {
    alert('Google Sign-In would be implemented using Google OAuth 2.0 API. You would need to:\n1. Create a project in Google Cloud Console\n2. Enable Google+ API\n3. Create OAuth 2.0 credentials\n4. Use Google Sign-In JavaScript library');
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setLoading(true);
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      setUploadProgress(((i + 1) / uploadedFiles.length) * 100);
      
      if (storageUsed + file.size > storageLimit) {
        alert('Storage limit exceeded!');
        break;
      }

      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = async (event) => {
          const newFile = {
            id: 'file_' + Date.now() + '_' + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            data: event.target.result,
            uploadedAt: new Date().toISOString()
          };

          const updatedFiles = [...files, newFile];
          const newStorageUsed = storageUsed + file.size;
          
          await window.storage.set(`files_${user.id}`, JSON.stringify({
            files: updatedFiles,
            storageUsed: newStorageUsed
          }));
          
          setFiles(updatedFiles);
          setStorageUsed(newStorageUsed);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    
    setLoading(false);
    setUploadProgress(0);
  };

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileDelete = async (fileId) => {
    const fileToDelete = files.find(f => f.id === fileId);
    const updatedFiles = files.filter(f => f.id !== fileId);
    const newStorageUsed = storageUsed - fileToDelete.size;
    
    await window.storage.set(`files_${user.id}`, JSON.stringify({
      files: updatedFiles,
      storageUsed: newStorageUsed
    }));
    
    setFiles(updatedFiles);
    setStorageUsed(newStorageUsed);
  };

  const handleLogout = async () => {
    await window.storage.delete('current_user');
    setUser(null);
    setFiles([]);
    setStorageUsed(0);
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (type === 'application/pdf') return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} onGoogleSignIn={handleGoogleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MyCloud Storage</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Storage Used</span>
            <span className="text-sm text-gray-600">{formatBytes(storageUsed)} / {formatBytes(storageLimit)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all"
              style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <label className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition">
                <Upload className="w-5 h-5" />
                <span>Upload Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Files Display */}
        <div className="bg-white rounded-lg shadow p-6">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No files uploaded yet</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div key={file.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex flex-col items-center">
                    <div className="text-indigo-600 mb-2">
                      {getFileIcon(file.type)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 text-center truncate w-full mb-1">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">{formatBytes(file.size)}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFileDownload(file)}
                        className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFileDelete(file.id)}
                        className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center space-x-4">
                    <div className="text-indigo-600">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFileDownload(file)}
                      className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFileDelete(file.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AuthScreen = ({ onLogin, onSignUp, onGoogleSignIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await onLogin(email, password);
    } else {
      if (!name) {
        alert('Please enter your name');
        return;
      }
      await onSignUp(email, password, name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-4 rounded-2xl">
            <Folder className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">MyCloud Storage</h2>
        <p className="text-center text-gray-600 mb-8">Secure cloud storage for all your files</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={onGoogleSignIn}
            className="mt-4 w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloudStorageApp;