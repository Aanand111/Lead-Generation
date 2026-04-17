import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
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
import Analytics from './pages/Analytics';
import AdminNotifications from './pages/AdminNotifications';
import CommissionApproval from './pages/CommissionApproval';
import LeadApproval from './pages/LeadApproval';
import VendorLayout from './layouts/VendorLayout';
import VendorDashboard from './pages/VendorDashboard';
import VendorReferrals from './pages/VendorReferrals';
import VendorReferMember from './pages/VendorReferMember';
import VendorEarnings from './pages/VendorEarnings';
import VendorLeadUpload from './pages/VendorLeadUpload';
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
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access unauthorized area
    const redirectPath = user.role === 'vendor' ? '/vendor/dashboard' : (user.role === 'admin' ? '/dashboard' : '/user/dashboard');
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

import { ThemeProvider } from './utils/ThemeContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { Toaster } from 'react-hot-toast';
import NotificationHandler from './components/NotificationHandler';

const App = () => {
    return (
        <ThemeProvider>
            <ConfirmProvider>
                <Toaster position="top-right" reverseOrder={false} />
                <NotificationHandler />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Protected Dashboard Routes nested inside Admin Layout */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<AdminProfile />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/customers/create" element={<CustomerCreate />} />
                            <Route path="/customers/edit/:id" element={<CustomerEdit />} />
                            <Route path="/vendors" element={<Vendors />} />
                            <Route path="/vendors/create" element={<VendorCreate />} />
                            <Route path="/vendors/edit/:id" element={<VendorEdit />} />
                            <Route path="/sub-vendors" element={<SubVendors />} />
                            <Route path="/sub-vendors/create" element={<SubVendorCreate />} />
                            <Route path="/sub-vendors/edit/:id" element={<SubVendorEdit />} />
                            <Route path="/leads/categories" element={<LeadsCategory />} />
                            <Route path="/leads/approval" element={<LeadApproval />} />
                            <Route path="/leads/purchased" element={<PurchasedLeads />} />
                            <Route path="/leads/available" element={<AvailableLeads />} />
                            <Route path="/leads/create" element={<LeadCreate />} />
                            <Route path="/leads" element={<Leads />} />
                            <Route path="/leads/facebook" element={<FacebookLeads />} />
                            <Route path="/banners" element={<Banners />} />
                            <Route path="/news/category" element={<NewsCategory />} />
                            <Route path="/news" element={<News />} />
                            <Route path="/news/create" element={<NewsCreate />} />
                            <Route path="/news/edit/:id" element={<NewsEdit />} />
                            <Route path="/posters/category" element={<PosterCategory />} />
                            <Route path="/posters/category/create" element={<PosterCategoryCreate />} />
                            <Route path="/posters/category/edit/:id" element={<PosterCategoryEdit />} />
                            <Route path="/posters" element={<Posters />} />
                            <Route path="/posters/create" element={<PosterCreate />} />
                            <Route path="/posters/edit/:id" element={<PosterEdit />} />
                            <Route path="/contact" element={<ContactUs />} />
                            <Route path="/subscriptions/transaction" element={<Transactions />} />
                            <Route path="/contact-messages" element={<ContactMessages />} />
                            <Route path="/subscriptions/plan" element={<SubscriptionPlans />} />
                            <Route path="/subscriptions/plan/create" element={<SubscriptionPlanCreate />} />
                            <Route path="/subscriptions/plan/edit/:id" element={<SubscriptionPlanEdit />} />
                            <Route path="/subscriptions" element={<Subscriptions />} />
                            <Route path="/subscriptions/create" element={<SubscriptionCreate />} />
                            <Route path="/subscriptions/edit/:id" element={<SubscriptionEdit />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/settings/commissions" element={<AdminVendorCommission />} />
                            <Route path="/commissions/approval" element={<CommissionApproval />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/notifications/send" element={<AdminNotifications />} />
                        </Route>

                        {/* Vendor Dashboard Routes nested inside Vendor Layout */}
                        <Route element={<ProtectedRoute allowedRoles={['vendor']}><VendorLayout /></ProtectedRoute>}>
                            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                            <Route path="/vendor/referrals" element={<VendorReferrals />} />
                            <Route path="/vendor/refer-user" element={<VendorReferMember mode="user" />} />
                            <Route path="/vendor/refer-vendor" element={<VendorReferMember mode="vendor" />} />
                            <Route path="/vendor/earnings" element={<VendorEarnings />} />
                            <Route path="/vendor/leads/upload" element={<VendorLeadUpload mode="vendor" />} />
                        </Route>

                        {/* User Panel Routes nested inside Customer Layout */}
                        <Route element={<ProtectedRoute allowedRoles={['user', 'customer']}><CustomerLayout /></ProtectedRoute>}>
                            <Route path="/user/dashboard" element={<UserDashboard />} />
                            <Route path="/user/leads/available" element={<UserAvailableLeads />} />
                            <Route path="/user/leads/my" element={<UserMyLeads />} />
                            <Route path="/user/referrals" element={<UserReferrals />} />
                            <Route path="/user/posters" element={<UserPosters />} />
                            <Route path="/user/subscriptions" element={<UserSubscriptions />} />
                            <Route path="/user/news" element={<UserNews />} />
                            <Route path="/user/profile" element={<UserProfile />} />
                        </Route>

                        <Route path="*" element={<div style={{ padding: '20px' }}>Page coming soon...</div>} />
                    </Routes>
                </BrowserRouter>
            </ConfirmProvider>
        </ThemeProvider>
    );
};


export default App;
