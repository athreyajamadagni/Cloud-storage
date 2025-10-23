import React from "react";
import { Grid, List, Upload, Search } from "lucide-react";

const ControlsBar = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  onUpload,
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow mb-6 space-y-3 sm:space-y-0">
    <div className="flex items-center space-x-2 w-full sm:w-auto">
      <label
        htmlFor="file-upload"
        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Files
      </label>
      <input
        id="file-upload"
        type="file"
        multiple
        onChange={onUpload}
        className="hidden"
      />
    </div>

    <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full sm:w-1/3">
      <Search className="w-4 h-4 text-gray-500" />
      <input
        type="text"
        placeholder="Search files..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-transparent border-none outline-none ml-2 text-sm w-full"
      />
    </div>

    <div className="flex items-center space-x-2">
      <button
        onClick={() => setViewMode("grid")}
        className={`p-2 rounded-lg ${
          viewMode === "grid"
            ? "bg-indigo-100 text-indigo-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        title="Grid view"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={`p-2 rounded-lg ${
          viewMode === "list"
            ? "bg-indigo-100 text-indigo-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default ControlsBar;
