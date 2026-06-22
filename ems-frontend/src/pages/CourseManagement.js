import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
    BookOpen, Layers, Award, FileText, PlusCircle, CheckCircle, 
    XCircle, Search, Edit2, Trash2, Save, AlertTriangle, Calendar, Users
} from 'lucide-react';
import { 
    getAllCourses, createCourse, updateCourse, deleteCourse, 
    getEnrolledStudents, removeStudentFromCourse, removeAllStudentsFromCourse 
} from '../services/apiService'; 
import './UserManagement.css'; 
import './Dashboard.css';

const CourseManagement = () => {
    // Form State
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [credits, setCredits] = useState(3);
    const [academicYear, setAcademicYear] = useState('Year 1');
    const [semester, setSemester] = useState('Semester 1');
    const [department, setDepartment] = useState('Faculty of Computing');
    
    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null); 
    const [courseData, setCourseData] = useState([]);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, courseId: null, courseName: '', courseCode: '' });

    // Student Roster State
    const [viewStudentsModal, setViewStudentsModal] = useState({ show: false, course: null });
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [confirmingStudentId, setConfirmingStudentId] = useState(null); 
    const [confirmingClearAll, setConfirmingClearAll] = useState(false); // NEW STATE

    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [filterYear, setFilterYear] = useState('All');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = () => {
        getAllCourses()
            .then(response => setCourseData(response.data))
            .catch(error => console.error("Failed to load courses", error));
    };

    const showPopup = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
    };

    const resetForm = () => {
        setCourseCode('');
        setCourseName('');
        setCredits(3);
        setAcademicYear('Year 1');
        setSemester('Semester 1');
        setDepartment('Faculty of Computing');
        setEditingCourseId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = { courseCode, courseName, credits, academicYear, semester, department };

        if (editingCourseId) {
            updateCourse(editingCourseId, payload)
                .then(() => {
                    showPopup('success', `Module ${courseCode} updated successfully!`);
                    fetchCourses();
                    resetForm();
                    setIsSubmitting(false);
                })
                .catch(error => {
                    showPopup('error', "Update Error: " + (error.response?.data?.message || "Failed to update course."));
                    setIsSubmitting(false);
                });
        } else {
            createCourse(payload)
                .then(() => {
                    showPopup('success', `Module ${courseCode} added to the academic structure!`);
                    fetchCourses();
                    resetForm();
                    setIsSubmitting(false);
                })
                .catch(error => {
                    showPopup('error', "Creation Error: " + (error.response?.data?.message || "Failed to create course."));
                    setIsSubmitting(false);
                });
        }
    };

    const handleEditClick = (course) => {
        setEditingCourseId(course.courseId);
        setCourseCode(course.courseCode);
        setCourseName(course.courseName);
        setCredits(course.credits);
        setAcademicYear(course.academicYear || 'Year 1');
        setSemester(course.semester);
        setDepartment(course.department);
    };

    const handleDeleteClick = (id, code, name) => {
        setDeleteModal({ show: true, courseId: id, courseCode: code, courseName: name });
    };

    const confirmDelete = () => {
        const { courseId, courseCode } = deleteModal;
        deleteCourse(courseId)
            .then(() => {
                showPopup('success', `Module ${courseCode} has been removed.`);
                fetchCourses();
                if (editingCourseId === courseId) resetForm(); 
                setDeleteModal({ show: false, courseId: null, courseName: '', courseCode: '' });
            })
            .catch(error => {
                showPopup('error', error.response?.data?.message || "Delete Error: Failed to remove module.");
                setDeleteModal({ show: false, courseId: null, courseName: '', courseCode: '' });
            });
    };

    // --- STUDENT ROSTER LOGIC ---
    const openStudentsModal = (course) => {
        setViewStudentsModal({ show: true, course });
        setIsLoadingStudents(true);
        setConfirmingStudentId(null);
        setConfirmingClearAll(false);
        
        getEnrolledStudents(course.courseId)
            .then(res => {
                setEnrolledStudents(res.data);
                setIsLoadingStudents(false);
            })
            .catch(err => {
                showPopup('error', 'Failed to load enrolled students.');
                setIsLoadingStudents(false);
            });
    };

    const executeStudentRemoval = (userId, studentName) => {
        removeStudentFromCourse(viewStudentsModal.course.courseId, userId)
            .then(() => {
                showPopup('success', `${studentName} was removed from the course.`);
                setEnrolledStudents(prev => prev.filter(s => s.userId !== userId));
                setConfirmingStudentId(null);
            })
            .catch(err => {
                showPopup('error', err.response?.data?.message || 'Failed to remove student.');
                setConfirmingStudentId(null);
            });
    };

    const executeClearAll = () => {
        removeAllStudentsFromCourse(viewStudentsModal.course.courseId)
            .then(() => {
                showPopup('success', `All students removed from ${viewStudentsModal.course.courseCode}.`);
                setEnrolledStudents([]);
                setConfirmingClearAll(false);
            })
            .catch(err => {
                showPopup('error', err.response?.data?.message || 'Failed to clear students.');
                setConfirmingClearAll(false);
            });
    };

    // --- FILTERS ---
    const filteredData = courseData.filter(course => {
        const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDepartment === 'All' || course.department === filterDepartment;
        const matchesYear = filterYear === 'All' || course.academicYear === filterYear;
        return matchesSearch && matchesDept && matchesYear;
    });

    const getDeptClass = (dept) => {
        if (!dept) return 'role-admin';
        if (dept.includes('Computing')) return 'role-student';
        if (dept.includes('Business')) return 'role-lecturer';
        return 'role-admin';
    };

    return (
        <div className="app-layout">
            <Sidebar />
            
            {/* Toast Notification */}
            {notification.show && (
                <div className={`toast-notification toast-${notification.type}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} style={{minWidth: '20px'}}/> : <XCircle size={20} style={{minWidth: '20px'}}/>}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Course Deletion Modal */}
            {deleteModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <AlertTriangle size={28} color="#ee5d50" />
                            <h2>Remove Module</h2>
                        </div>
                        <p>Are you sure you want to permanently delete <strong>{deleteModal.courseCode} - {deleteModal.courseName}</strong>? This will remove it from the university catalog.</p>
                        <div className="modal-actions">
                            <button className="cancel-modal-btn" onClick={() => setDeleteModal({ show: false, courseId: null, courseName: '', courseCode: '' })}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={confirmDelete}>
                                Yes, Delete Module
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrolled Students Modal */}
            {viewStudentsModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="user-icon-box" style={{ background: '#f4f7fe', color: '#4318ff', width: '40px', height: '40px' }}>
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '18px', color: '#2b3674' }}>Class Roster: {viewStudentsModal.course.courseCode}</h2>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#a3aed0' }}>{viewStudentsModal.course.courseName}</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {/* NEW: Clear All Button */}
                                {enrolledStudents.length > 0 && !isLoadingStudents && (
                                    <button 
                                        className="cancel-modal-btn" 
                                        style={{ borderColor: '#ee5d50', color: '#ee5d50', padding: '6px 12px' }} 
                                        onClick={() => setConfirmingClearAll(true)}
                                    >
                                        Clear All Students
                                    </button>
                                )}
                                <button onClick={() => setViewStudentsModal({ show: false, course: null })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a3aed0' }}>
                                    <XCircle size={28} />
                                </button>
                            </div>
                        </div>

                        {/* NEW: Inline Clear All Confirmation */}
                        {confirmingClearAll && (
                            <div style={{ background: '#ffebee', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#ee5d50', fontSize: '13px', fontWeight: '600' }}>Are you sure you want to remove ALL students from this course?</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={executeClearAll} style={{ background: '#ee5d50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Yes, Clear All
                                    </button>
                                    <button onClick={() => setConfirmingClearAll(false)} style={{ background: 'white', color: '#2b3674', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLoadingStudents ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#a3aed0' }}>Loading student data...</div>
                        ) : enrolledStudents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#a3aed0', backgroundColor: '#f4f7fe', borderRadius: '12px' }}>
                                <Users size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                                <p>No students are currently enrolled in this module.</p>
                            </div>
                        ) : (
                            <table className="directory-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Full Name</th>
                                        <th>Email Address</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrolledStudents.map(student => (
                                        <tr key={student.userId}>
                                            <td style={{ fontWeight: '600', color: '#a3aed0' }}>{student.CustomUserId || `ID-${student.userId}`}</td>
                                            <td style={{ fontWeight: '500', color: '#2b3674' }}>{student.fullName}</td>
                                            <td>{student.email}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                {/* Inline Confirmation Logic (No alerts!) */}
                                                {confirmingStudentId === student.userId ? (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            style={{ background: '#ee5d50', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                                            onClick={() => executeStudentRemoval(student.userId, student.fullName)}
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button 
                                                            style={{ background: '#f4f7fe', color: '#2b3674', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                                            onClick={() => setConfirmingStudentId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        className="icon-btn delete" 
                                                        title="Remove from Course"
                                                        onClick={() => setConfirmingStudentId(student.userId)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
            
            <main className="main-content">
                <div className="user-mgmt-header">
                    <h1>Academic Course Setup</h1>
                    <p>Configure curriculum structures, register university modules, and manage system credits</p>
                </div>

                <div className="user-summary-grid">
                    <div className="user-card">
                        <div className="user-icon-box" style={{background: '#4318ff'}}><BookOpen size={24} /></div>
                        <div className="user-details">
                            <h2>{courseData.length}</h2>
                            <p>Total Registered Modules</p>
                        </div>
                    </div>
                    <div className="user-card">
                        <div className="user-icon-box" style={{background: '#05cd99'}}><Award size={24} /></div>
                        <div className="user-details">
                            <h2>{courseData.reduce((acc, curr) => acc + (curr.credits || 0), 0)}</h2>
                            <p>Total Curriculum Credits</p>
                        </div>
                    </div>
                    <div className="user-card">
                        <div className="user-icon-box" style={{background: '#f6a623'}}><Layers size={24} /></div>
                        <div className="user-details">
                            <h2>{new Set(courseData.map(c => c.department)).size}</h2>
                            <p>Active Faculties</p>
                        </div>
                    </div>
                </div>

                <div className="user-mgmt-layout">
                    {/* Directory Table */}
                    <div className="directory-container">
                        <div className="directory-header-row">
                            <h3>Module Catalog</h3>
                            <span className="record-count">{filteredData.length} modules</span>
                        </div>
                        <p>Search by module name or code. Filter results dynamically below.</p>
                        
                        <div className="directory-filters">
                            <div className="search-bar">
                                <Search size={16} color="#a3aed0" />
                                <input 
                                    type="text" 
                                    placeholder="Search code or name (e.g., CS301)..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select className="filter-select" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                                <option value="All">All Faculties</option>
                                <option value="Faculty of Computing">Faculty of Computing</option>
                                <option value="Faculty of Business">Faculty of Business</option>
                                <option value="Faculty of Engineering">Faculty of Engineering</option>
                            </select>
                            <select className="filter-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                <option value="All">All Years</option>
                                <option value="Year 1">Year 1</option>
                                <option value="Year 2">Year 2</option>
                                <option value="Year 3">Year 3</option>
                                <option value="Year 4">Year 4</option>
                            </select>
                        </div>
                        
                        <table className="directory-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Module Title</th>
                                    <th>Faculty</th>
                                    <th>Schedule</th>
                                    <th>Credits</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((course, index) => (
                                    <tr key={index}>
                                        <td className="user-id-cell" style={{ fontWeight: '700' }}>{course.courseCode}</td>
                                        <td>
                                            <div className="name-cell">
                                                <FileText size={14} color="#a3aed0" />
                                                {course.courseName}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-pill ${getDeptClass(course.department)}`}>
                                                {course.department ? course.department.replace('Faculty of ', '') : 'General'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2b3674' }}>
                                                <Calendar size={12} color="#a3aed0" />
                                                {course.academicYear} — {course.semester}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600', paddingLeft: '24px' }}>{course.credits}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button type="button" className="icon-btn" style={{ color: '#05cd99' }} onClick={() => openStudentsModal(course)} title="View Enrolled Students">
                                                    <Users size={16} />
                                                </button>
                                                <button type="button" className="icon-btn edit" onClick={() => handleEditClick(course)} title="Edit Module">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button type="button" className="icon-btn delete" onClick={() => handleDeleteClick(course.courseId, course.courseCode, course.courseName)} title="Delete Module">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#a3aed0' }}>
                                            No modules found matching the specified parameters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Configuration Form */}
                    <div className="creation-form-container">
                        <h3>{editingCourseId ? "Modify Course Specifications" : "Register New Module"}</h3>
                        <p>{editingCourseId ? "Alter configuration thresholds" : "Introduce a brand new curriculum track into the system"}</p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Course Code</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g., CS301" 
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Module Title</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g., Advanced Database Systems" 
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Credit Evaluation Value</label>
                                <select 
                                    className="form-input"
                                    value={credits}
                                    onChange={(e) => setCredits(parseInt(e.target.value))}
                                >
                                    <option value={1}>1 Credit Component</option>
                                    <option value={2}>2 Credits Track</option>
                                    <option value={3}>3 Credits Core Module</option>
                                    <option value={4}>4 Credits Advanced Track</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Academic Delivery Year</label>
                                <select 
                                    className="form-input"
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                >
                                    <option value="Year 1">Year 1 Delivery</option>
                                    <option value="Year 2">Year 2 Delivery</option>
                                    <option value="Year 3">Year 3 Delivery</option>
                                    <option value="Year 4">Year 4 Delivery</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Academic Delivery Semester</label>
                                <select 
                                    className="form-input"
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                >
                                    <option value="Semester 1">Semester 1 Allocation</option>
                                    <option value="Semester 2">Semester 2 Allocation</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Department Ownership</label>
                                <select 
                                    className="form-input"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    <option value="Faculty of Computing">Faculty of Computing</option>
                                    <option value="Faculty of Business">Faculty of Business</option>
                                    <option value="Faculty of Engineering">Faculty of Engineering</option>
                                    <option value="Administration">Administration Services</option>
                                </select>
                            </div>

                            <button type="submit" className="create-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : (
                                    editingCourseId ? <><Save size={18} /> Update Course Spec</> : <><PlusCircle size={18} /> Initialize Academic Module</>
                                )}
                            </button>

                            {editingCourseId && (
                                <button type="button" className="cancel-btn" onClick={resetForm}>
                                    Abort Modification
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseManagement;