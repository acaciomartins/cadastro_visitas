import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Potencias from './pages/Potencias';
import Ritos from './pages/Ritos';
import Graus from './pages/Graus';
import Lojas from './pages/Lojas';
import Visitas from './pages/Visitas';
import Sessoes from './pages/Sessoes';
import ChangePassword from './pages/ChangePassword';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoadingProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/potencias"
              element={
                <PrivateRoute>
                  <Layout>
                    <Potencias />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ritos"
              element={
                <PrivateRoute>
                  <Layout>
                    <Ritos />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/graus"
              element={
                <PrivateRoute>
                  <Layout>
                    <Graus />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/lojas"
              element={
                <PrivateRoute>
                  <Layout>
                    <Lojas />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/visitas"
              element={
                <PrivateRoute>
                  <Layout>
                    <Visitas />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/sessoes"
              element={
                <PrivateRoute>
                  <Layout>
                    <Sessoes />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes; 