import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
    GraduationCap, UserCheck, Shield, User, Lock, UserPlus, 
    CheckCircle, XCircle, Search, Edit2, Trash2, Save, RefreshCw, AlertTriangle
} from 'lucide-react';
import { getAllUsers, createNewUser, updateUser, deleteUser } from '../services/apiService'; 
import './UserManagement.css';
import './Dashboard.css';

const UserManagement = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Student');
    const [department, setDepartment] = useState('Faculty of Computing');
    const [degreeProgram, setDegreeProgram] = useState('BSc (Hons) Computer Science'); // <-- NEW
    const [tempPassword, setTempPassword] = useState('');
    
    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null); 
    const [resetPassword, setResetPassword] = useState(false);
    const [directoryData, setDirectoryData] = useState([]);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Custom Delete Confirmation Modal
    const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: '' });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterFaculty, setFilterFaculty] = useState('All');

    useEffect(() => {
        if (!editingUserId) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            setTempPassword(`NEXUS-temp-${randomNum}`);
        }
    }, [role, editingUserId]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        getAllUsers()
            .then(response => setDirectoryData(response.data))
            .catch(error => console.error("Failed to load users", error));
    };

    const showPopup = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
    };

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setRole('Student');
        setDepartment('Faculty of Computing');
        setDegreeProgram('BSc (Hons) Computer Science'); // <-- NEW
        setEditingUserId(null);
        setResetPassword(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editingUserId) {
            // UPDATED: Include degree program in the update payload
            const payload = { fullName, email, role, department, degreeProgram };
            if (resetPassword) {
                payload.newPassword = tempPassword;
            }

            updateUser(editingUserId, payload)
                .then(response => {
                    const msg = resetPassword 
                        ? `Account updated and new password sent to ${email}!` 
                        : `User account updated successfully!`;
                    showPopup('success', msg);
                    fetchUsers();
                    resetForm();
                    setIsSubmitting(false);
                })
                .catch(error => {
                    showPopup('error', "Update Error: " + (error.response?.data?.message || "Failed to update user."));
                    setIsSubmitting(false);
                });
        } else {
            // UPDATED: Include degree program in the create payload
            const payload = { fullName, email, role, department, password: tempPassword, degreeProgram };
            createNewUser(payload)
                .then(response => {
                    showPopup('success', `User created with ID: ${response.data.customUserId}. Email sent!`);
                    fetchUsers();
                    resetForm();
                    setIsSubmitting(false);
                })
                .catch(error => {
                    showPopup('error', "Creation Error: " + (error.response?.data?.message || "Failed to create user."));
                    setIsSubmitting(false);
                });
        }
    };

    const handleEditClick = (user) => {
        setEditingUserId(user.userId);
        setFullName(user.fullName);
        setEmail(user.email);
        setRole(user.role);
        setResetPassword(false);
        setTempPassword('******** (Encrypted)');
        // Note: SystemUser table doesn't return degree, so it resets to default for edits. 
        // If left untouched during an edit, the Java backend safely ignores updating it.
    };

    const handleDeleteClick = (id, name) => {
        setDeleteModal({ show: true, userId: id, userName: name });
    };

    const confirmDelete = () => {
        const { userId, userName } = deleteModal;
        deleteUser(userId)
            .then(() => {
                showPopup('success', `User ${userName} has been deleted.`);
                fetchUsers();
                if (editingUserId === userId) resetForm(); 
                setDeleteModal({ show: false, userId: null, userName: '' }); 
            })
            .catch(error => {
                showPopup('error', "Delete Error: Failed to remove user.");
                setDeleteModal({ show: false, userId: null, userName: '' }); 
            });
    };

    const filteredData = directoryData.filter(user => {
        const idString = user.customUserId || '';
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              idString.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'All' || user.role === filterRole;
        let matchesFaculty = true;
        if (filterFaculty === 'Computing') matchesFaculty = idString.includes('/CS/');
        if (filterFaculty === 'Business') matchesFaculty = idString.includes('/BA/');
        if (filterFaculty === 'Engineering') matchesFaculty = idString.includes('/EG/');

        return matchesSearch && matchesRole && matchesFaculty;
    });

    const getRoleClass = (userRole) => {
        const r = userRole.toLowerCase();
        if (r === 'student') return 'role-student';
        if (r === 'lecturer') return 'role-lecturer';
        return 'role-admin';
    };

    return (
        <div className="app-layout">
            <Sidebar />
            
            {/* Top Right Toast Notification */}
            {notification.show && (
                <div className={`toast-notification toast-${notification.type}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Custom Center Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <AlertTriangle size={28} color="#ee5d50" />
                            <h2>Confirm Deletion</h2>
                        </div>
                        <p>Are you absolutely sure you want to permanently delete the account for <strong>{deleteModal.userName}</strong>? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="cancel-modal-btn" onClick={() => setDeleteModal({ show: false, userId: null, userName: '' })}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={confirmDelete}>
                                Yes, Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <main className="main-content">
                <div className="user-mgmt-header">
                    <h1>User & Account Management</h1>
                    <p>Create, update, and manage system access credentials across the institute</p>
                </div>

                <div className="user-summary-grid">
                    <div className="user-card">
                        <div className="user-icon-box" style={{background: '#4318ff'}}><GraduationCap size={24} /></div>
                        <div className="user-details">
                            <h2>{directoryData.filter(u => u.role === 'Student').length}</h2>
                            <p>Total Students</p>
                        </div>
                    </div>
                    <div className="user-card">
                        <div className="user-icon-box" style={{background: '#05cd99'}}><UserCheck size={24} /></div>
                        <div className="user-details">
                            <h2>{directoryData.filter(u => u.role === 'Lecturer').length}</h2>
                            <p>Total Lecturers</p>
                        </div>
                    </div>
                    <div className="user-card">
                        <div className="user-icon-box" style={{background: '#f6a623'}}><Shield size={24} /></div>
                        <div className="user-details">
                            <h2>{directoryData.filter(u => u.role === 'Admin').length}</h2>
                            <p>System Admins</p>
                        </div>
                    </div>
                </div>

                <div className="user-mgmt-layout">
                    <div className="directory-container">
                        <div className="directory-header-row">
                            <h3>Active Directory</h3>
                            <span className="record-count">{filteredData.length} records</span>
                        </div>
                        <p>Search by Name, Year, or ID. Filter by Faculty and Role.</p>
                        
                        <div className="directory-filters">
                            <div className="search-bar">
                                <Search size={16} color="#a3aed0" />
                                <input 
                                    type="text" 
                                    placeholder="Search IDs (e.g. 2026) or Names..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                                <option value="All">All Roles</option>
                                <option value="Student">Students</option>
                                <option value="Lecturer">Lecturers</option>
                                <option value="Admin">Admins</option>
                            </select>
                            <select className="filter-select" value={filterFaculty} onChange={(e) => setFilterFaculty(e.target.value)}>
                                <option value="All">All Faculties</option>
                                <option value="Computing">Computing (CS)</option>
                                <option value="Business">Business (BA)</option>
                                <option value="Engineering">Engineering (EG)</option>
                            </select>
                        </div>
                        
                        <table className="directory-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((user, index) => (
                                    <tr key={index}>
                                        <td className="user-id-cell">{user.customUserId || `ID-${user.userId}`}</td>
                                        <td>
                                            <div className="name-cell">
                                                <User size={14} color="#a3aed0" />
                                                {user.fullName}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-pill ${getRoleClass(user.role)}`}>{user.role}</span>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button type="button" className="icon-btn edit" onClick={() => handleEditClick(user)} title="Edit User">
                                                    <Edit2 size={16} />
                                                </button>
                                                {user.email !== 'admin@nexus.edu.lk' && (
                                                    <button type="button" className="icon-btn delete" onClick={() => handleDeleteClick(user.userId, user.fullName)} title="Delete User">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#a3aed0' }}>
                                            No users found matching your search criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="creation-form-container">
                        <h3>{editingUserId ? "Edit Account" : "Create New Account"}</h3>
                        <p>{editingUserId ? "Update existing credentials" : "Set up credentials for a new system user"}</p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Enter full name" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    placeholder="user@nexus.edu.lk" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Select Role</label>
                                <select 
                                    className="form-input"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Lecturer">Lecturer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            {/* Department / Faculty dropdown */}
                            {!editingUserId && (
                                <div className="form-group">
                                    <label>Department / Faculty</label>
                                    <select 
                                        className="form-input"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    >
                                        <option value="Faculty of Computing">Faculty of Computing</option>
                                        <option value="Faculty of Business">Faculty of Business</option>
                                        <option value="Faculty of Engineering">Faculty of Engineering</option>
                                        <option value="Administration">Administration</option>
                                    </select>
                                </div>
                            )}

                            {/* NEW: Dynamic Degree Program dropdown (Only for Students) */}
                            {role === 'Student' && (
                                <div className="form-group">
                                    <label>Degree Program {editingUserId && "(Optional for Edits)"}</label>
                                    <select 
                                        className="form-input"
                                        value={degreeProgram}
                                        onChange={(e) => setDegreeProgram(e.target.value)}
                                    >
                                        <option value="" disabled>Select a Degree</option>
                                        <option value="BSc (Hons) Computer Science">BSc (Hons) Computer Science</option>
                                        <option value="BSc (Hons) Software Engineering">BSc (Hons) Software Engineering</option>
                                        <option value="BBA (Hons) Business Management">BBA (Hons) Business Management</option>
                                        <option value="BSc (Hons) Civil Engineering">BSc (Hons) Civil Engineering</option>
                                        <option value="BSc (Hons) Electrical Engineering">BSc (Hons) Electrical Engineering</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Password {editingUserId && "(Cannot change here)"}</label>
                                <div className="password-wrapper">
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={tempPassword}
                                        disabled
                                    />
                                    <Lock size={16} className="password-icon" />
                                </div>
                                
                                {editingUserId ? (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '12px', color: '#ee5d50', cursor: 'pointer', fontWeight: '600' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={resetPassword}
                                            onChange={(e) => {
                                                setResetPassword(e.target.checked);
                                                if (e.target.checked) {
                                                    setTempPassword(`NEXUS-temp-${Math.floor(1000 + Math.random() * 9000)}`);
                                                } else {
                                                    setTempPassword('******** (Encrypted)');
                                                }
                                            }}
                                        />
                                        <RefreshCw size={14} /> Force Password Reset (Sends Email)
                                    </label>
                                ) : (
                                    <span className="password-hint">Auto-generated — user will be prompted to change on first login</span>
                                )}
                            </div>

                            <button type="submit" className="create-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : (
                                    editingUserId ? <><Save size={18} /> Update User Account</> : <><UserPlus size={18} /> Create User & Send Email</>
                                )}
                            </button>

                            {editingUserId && (
                                <button type="button" className="cancel-btn" onClick={resetForm}>
                                    Cancel Editing
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserManagement;