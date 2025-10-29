import React from "react";
import { Download, Trash2, Folder } from "lucide-react";

const FileGridView = ({ files, onDownload, onDelete, getFileIcon, formatBytes }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((file) => (
        <div key={file.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
          <div className="flex flex-col items-center">
            <div className="text-indigo-600 mb-2">{getFileIcon(file.type)}</div>
            <p className="text-sm font-medium text-gray-900 text-center truncate w-full mb-1">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mb-3">{formatBytes(file.size)}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => onDownload(file)}
                className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(file.id)}
                className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileGridView;
