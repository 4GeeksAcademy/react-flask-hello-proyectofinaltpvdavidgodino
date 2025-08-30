// src/front/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { StoreProvider } from "./hooks/useGlobalReducer";
import { BackendURL } from "./components/BackendURL";
import AppRoutes from "./routes.jsx";
import { AuthProvider } from "./AuthContext";   // ✅ solo AuthProvider

const Main = () => {
  if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "")
    return (
      <React.StrictMode>
        <BackendURL />
      </React.StrictMode>
    );

  return (
    <React.StrictMode>
      <AuthProvider>     {/* ✅ envuelve todo en AuthProvider */}
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);