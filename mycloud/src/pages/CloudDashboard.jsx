// src/pages/CloudDashboard.jsx
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
  const [storageLimit] = useState(10 * 1024 * 1024 * 1024); // 10 GB

  /* ---------- life-cycle ---------- */
  useEffect(() => {
    loadUserData();
  }, []);

  /* ---------- storage helpers ---------- */
  const get = (key) => window.storage.get({ key }).then((r) => r.value);
  const set = (key, value) => window.storage.set({ key, value });
  const list = (prefix) => window.storage.keys({ keyPrefix: prefix }).then((r) => r.keys);
  const remove = (key) => window.storage.remove({ key });

  const loadUserData = async () => {
    try {
      const u = await get("current_user");
      if (u) {
        setUser(u);
        await loadFiles(u.id);
      }
    } catch {
      console.log("No user logged in");
    }
  };

  const loadFiles = async (userId) => {
    try {
      const data = await get(`files_${userId}`);
      if (data) {
        setFiles(data.files || []);
        setStorageUsed(data.storageUsed || 0);
      }
    } catch {
      setFiles([]);
    }
  };

  /* ---------- auth ---------- */
  const handleSignUp = async (email, password, name) => {
    const userId = "user_" + Date.now();
    const newUser = { id: userId, email, name, password };

    await set(`user_${userId}`, newUser);
    await set("current_user", newUser);
    await set(`files_${userId}`, { files: [], storageUsed: 0 });

    setUser(newUser);
    setFiles([]);
    setStorageUsed(0);
  };

  const handleLogin = async (email, password) => {
    try {
      const keys = await list("user_");
      for (const k of keys) {
        const u = await get(k);
        if (u && u.email === email && u.password === password) {
          await set("current_user", u);
          setUser(u);
          await loadFiles(u.id);
          return;
        }
      }
      alert("Invalid credentials");
    } catch {
      alert("Login failed");
    }
  };

  /* ---------- file ops ---------- */
  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setLoading(true);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      setUploadProgress(((i + 1) / uploadedFiles.length) * 100);

      const data = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = (ev) => res(ev.target.result);
        reader.readAsDataURL(file);
      });

      const newFile = {
        id: "file_" + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        data,
        uploadedAt: new Date().toISOString(),
      };

      const updated = [...files, newFile];
      const used = storageUsed + file.size;

      await set(`files_${user.id}`, { files: updated, storageUsed: used });
      setFiles(updated);
      setStorageUsed(used);
    }
    setLoading(false);
    setUploadProgress(0);
  };

  const handleFileDownload = (file) => {
    const a = document.createElement("a");
    a.href = file.data;
    a.download = file.name;
    a.click();
  };

  const handleFileDelete = async (id) => {
    const deleted = files.find((f) => f.id === id);
    if (!deleted) return;

    const updated = files.filter((f) => f.id !== id);
    const used = storageUsed - deleted.size;

    await set(`files_${user.id}`, { files: updated, storageUsed: used });
    setFiles(updated);
    setStorageUsed(used);
  };

  const handleLogout = async () => {
    await remove("current_user");
    setUser(null);
    setFiles([]);
    setStorageUsed(0);
  };

  /* ---------- render ---------- */
  if (!user)
    return (
      <AuthScreen
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onGoogleSignIn={() => {}}
      />
    );

  const filtered = files.filter((f) =>
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
              files={filtered}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
              getFileIcon={getFileIcon}
              formatBytes={formatBytes}
            />
          ) : (
            <FileListView
              files={filtered}
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