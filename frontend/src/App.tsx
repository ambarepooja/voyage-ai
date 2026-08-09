import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import AIChat from './pages/AIChat';
import MapExplore from './pages/MapExplore';
import Expenses from './pages/Expenses';
import Trips from './pages/Trips';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import PackingList from './pages/PackingList';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import TripsList from './pages/admin/TripsList';
import ExpensesList from './pages/admin/ExpensesList';
import ProfilesList from './pages/admin/ProfilesList';
import OTPsList from './pages/admin/OTPsList';
import NotificationsList from './pages/admin/NotificationsList';
import SavedPlacesList from './pages/admin/SavedPlacesList';
import HotelBookingsList from './pages/admin/HotelBookingsList';
import FlightsList from './pages/admin/FlightsList';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="chat" element={<AIChat />} />
        <Route path="trips" element={<Trips />} />
        <Route path="flights" element={<Flights />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="packing" element={<PackingList />} />
        <Route path="map" element={<MapExplore />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      <Route 
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="trips" element={<TripsList />} />
        <Route path="flights" element={<FlightsList />} />
        <Route path="hotels" element={<HotelBookingsList />} />
        <Route path="expenses" element={<ExpensesList />} />
        <Route path="profiles" element={<ProfilesList />} />
        <Route path="otps" element={<OTPsList />} />
        <Route path="notifications" element={<NotificationsList />} />
        <Route path="saved-places" element={<SavedPlacesList />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
