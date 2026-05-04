import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; 
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import "../../styles/admin/AdminLayout.css";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // 🔥 VERIFICATION ADMIN
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");

    const isAdmin =
      (role === "Admin" || role === "ADMIN" || role === "ROLE_ADMIN") &&
      email === "admin@sirmaroc.com";

    if (!isAdmin) {
      navigate("/"); // ou "/login"
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="admin-main-wrapper">
        <AdminNavbar onToggle={toggleSidebar} isOpen={isSidebarOpen} />
        
        <main className="admin-content-area">
          <Outlet />
        </main>
        
        <AdminFooter />
      </div>
    </div>
  );
}
