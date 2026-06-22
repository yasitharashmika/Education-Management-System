import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, CheckCircle, ShieldAlert } from 'lucide-react';
import { changeUserPassword } from '../services/apiService'; 
import './Login.css'; // We can reuse the beautiful login CSS!

const SetupPassword = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tempUserData, setTempUserData] = useState(null);

    // Get the temporary user data from localStorage when the page loads
    useEffect(() => {
        const storedData = localStorage.getItem('nexusTempSetup');
        if (storedData) {
            setTempUserData(JSON.parse(storedData));
        } else {
            // If they somehow got here without logging in with a temp password, kick them out
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (newPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            userId: tempUserData.userId,
            newPassword: newPassword
        };

        changeUserPassword(payload)
            .then(() => {
                setSuccessMessage("Password successfully changed!");
                localStorage.removeItem('nexusTempSetup'); // Clear the temp data
                
                // Send them back to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(error => {
                setErrorMessage("Server Error: " + (error.response?.data?.message || "Failed to save password."));
                setIsSubmitting(false);
            });
    };

    return (
        <div className="login-layout">
            <div className="login-branding">
                <div>
                    <div className="branding-logo-box">N</div>
                    <h1>Account Security<br/>Setup Required</h1>
                    <p>For your protection, you must secure your account before accessing the Nexus Education Management System.</p>
                </div>
            </div>

            <div className="login-form-container">
                <div className="login-form-wrapper">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ee5d50', marginBottom: '16px' }}>
                        <ShieldAlert size={28} />
                        <h2 style={{ margin: 0, color: '#2b3674' }}>Set New Password</h2>
                    </div>
                    
                    <p style={{ marginBottom: '24px' }}>
                        Welcome! You are currently using a system-generated temporary password. Please create a permanent, secure password to continue.
                    </p>

                    {errorMessage && (
                        <div style={{ backgroundColor: '#ffebee', color: '#ee5d50', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div style={{ backgroundColor: '#e6f8f3', color: '#05cd99', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={18} /> {successMessage} Redirecting to login...
                        </div>
                    )}

                    {!successMessage && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Account Email</label>
                                <input 
                                    type="text" 
                                    className="login-input" 
                                    value={tempUserData?.email || ''}
                                    disabled
                                    style={{ backgroundColor: '#f4f7fe', color: '#a3aed0' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="input-icon" />
                                    <input 
                                        type="password" 
                                        className="login-input" 
                                        placeholder="Enter secure password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <Eye size={18} className="input-icon-right" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="input-icon" />
                                    <input 
                                        type="password" 
                                        className="login-input" 
                                        placeholder="Type password again"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-btn" disabled={isSubmitting} style={{ marginTop: '24px' }}>
                                {isSubmitting ? 'Saving...' : 'Save Password & Continue'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetupPassword;