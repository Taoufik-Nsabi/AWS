import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAuth from "../components/RequireAuth";

// Pages Client
import Home from "../pages/HomePage";
import RestaurantPage from "../pages/Restaurant/RestaurantPage";
import HebergementPage from "../pages/Hebergement/HebergementsPage";
import MonumentPage from "../pages/Monument/MonumentPage"; 
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ContactPage from "../pages/ContactPage"; 
import RestaurantForm from "../pages/Restaurant/RestaurantForm";
import RestaurantUpdate from "../pages/Restaurant/RestaurantUpdate";

import HebergementForm from "../pages/Hebergement/HebergementForm";
import HebergementUpdate from "../pages/Hebergement/HebergementUpdate";

import ActivitePage from "../pages/Activite/ActivitePage"; 
import ActiviteForm from '../pages/Activite/ActiviteForm';
import ActiviteUpdate from '../pages/Activite/ActiviteUpdate';


import ProfilePage from "../pages/auth/ProfilePage"; 
import MesLieux from "../pages/Profile/MesLieux"; 
import LieuDetails from "../pages/Profile/LieuDetails"; 
import LieuUpdate from "../pages/Profile/LieuUpdate"; 
import ChatPage from "../pages/Chat/ChatPage";



// Pages Admin
import DashboardHome from "../pages/Admin/DashboardHome";
import HebergementsEnAttente from "../pages/Admin/hebergements/HebergementsEnAttente";
import HebergementsApprouves from "../pages/Admin/hebergements/HebergementsApprouves";
import HebergementsRefuses from "../pages/Admin/hebergements/HebergementsRefuses"; 
import HebergementDetails from "../pages/Admin/hebergements/HebergementDetails"; 
import HebergementEdit from "../pages/Admin/hebergements/HebergementEdit"; 
import AdminProfile from "../pages/Admin/AdminProfile"; 

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout principal */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<RestaurantPage />} />
          <Route path="/restaurants/add" element={<RestaurantForm />} />
          <Route path="/hebergements" element={<HebergementPage />} />
          <Route path="/hebergements/add" element={<HebergementForm />} />
          <Route path="/monuments" element={<MonumentPage />} />  
          <Route path="/activites" element={<ActivitePage />} />  
          <Route path="/activites/add" element={<ActiviteForm />} />   
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/mes-lieux" element={<MesLieux />} />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            }
          />
          <Route path="/LieuDetails/:id" element={<LieuDetails />} />
          <Route path="/hebergements/update/:id" element={<HebergementUpdate />} />
          <Route path="/restaurants/update/:id" element={<RestaurantUpdate />} />
          <Route path="/activites/update/:id" element={<ActiviteUpdate />} />
          


       
        </Route>

        {/* Layout Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="hebergements/pending" element={<HebergementsEnAttente />} />
          <Route path="hebergements/approved" element={<HebergementsApprouves />} />
          <Route path="hebergements/rejected" element={<HebergementsRefuses />} />
          <Route path="hebergements/view/:id" element={<HebergementDetails />} />
          <Route path="hebergements/edit/:id" element={<HebergementEdit />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
