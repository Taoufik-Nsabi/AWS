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
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ContactPage from "../pages/ContactPage"; 
import VolsPage from "../pages/Vols/VolsPage";
import MatchsPage from "../pages/Matchs/MatchsPage";
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

import TourismPage from "../pages/Tourism/TourismPage";
import ChatPage from "../pages/Chat/ChatPage";


// Pages Admin
import DashboardHome from "../pages/Admin/DashboardHome";
import HebergementsEnAttente from "../pages/Admin/hebergements/HebergementsEnAttente";
import HebergementsApprouves from "../pages/Admin/hebergements/HebergementsApprouves";
import HebergementsRefuses from "../pages/Admin/hebergements/HebergementsRefuses"; 
import HebergementDetails from "../pages/Admin/hebergements/HebergementDetails"; 
import HebergementEdit from "../pages/Admin/hebergements/HebergementEdit"; 
import RestaurantsEnAttente from "../pages/Admin/restaurants/RestaurantsEnAttente";
import RestaurantsApprouves from "../pages/Admin/restaurants/RestaurantsApprouves";
import RestaurantsRefuses from "../pages/Admin/restaurants/RestaurantsRefuses";
import RestaurantDetails from "../pages/Admin/restaurants/RestaurantDetails";
import ActivitesEnAttente from "../pages/Admin/activites/ActivitesEnAttente";
import ActivitesApprouvees from "../pages/Admin/activites/ActivitesApprouvees";
import ActivitesRefusees from "../pages/Admin/activites/ActivitesRefusees";
import ActiviteDetails from "../pages/Admin/activites/ActiviteDetails";
import AdminMonuments from "../pages/Admin/monuments/AdminMonuments";
import AdminProfile from "../pages/Admin/AdminProfile"; 
import UsersList from "../pages/Admin/users/UsersList";
import UserAnnonces from "../pages/Admin/users/UserAnnonces";
import UserEdit from "../pages/Admin/users/UserEdit";

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
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vols" element={<VolsPage />} />
          <Route path="/matchs" element={<MatchsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            }
          />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/mes-lieux" element={<MesLieux />} />
          <Route path="/LieuDetails/:id" element={<LieuDetails />} />
          <Route path="/hebergements/update/:id" element={<HebergementUpdate />} />
          <Route path="/restaurants/update/:id" element={<RestaurantUpdate />} />
          <Route path="/activites/update/:id" element={<ActiviteUpdate />} />

          <Route path="/tourism" element={<TourismPage />} />
          


       
        </Route>

        {/* Layout Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="users/list" element={<UsersList />} />
          <Route path="users/:id/edit" element={<UserEdit />} />
          <Route path="users/:id/annonces" element={<UserAnnonces />} />
          <Route path="hebergements/pending" element={<HebergementsEnAttente />} />
          <Route path="hebergements/approved" element={<HebergementsApprouves />} />
          <Route path="hebergements/rejected" element={<HebergementsRefuses />} />
          <Route path="hebergements/view/:id" element={<HebergementDetails />} />
          <Route path="hebergements/edit/:id" element={<HebergementEdit />} />
          <Route path="restaurants/pending" element={<RestaurantsEnAttente />} />
          <Route path="restaurants/approved" element={<RestaurantsApprouves />} />
          <Route path="restaurants/rejected" element={<RestaurantsRefuses />} />
          <Route path="restaurants/view/:id" element={<RestaurantDetails />} />
          <Route path="monuments" element={<AdminMonuments />} />
          <Route path="activites/pending" element={<ActivitesEnAttente />} />
          <Route path="activites/approved" element={<ActivitesApprouvees />} />
          <Route path="activites/rejected" element={<ActivitesRefusees />} />
          <Route path="activites/view/:id" element={<ActiviteDetails />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
