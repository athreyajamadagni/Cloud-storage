import React from "react";
import { Folder, LogOut, User } from "lucide-react";

const Header = ({ user, onLogout }) => (
  <div className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Folder className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">JamCloud Storage</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{user.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
);

export default Header;
