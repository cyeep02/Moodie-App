/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Shell } from './components/layout/Shell';
import { DataService } from './services/dataService';

// Import Screens (to be created)
import { Login } from './screens/Login';
import { Register } from './screens/Register';
import { Dashboard } from './screens/Dashboard';
import { MoodCheckIn } from './screens/MoodCheckIn';
import { ActivitiesMenu } from './screens/ActivitiesMenu';
import { BreathingActivity } from './screens/activities/BreathingActivity';
import { DoodleActivity } from './screens/activities/DoodleActivity';
import { BalloonPopActivity } from './screens/activities/BalloonPopActivity';
import { PandaTalk } from './screens/activities/PandaTalk';
import { MoodCharts } from './screens/MoodCharts';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = DataService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Routes location={location}>
          {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Shell>
              <Dashboard />
            </Shell>
          </ProtectedRoute>
        } />
        
        <Route path="/check-in" element={
          <ProtectedRoute>
            <Shell>
              <MoodCheckIn />
            </Shell>
          </ProtectedRoute>
        } />

        <Route path="/activities" element={
          <ProtectedRoute>
            <Shell>
              <ActivitiesMenu />
            </Shell>
          </ProtectedRoute>
        } />

        <Route path="/activities/breathing" element={
          <ProtectedRoute>
            <Shell>
              <BreathingActivity />
            </Shell>
          </ProtectedRoute>
        } />

        <Route path="/activities/doodle" element={
          <ProtectedRoute>
            <Shell>
              <DoodleActivity />
            </Shell>
          </ProtectedRoute>
        } />

        <Route path="/activities/balloon-pop" element={
          <ProtectedRoute>
            <Shell>
              <BalloonPopActivity />
            </Shell>
          </ProtectedRoute>
        } />

        <Route path="/activities/panda" element={
          <ProtectedRoute>
            <Shell>
              <PandaTalk />
            </Shell>
          </ProtectedRoute>
        } />

        <Route path="/charts" element={
          <ProtectedRoute>
            <Shell>
              <MoodCharts />
            </Shell>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
