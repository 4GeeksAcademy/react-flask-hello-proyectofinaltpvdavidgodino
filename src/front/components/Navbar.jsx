// src/front/components/Navbar.jsx  (o donde tengas la cabecera)
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { role } = useAuth();
  return (
    <nav style={{ padding: 12 }}>
      <Link to="/mesas">Mesas</Link>{" "}
      <Link to="/tickets">Tickets</Link>{" "}
      {role === "ADMIN" && <Link to="/admin/catalog">Catálogo</Link>}
    </nav>
  );
}