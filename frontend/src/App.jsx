import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './utils/ThemeContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { Toaster } from 'react-hot-toast';
import NotificationHandler from './components/NotificationHandler';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Vendors = lazy(() => import('./pages/Vendors'));
const VendorCreate = lazy(() => import('./pages/VendorCreate'));
const VendorEdit = lazy(() => import('./pages/VendorEdit'));
const SubVendors = lazy(() => import('./pages/SubVendors'));
const SubVendorCreate = lazy(() => import('./pages/SubVendorCreate'));
const SubVendorEdit = lazy(() => import('./pages/SubVendorEdit'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerCreate = lazy(() => import('./pages/CustomerCreate'));
const CustomerEdit = lazy(() => import('./pages/CustomerEdit'));
const PurchasedLeads = lazy(() => import('./pages/PurchasedLeads'));
const LeadsCategory = lazy(() => import('./pages/LeadsCategory'));
const LeadCreate = lazy(() => import('./pages/LeadCreate'));
const Leads = lazy(() => import('./pages/Leads'));
const AvailableLeads = lazy(() => import('./pages/AvailableLeads'));
const FacebookLeads = lazy(() => import('./pages/FacebookLeads'));
const Banners = lazy(() => import('./pages/Banners'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminVendorCommission = lazy(() => import('./pages/AdminVendorCommission'));
const NewsCategory = lazy(() => import('./pages/NewsCategory'));
const News = lazy(() => import('./pages/News'));
const NewsCreate = lazy(() => import('./pages/NewsCreate'));
const NewsEdit = lazy(() => import('./pages/NewsEdit'));
const PosterCategory = lazy(() => import('./pages/PosterCategory'));
const PosterCategoryCreate = lazy(() => import('./pages/PosterCategoryCreate'));
const PosterCategoryEdit = lazy(() => import('./pages/PosterCategoryEdit'));
const Posters = lazy(() => import('./pages/Posters'));
const PosterCreate = lazy(() => import('./pages/PosterCreate'));
const PosterEdit = lazy(() => import('./pages/PosterEdit'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const ContactMessages = lazy(() => import('./pages/ContactMessages'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const SubscriptionPlanCreate = lazy(() => import('./pages/SubscriptionPlanCreate'));
const SubscriptionPlanEdit = lazy(() => import('./pages/SubscriptionPlanEdit'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const SubscriptionCreate = lazy(() => import('./pages/SubscriptionCreate'));
const SubscriptionEdit = lazy(() => import('./pages/SubscriptionEdit'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const CommissionApproval = lazy(() => import('./pages/CommissionApproval'));
const LeadApproval = lazy(() => import('./pages/LeadApproval'));
const VendorLayout = lazy(() => import('./layouts/VendorLayout'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const VendorReferrals = lazy(() => import('./pages/VendorReferrals'));
const VendorReferMember = lazy(() => import('./pages/VendorReferMember'));
const VendorEarnings = lazy(() => import('./pages/VendorEarnings'));
const VendorLeadUpload = lazy(() => import('./pages/VendorLeadUpload'));
const SubVendorLayout = lazy(() => import('./layouts/SubVendorLayout'));
const SubVendorDashboard = lazy(() => import('./pages/SubVendorDashboard'));
const SubVendorMyLeads = lazy(() => import('./pages/SubVendorMyLeads'));
const SubVendorReferrals = lazy(() => import('./pages/SubVendorReferrals'));
const SubVendorEarnings = lazy(() => import('./pages/SubVendorEarnings'));
const SubVendorSettings = lazy(() => import('./pages/SubVendorSettings'));
const VendorSettings = lazy(() => import('./pages/VendorSettings'));
const CustomerLayout = lazy(() => import('./layouts/CustomerLayout'));
const UserDashboard = lazy(() => import('./pages/customer/Dashboard'));
const UserAvailableLeads = lazy(() => import('./pages/customer/AvailableLeads'));
const UserMyLeads = lazy(() => import('./pages/customer/MyLeads'));
const UserReferrals = lazy(() => import('./pages/customer/Referrals'));
const UserPosters = lazy(() => import('./pages/customer/Posters'));
const UserSubscriptions = lazy(() => import('./pages/customer/Subscriptions'));
const UserNews = lazy(() => import('./pages/customer/News'));
const UserProfile = lazy(() => import('./pages/customer/Profile'));

const RouteLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Please Wait...</span>
        </div>
    </div>
);

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles.length > 0 && user) {
        const isSubVendor = user.role === 'vendor' && user.referred_by;
        const effectiveRole = isSubVendor ? 'sub-vendor' : user.role;

        if (!allowedRoles.includes(effectiveRole)) {
            let redirectPath = '/dashboard';
            if (effectiveRole === 'vendor') redirectPath = '/vendor/dashboard';
            else if (effectiveRole === 'sub-vendor') redirectPath = '/sub-vendor/dashboard';
            else if (effectiveRole === 'user' || effectiveRole === 'customer') redirectPath = '/user/dashboard';

            return <Navigate to={redirectPath} replace />;
        }
    }

    return children;
};

const App = () => {
    return (
        <ThemeProvider>
            <ConfirmProvider>
                <Toaster position="top-right" reverseOrder={false} />
                <NotificationHandler />
                <BrowserRouter>
                    <Suspense fallback={<RouteLoader />}>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

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

                            <Route element={<ProtectedRoute allowedRoles={['vendor']}><VendorLayout /></ProtectedRoute>}>
                                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                                <Route path="/vendor/referrals" element={<VendorReferrals />} />
                                <Route path="/vendor/refer-user" element={<VendorReferMember mode="user" />} />
                                <Route path="/vendor/refer-vendor" element={<VendorReferMember mode="vendor" />} />
                                <Route path="/vendor/earnings" element={<VendorEarnings />} />
                                <Route path="/vendor/leads/upload" element={<VendorLeadUpload mode="vendor" />} />
                                <Route path="/vendor/settings" element={<VendorSettings />} />
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['sub-vendor']}><SubVendorLayout /></ProtectedRoute>}>
                                <Route path="/sub-vendor/dashboard" element={<SubVendorDashboard />} />
                                <Route path="/sub-vendor/leads/my" element={<SubVendorMyLeads />} />
                                <Route path="/sub-vendor/referrals" element={<SubVendorReferrals />} />
                                <Route path="/sub-vendor/refer-user" element={<VendorReferMember mode="user" />} />
                                <Route path="/sub-vendor/leads/upload" element={<VendorLeadUpload mode="vendor" />} />
                                <Route path="/sub-vendor/earnings" element={<SubVendorEarnings />} />
                                <Route path="/sub-vendor/settings" element={<SubVendorSettings />} />
                            </Route>

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
                    </Suspense>
                </BrowserRouter>
            </ConfirmProvider>
        </ThemeProvider>
    );
};

export default App;
