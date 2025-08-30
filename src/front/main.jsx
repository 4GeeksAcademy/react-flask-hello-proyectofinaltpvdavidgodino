// src/front/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { BackendURL } from "./components/BackendURL";
import AppRoutes from "./routes.jsx";

// ✅ import correcto (mismo directorio)
import { AuthProvider } from "./AuthContext";

const Main = () => {
  // Si no hay BACKEND_URL configurada, muestra el configurador
  if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "") {
    return (
      <React.StrictMode>
        <BackendURL />
      </React.StrictMode>
    );
  }

  return (
    <React.StrictMode>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);