import React from "react";
import { Download, Trash2 } from "lucide-react";

const FileListView = ({ files, onDownload, onDelete, getFileIcon, formatBytes }) => {
  if (files.length === 0)
    return <p className="text-gray-600 text-center py-8">No files uploaded yet.</p>;

  return (
    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
      <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
        <tr>
          <th className="text-left p-3">Name</th>
          <th className="text-left p-3">Size</th>
          <th className="text-left p-3">Type</th>
          <th className="text-left p-3">Uploaded</th>
          <th className="text-center p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr key={file.id} className="border-t hover:bg-gray-50">
            <td className="p-3 flex items-center space-x-3">
              {getFileIcon(file.type)}
              <span>{file.name}</span>
            </td>
            <td className="p-3">{formatBytes(file.size)}</td>
            <td className="p-3">{file.type || "Unknown"}</td>
            <td className="p-3 text-sm text-gray-500">
              {new Date(file.uploadedAt).toLocaleString()}
            </td>
            <td className="p-3 flex justify-center space-x-3">
              <button
                onClick={() => onDownload(file)}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(file.id)}
                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FileListView;
