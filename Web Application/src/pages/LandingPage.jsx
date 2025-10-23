import React from "react";
import { Cloud, Lock, Upload, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white text-gray-800">
    <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
      <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
        <Cloud className="w-7 h-7" />
        <span>MyCloud</span>
      </div>
      <Link
        to="/dashboard"
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Go to App
      </Link>
    </header>

    <section className="flex flex-col items-center text-center py-20 px-6">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Your <span className="text-indigo-600">Private Cloud</span> Solution
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Securely store, manage, and access your files anywhere — built for
        privacy and performance.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        <span>Get Started</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </section>

    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        <Feature
          icon={<Lock />}
          title="Private & Secure"
          text="Your data stays yours. Fully encrypted, local-first design."
        />
        <Feature
          icon={<Upload />}
          title="Easy Uploads"
          text="Drag & drop or batch upload your files in one click."
        />
        <Feature
          icon={<Shield />}
          title="Reliable Access"
          text="Access your files anytime, anywhere — safely and instantly."
        />
      </div>
    </section>

    <footer className="text-center py-6 border-t border-gray-200 text-gray-500 text-sm">
      © {new Date().getFullYear()} MyCloud — Private Storage Solution
    </footer>
  </div>
);

const Feature = ({ icon, title, text }) => (
  <div className="flex flex-col items-center text-center p-6 border rounded-2xl shadow-sm hover:shadow-md transition">
    <div className="text-indigo-600 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default LandingPage;
