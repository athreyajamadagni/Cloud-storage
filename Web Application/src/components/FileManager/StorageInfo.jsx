import React from "react";

const StorageInfo = ({ used, limit }) => {
  const usedPercentage = ((used / limit) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">Storage Usage</h3>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${usedPercentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">
        {formatBytes(used)} of {formatBytes(limit)} used ({usedPercentage}%)
      </p>
    </div>
  );
};

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default StorageInfo;
