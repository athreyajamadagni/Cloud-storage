import React from "react";
import { Cloud, Lock, Upload, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white text-gray-800">
    {/* Header */}
    <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white/70 backdrop-blur-md fixed w-full z-50 shadow-md">
      <div className="flex items-center space-x-2 text-indigo-600 font-bold text-2xl">
        <Cloud className="w-8 h-8 animate-bounce" />
        <span>JamCloud</span>
      </div>
      <Link
        to="/dashboard"
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Go to App
      </Link>
    </header>

    {/* Hero Section */}
    <section className="flex flex-col items-center text-center py-36 px-6 bg-gradient-to-b from-indigo-50 to-white">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
        Your <span className="text-indigo-600">Private Cloud</span> Solution
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mb-10">
        Securely store, manage, and access your files anywhere — built for
        privacy and high performance.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center space-x-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition transform hover:-translate-y-1 shadow-lg"
      >
        <span>Get Started</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </section>

    {/* Features Section */}
    <section className="py-20 bg-indigo-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6">
        <Feature
          icon={<Lock className="w-12 h-12 animate-pulse" />}
          title="Private & Secure"
          text="Your data stays yours. Fully encrypted, local-first design."
        />
        <Feature
          icon={<Upload className="w-12 h-12 animate-bounce" />}
          title="Easy Uploads"
          text="Drag & drop or batch upload your files in one click."
        />
        <Feature
          icon={<Shield className="w-12 h-12 animate-spin-slow" />}
          title="Reliable Access"
          text="Access your files anytime, anywhere — safely and instantly."
        />
      </div>
    </section>

    {/* Footer */}
    <footer className="text-center py-6 border-t border-gray-200 text-gray-500 text-sm bg-white/80 backdrop-blur-md">
      © {new Date().getFullYear()} JamCloud — Private Storage Solution
    </footer>
  </div>
);

const Feature = ({ icon, title, text }) => (
  <div className="flex flex-col items-center text-center p-8 border border-gray-200 rounded-3xl shadow-lg bg-white hover:shadow-2xl transition transform hover:-translate-y-2">
    <div className="text-indigo-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default LandingPage;
