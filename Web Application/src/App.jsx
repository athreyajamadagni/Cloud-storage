import React, { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import CloudDashboard from "./pages/CloudDashboard";
import AuthScreen from "./components/Auth/AuthScreen";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Optional: Load current user from window.storage
    const fetchUser = async () => {
      try {
        const data = await window.storage.get("current_user");
        if (data) setUser(JSON.parse(data.value));
      } catch {}
    };
    fetchUser();
  }, []);

  return (
    <div>
      {!user ? (
        <AuthScreen onLogin={setUser} onSignUp={setUser} onGoogleSignIn={() => alert("Google Sign-In")} />
      ) : (
        <CloudDashboard user={user} setUser={setUser} />
      )}
    </div>
  );
};

export default App;
