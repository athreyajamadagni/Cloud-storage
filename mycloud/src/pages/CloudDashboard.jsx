import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AuthScreen from "../components/Auth/AuthScreen";
import StorageInfo from "../components/FileManager/StorageInfo";
import ControlsBar from "../components/FileManager/ControlsBar";
import FileGridView from "../components/FileManager/FileGridView";
import FileListView from "../components/FileManager/FileListView";
import { getFileIcon, formatBytes } from "../components/FileManager/FileUtils";

const CloudDashboard = () => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(10 * 1024 * 1024 * 1024); // 10GB

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await window.storage.get("current_user");
      if (userData) {
        const u = JSON.parse(userData.value);
        setUser(u);
        await loadFiles(u.id);
      }
    } catch {
      console.log("No user logged in");
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
    } catch {
      setFiles([]);
    }
  };

  const handleSignUp = async (email, password, name) => {
    const userId = "user_" + Date.now();
    const newUser = { id: userId, email, name, password };
    await window.storage.set(`user_${userId}`, JSON.stringify(newUser));
    await window.storage.set("current_user", JSON.stringify(newUser));
    await window.storage.set(
      `files_${userId}`,
      JSON.stringify({ files: [], storageUsed: 0 })
    );
    setUser(newUser);
    setFiles([]);
  };

  const handleLogin = async (email, password) => {
    try {
      const keys = await window.storage.list("user_");
      if (keys && keys.keys) {
        for (const key of keys.keys) {
          const result = await window.storage.get(key);
          if (result) {
            const userData = JSON.parse(result.value);
            if (userData.email === email && userData.password === password) {
              await window.storage.set("current_user", JSON.stringify(userData));
              setUser(userData);
              await loadFiles(userData.id);
              return;
            }
          }
        }
      }
    } catch {
      alert("Invalid credentials");
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setLoading(true);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      setUploadProgress(((i + 1) / uploadedFiles.length) * 100);

      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = async (event) => {
          const newFile = {
            id: "file_" + Date.now(),
            name: file.name,
            size: file.size,
            type: file.type,
            data: event.target.result,
            uploadedAt: new Date().toISOString(),
          };

          const updatedFiles = [...files, newFile];
          const newStorageUsed = storageUsed + file.size;
          await window.storage.set(
            `files_${user.id}`,
            JSON.stringify({ files: updatedFiles, storageUsed: newStorageUsed })
          );
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
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const handleFileDelete = async (id) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    const deleted = files.find((f) => f.id === id);
    const newStorageUsed = storageUsed - (deleted?.size || 0);
    await window.storage.set(
      `files_${user.id}`,
      JSON.stringify({ files: updatedFiles, storageUsed: newStorageUsed })
    );
    setFiles(updatedFiles);
    setStorageUsed(newStorageUsed);
  };

  const handleLogout = async () => {
    await window.storage.delete("current_user");
    setUser(null);
    setFiles([]);
  };

  if (!user)
    return (
      <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} onGoogleSignIn={() => {}} />
    );

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header user={user} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <StorageInfo used={storageUsed} limit={storageLimit} />
        <ControlsBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onUpload={handleFileUpload}
        />

        {loading && (
          <div className="bg-white p-4 rounded-lg mb-6">
            <p>Uploading: {Math.round(uploadProgress)}%</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-green-600 h-2 rounded"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          {viewMode === "grid" ? (
            <FileGridView
              files={filteredFiles}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
              getFileIcon={getFileIcon}
              formatBytes={formatBytes}
            />
          ) : (
            <FileListView
              files={filteredFiles}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
              getFileIcon={getFileIcon}
              formatBytes={formatBytes}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudDashboard;
