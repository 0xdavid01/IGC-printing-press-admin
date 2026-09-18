import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileTopbar from "./components/MobileTopbar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Jobs from "./pages/Jobs";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-content">
        <MobileTopbar onOpen={() => setMenuOpen(true)} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}