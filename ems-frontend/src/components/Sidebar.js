import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, 
    CreditCard, LogOut, Edit3, UserCheck, ShieldCheck, BarChart2, Users, UserPlus 
} from 'lucide-react';
import { getStudentProfile } from '../services/apiService'; // <-- NEW IMPORT
import './Sidebar.css'; 

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // --- Dynamic Profile State ---
    const [degreeProgram, setDegreeProgram] = useState('Loading program...');

    const userStr = localStorage.getItem('nexusUser');
    const userData = userStr ? JSON.parse(userStr) : { role: 'student', fullName: 'Guest User', userId: null };
    const userRole = userData.role ? userData.role.toLowerCase() : 'student';

    // --- Fetch Dynamic Degree Program for Students ---
    useEffect(() => {
        if (userRole === 'student' && userData.userId) {
            getStudentProfile(userData.userId)
                .then(res => {
                    // Assuming the backend returns the profile DTO with 'degreeProgram'
                    if (res.data && res.data.degreeProgram) {
                        setDegreeProgram(res.data.degreeProgram);
                    } else {
                        setDegreeProgram('Degree Program Not Assigned');
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch student profile for sidebar:", err);
                    setDegreeProgram('Student Profile Unavailable');
                });
        }
    }, [userRole, userData.userId]);

    const handleLogout = () => {
        localStorage.removeItem('nexusUser');
        navigate('/login');
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <div className="logo-box">N</div>
                <div className="logo-text">
                    <h2>NEXUS</h2>
                    <p>Institute of Technology</p>
                </div>
            </div>

            <div className="sidebar-profile-snippet">
                <h4>{userData.fullName}</h4>
                <p style={{textTransform: 'capitalize'}}>{userData.role} Account</p>
                
                {/* --- DYNAMICALLY RENDERED DEGREE PROGRAM --- */}
                {userRole === 'student' && <p>{degreeProgram}</p>}
                
                {userRole === 'lecturer' && <p>Faculty of Computing</p>}
                {userRole === 'admin' && <p>System Administrator</p>}
            </div>

            <nav className="sidebar-nav">
                {/* 🎓 STUDENT NAVIGATION */}
                {userRole === 'student' && (
                    <>
                        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                            <LayoutDashboard size={20} /> Dashboard
                        </Link>
                        <Link to="/enrollment" className={`nav-item ${location.pathname === '/enrollment' ? 'active' : ''}`}>
                            <BookOpen size={20} /> Course Enrollment
                        </Link>
                        <Link to="/grades" className={`nav-item ${location.pathname === '/grades' ? 'active' : ''}`}>
                            <GraduationCap size={20} /> Grades
                        </Link>
                        <Link to="/attendance" className={`nav-item ${location.pathname === '/attendance' ? 'active' : ''}`}>
                            <ClipboardCheck size={20} /> Attendance
                        </Link>
                        <Link to="/fees" className={`nav-item ${location.pathname === '/fees' ? 'active' : ''}`}>
                            <CreditCard size={20} /> Fee Payments
                        </Link>
                    </>
                )}

                {/* 👨‍🏫 LECTURER NAVIGATION */}
                {userRole === 'lecturer' && (
                    <>
                        <Link to="/faculty-grades" className={`nav-item ${location.pathname === '/faculty-grades' ? 'active' : ''}`}>
                            <Edit3 size={20} /> Faculty Grade Entry
                        </Link>
                        <Link to="/faculty-attendance" className={`nav-item ${location.pathname === '/faculty-attendance' ? 'active' : ''}`}>
                            <UserCheck size={20} /> Faculty Attendance
                        </Link>
                    </>
                )}

                {/* 🛡️ ADMIN NAVIGATION */}
                {userRole === 'admin' && (
                    <>
                        <Link to="/admin-analytics" className={`nav-item ${location.pathname === '/admin-analytics' ? 'active' : ''}`}>
                            <BarChart2 size={20} /> Admin Analytics
                        </Link>
                        <Link to="/user-management" className={`nav-item ${location.pathname === '/user-management' ? 'active' : ''}`}>
                            <Users size={20} /> User Management
                        </Link>
                        <Link to="/course-management" className={`nav-item ${location.pathname === '/course-management' ? 'active' : ''}`}>
                            <BookOpen size={20} /> Course Setup
                        </Link>
                        <Link to="/course-assignment" className={`nav-item ${location.pathname === '/course-assignment' ? 'active' : ''}`}>
                            <UserPlus size={20} /> Course Allocation
                        </Link>
                        <Link to="/audit-log" className={`nav-item ${location.pathname === '/audit-log' ? 'active' : ''}`}>
                            <ShieldCheck size={20} /> Audit Log
                        </Link>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} /> Log Out
                </button>
                <p>© 2026 Nexus Institute</p>
            </div>
        </div>
    );
};

export default Sidebar;