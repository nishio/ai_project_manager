import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import HomePage from '../app/page';

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
