import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Users, LogIn } from 'lucide-react'; 
import { loginUser } from '../services/apiService'; 
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    
    // 1. FIXED: Removed hardcoded admin details so the form starts empty
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');     
    const [role, setRole] = useState('');
    
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    // 2. FIXED: Added state to handle password visibility
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setErrorMessage('');
        
        // Send credentials to Spring Boot
        loginUser({ email, password })
            .then(response => {
                const data = response.data;
                const loggedInRole = data.role.toLowerCase();

                // 3. FIXED: Strict Role Validation
                // Check if the role they selected matches the role in the database
                if (role !== loggedInRole) {
                    setIsLoggingIn(false);
                    setErrorMessage(`Access Denied: This account belongs to a ${data.role}, but you selected ${role}.`);
                    return; // Stop the login process completely
                }

                setIsLoggingIn(false);

                // INTERCEPT: Check if password reset is required
                if (data.requiresPasswordChange) {
                    localStorage.setItem('nexusTempSetup', JSON.stringify({
                        userId: data.userId,
                        customUserId: data.customUserId,
                        email: email
                    }));
                    navigate('/setup-password'); 
                    return; 
                }

                // STANDARD FLOW: Save full session data
                localStorage.setItem('nexusUser', JSON.stringify({
                    userId: data.userId, 
                    customUserId: data.customUserId, 
                    fullName: data.fullName,
                    role: data.role,
                    email: email
                }));

                // Smart Redirection based on verified role
                if (loggedInRole === 'admin') {
                    navigate('/admin-analytics'); 
                } else if (loggedInRole === 'lecturer' || loggedInRole === 'faculty') {
                    navigate('/faculty-grades'); 
                } else {
                    navigate('/'); 
                }
            })
            .catch(error => {
                // If SQL Server rejects the credentials
                setIsLoggingIn(false);
                setErrorMessage(error.response?.data?.message || 'Invalid credentials or server error.');
            });
    };

    return (
        <div className="login-layout">
            {/* Left Branding Half */}
            <div className="login-branding">
                <div>
                    <div className="branding-logo-box">N</div>
                    <h1>Nexus Institute<br/>of Technology</h1>
                    <p>The premier degree-awarding institute shaping future leaders through world-class education and cutting-edge research.</p>
                </div>
                
                <div className="branding-stats">
                    <div className="stat-item"><div className="stat-dot"></div> 12,000+ Students</div>
                    <div className="stat-item"><div className="stat-dot"></div> 96% Employability</div>
                    <div className="stat-item"><div className="stat-dot"></div> AACSB Accredited</div>
                </div>
            </div>

            {/* Right Form Half */}
            <div className="login-form-container">
                <div className="login-form-wrapper">
                    <h2>Welcome to Education Management System</h2>
                    <p>Sign in to access your academic portal</p>

                    {/* Error Message Display */}
                    {errorMessage && (
                        <div style={{ backgroundColor: '#ffebee', color: '#ee5d50', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input 
                                    type="email" 
                                    className="login-input" 
                                    placeholder="your.email@nexus.edu.lk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="login-input" 
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {/* 4. FIXED: Interactive Eye Icon Toggle */}
                                <div 
                                    className="input-icon-right" 
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', height: '100%' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} color="#4318ff" />
                                    ) : (
                                        <Eye size={18} color="#a3aed0" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select Role</label>
                            <div className="input-with-icon">
                                <Users size={18} className="input-icon" />
                                <select 
                                    className="login-input" 
                                    style={{ appearance: 'none', cursor: 'pointer', color: role ? 'inherit' : '#a3aed0' }}
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Choose your role</option>
                                    <option value="student">Student</option>
                                    {/* Changed from Faculty Member to Lecturer */}
                                    <option value="lecturer">Lecturer</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember Me
                            </label>
                            <span 
                                className="forgot-password" 
                                style={{ cursor: 'pointer', color: '#4318ff', fontSize: '13px', fontWeight: '500' }}
                                onClick={() => alert("Please contact the IT Support Desk at Ext. 2450 to reset your password.")}
                            >
                                Forgot Password?
                            </span>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoggingIn}>
                            {isLoggingIn ? 'Verifying...' : <><LogIn size={18} /> Sign In</>}
                        </button>
                    </form>

                    <div className="login-footer">
                        Need help? Contact <strong>IT Support Desk</strong> — Ext. 2450
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;