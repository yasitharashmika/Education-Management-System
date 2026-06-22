import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    // 1. Check if the user is logged in
    const userStr = localStorage.getItem('nexusUser');
    
    // If no user data is found, kick them back to the login page
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userStr);
    const userRole = user.role.toLowerCase();

    // 2. Check if their role is in the allowed list for this specific page
    if (!allowedRoles.includes(userRole)) {
        // If they try to access a page they shouldn't (e.g., Student trying to reach Admin Analytics)
        // Kick them back to their dashboard
        return <Navigate to="/" replace />;
    }

    // 3. If they pass both checks, render the page!
    return children;
};

export default ProtectedRoute;