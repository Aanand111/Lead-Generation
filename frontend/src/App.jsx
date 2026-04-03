import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Vendors from './pages/Vendors';
import VendorCreate from './pages/VendorCreate';
import VendorEdit from './pages/VendorEdit';
import SubVendors from './pages/SubVendors';
import SubVendorCreate from './pages/SubVendorCreate';
import SubVendorEdit from './pages/SubVendorEdit';
import Customers from './pages/Customers';
import CustomerCreate from './pages/CustomerCreate';
import CustomerEdit from './pages/CustomerEdit';
import PurchasedLeads from './pages/PurchasedLeads';
import LeadsCategory from './pages/LeadsCategory';
import LeadCreate from './pages/LeadCreate';
import Leads from './pages/Leads';
import AvailableLeads from './pages/AvailableLeads';
import FacebookLeads from './pages/FacebookLeads';
import Banners from './pages/Banners';
import AdminLayout from './layouts/AdminLayout';
import AdminProfile from './pages/AdminProfile';
import Settings from './pages/Settings';
import AdminVendorCommission from './pages/AdminVendorCommission';
import NewsCategory from './pages/NewsCategory';
import News from './pages/News';
import NewsCreate from './pages/NewsCreate';
import NewsEdit from './pages/NewsEdit';
import PosterCategory from './pages/PosterCategory';
import PosterCategoryCreate from './pages/PosterCategoryCreate';
import PosterCategoryEdit from './pages/PosterCategoryEdit';
import Posters from './pages/Posters';
import PosterCreate from './pages/PosterCreate';
import PosterEdit from './pages/PosterEdit';
import ContactUs from './pages/ContactUs';
import ContactMessages from './pages/ContactMessages';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionPlanCreate from './pages/SubscriptionPlanCreate';
import SubscriptionPlanEdit from './pages/SubscriptionPlanEdit';
import Subscriptions from './pages/Subscriptions';
import SubscriptionCreate from './pages/SubscriptionCreate';
import SubscriptionEdit from './pages/SubscriptionEdit';
import Transactions from './pages/Transactions';
import AdminPayoutRequests from './pages/AdminPayoutRequests';
import Analytics from './pages/Analytics';
import CommissionApproval from './pages/CommissionApproval';
import VendorLayout from './layouts/VendorLayout';
import VendorDashboard from './pages/VendorDashboard';
import VendorReferrals from './pages/VendorReferrals';
import VendorReferMember from './pages/VendorReferMember';
import VendorEarnings from './pages/VendorEarnings';
import CustomerLayout from './layouts/CustomerLayout';
import UserDashboard from './pages/customer/Dashboard';
import UserAvailableLeads from './pages/customer/AvailableLeads';
import UserMyLeads from './pages/customer/MyLeads';
import UserReferrals from './pages/customer/Referrals';
import UserPosters from './pages/customer/Posters';
import UserSubscriptions from './pages/customer/Subscriptions';
import UserNews from './pages/customer/News';
import UserProfile from './pages/customer/Profile';

// Mock Protected Route - ensures token exists, else redirects to login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

import { ThemeProvider } from './utils/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="vendors" element={<Vendors />} />
      <Route path="customers" element={<Customers />} />
      <Route path="leads" element={<Leads />} />
      <Route path="news" element={<News />} />
      <Route path="posters" element={<Posters />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
</BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
