import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Save } from 'lucide-react';
import { getFacultyAssignments, getAttendanceRoster, saveAttendanceRecords } from '../services/apiService';
import './FacultyAttendance.css';
import './Dashboard.css';

const FacultyAttendance = () => {
    const [roster, setRoster] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Modern UI state to replace the alert popup
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    // --- Dynamic Filter Options arrays ---
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);

    // --- Selected Values ---
    // Defaults to today's date in YYYY-MM-DD format
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [academicYear, setAcademicYear] = useState('');
    const [semester, setSemester] = useState('');
    const [courseId, setCourseId] = useState(''); 

    // Get Logged In User
    const userStr = localStorage.getItem('nexusUser');
    const userData = userStr ? JSON.parse(userStr) : { userId: 1 };

    // 1. Fetch the Faculty's specific assignments on page load
    useEffect(() => {
        getFacultyAssignments(userData.userId || 1)
            .then(res => {
                const data = res.data;
                if (data && data.length > 0) {
                    const uniqueYears = [...new Set(data.map(item => item.academicYear))];
                    setAvailableYears(uniqueYears);
                    setAcademicYear(uniqueYears[0]); 

                    const uniqueSemesters = [...new Set(data.map(item => item.semester))];
                    setAvailableSemesters(uniqueSemesters);
                    setSemester(uniqueSemesters[0]); 

                    const uniqueCourses = data.reduce((acc, current) => {
                        const x = acc.find(item => item.courseId === current.courseId);
                        if (!x) return acc.concat([current]);
                        return acc;
                    }, []);
                    setAvailableCourses(uniqueCourses);
                    setCourseId(uniqueCourses[0].courseId); 
                }
            })
            .catch(err => console.error("Failed to load faculty assignments", err));
    }, [userData.userId]);

    // 2. Fetch the roster whenever ANY filter changes (including Date)
    useEffect(() => {
        if (courseId && academicYear && semester && selectedDate) { 
            fetchRoster();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear, semester, courseId, selectedDate]);

    const fetchRoster = () => {
        setIsLoading(true);
        setSaveStatus({ type: '', message: '' }); // Clear any old messages when changing filters

        getAttendanceRoster(courseId, selectedDate, academicYear, semester)
            .then(res => {
                const formattedRoster = res.data.map(student => ({
                    enrollmentId: student.enrollmentId,
                    id: student.indexNumber,
                    name: student.studentName,
                    status: student.status // Will be null if empty, or 'Present'/'Absent' if already saved in SQL
                }));
                setRoster(formattedRoster);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load attendance roster", err);
                setRoster([]);
                setIsLoading(false);
            });
    };

    const handleStatusChange = (index, newStatus) => {
        const newRoster = [...roster];
        newRoster[index].status = newStatus;
        setRoster(newRoster);
    };

    const handleSave = () => {
        // Validation: Ensure all students have a status before saving
        const unmarked = roster.filter(s => s.status === null).length;
        if (unmarked > 0) {
            setSaveStatus({ type: 'error', message: `Please mark all students. ${unmarked} remaining.` });
            return;
        }

        setIsSaving(true);
        setSaveStatus({ type: '', message: '' });

        const payload = roster.map(student => ({
            enrollmentId: student.enrollmentId,
            attendanceDate: selectedDate,
            status: student.status
        }));

        saveAttendanceRecords(payload)
            .then(() => {
                // Elegant inline success message
                setSaveStatus({ type: 'success', message: 'Attendance published successfully!' });
                setIsSaving(false);
                
                // Auto-hide the success message after 3 seconds
                setTimeout(() => {
                    setSaveStatus({ type: '', message: '' });
                }, 3000);
            })
            .catch(err => {
                console.error(err);
                setSaveStatus({ type: 'error', message: 'Failed to save attendance. Please try again.' });
                setIsSaving(false);
            });
    };

    // Calculate live statistics for the top bar
    const stats = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    let markedCount = 0;
    
    roster.forEach(student => {
        if (student.status) {
            stats[student.status]++;
            markedCount++;
        }
    });

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content" style={{ paddingBottom: '0' }}>
                <div className="attendance-marking-header">
                    <h1>Daily Attendance Management</h1>
                    <p>Mark and manage student attendance for your assigned course modules</p>
                </div>

                {/* EXACT MATCH TO FACULTY GRADES TOP FILTERS */}
                <div className="top-filters">
                    <div className="filter-group">
                        <label>Attendance Date</label>
                        <input 
                            type="date" 
                            className="filter-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Academic Year</label>
                        <select value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
                            {availableYears.length === 0 ? <option value="">No Data</option> : 
                                availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Semester</label>
                        <select value={semester} onChange={e => setSemester(e.target.value)}>
                            {availableSemesters.length === 0 ? <option value="">No Data</option> : 
                                availableSemesters.map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Course Module</label>
                        <select value={courseId} onChange={e => setCourseId(Number(e.target.value))}>
                            {availableCourses.length === 0 ? (
                                <option value="">Loading courses...</option>
                            ) : (
                                availableCourses.map(course => (
                                    <option key={course.courseId} value={course.courseId}>
                                        {course.courseCode} - {course.courseName}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="roster-container">
                    <div className="stats-bar" style={{ display: 'flex', gap: '15px', padding: '15px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', alignItems: 'center', fontSize: '14px' }}>
                        <span style={{ color: '#2b3674' }}>Marked: <strong>{markedCount}</strong> / {roster.length}</span>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Present: <strong>{stats.Present}</strong></div>
                        <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div> Absent: <strong>{stats.Absent}</strong></div>
                        <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div> Late: <strong>{stats.Late}</strong></div>
                        <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Excused: <strong>{stats.Excused}</strong></div>
                    </div>

                    <table className="roster-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                <th style={{textAlign: 'center'}}>Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="3" style={{textAlign:'center', padding: '20px', color: '#94a3b8'}}>Loading database roster...</td></tr>
                            ) : roster.length === 0 ? (
                                <tr><td colSpan="3" style={{textAlign:'center', padding: '20px', color: '#94a3b8'}}>No students enrolled in this configuration.</td></tr>
                            ) : (
                                roster.map((student, index) => (
                                    <tr key={student.enrollmentId}>
                                        <td className="student-id" style={{ fontWeight: '600' }}>{student.id}</td>
                                        <td className="student-name">{student.name}</td>
                                        <td style={{textAlign: 'center'}}>
                                            <div className="status-toggles" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button 
                                                    className={`toggle-btn ${student.status === 'Present' ? 'active-present' : ''}`}
                                                    onClick={() => handleStatusChange(index, 'Present')}
                                                    style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: student.status === 'Present' ? '#10b981' : 'white', color: student.status === 'Present' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                                                >Present</button>
                                                <button 
                                                    className={`toggle-btn ${student.status === 'Absent' ? 'active-absent' : ''}`}
                                                    onClick={() => handleStatusChange(index, 'Absent')}
                                                    style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: student.status === 'Absent' ? '#ef4444' : 'white', color: student.status === 'Absent' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                                                >Absent</button>
                                                <button 
                                                    className={`toggle-btn ${student.status === 'Late' ? 'active-late' : ''}`}
                                                    onClick={() => handleStatusChange(index, 'Late')}
                                                    style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: student.status === 'Late' ? '#f59e0b' : 'white', color: student.status === 'Late' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                                                >Late</button>
                                                <button 
                                                    className={`toggle-btn ${student.status === 'Excused' ? 'active-excused' : ''}`}
                                                    onClick={() => handleStatusChange(index, 'Excused')}
                                                    style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: student.status === 'Excused' ? '#3b82f6' : 'white', color: student.status === 'Excused' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                                                >Excused</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="save-action-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {saveStatus.message && (
                        <span style={{ 
                            marginRight: '15px', 
                            color: saveStatus.type === 'success' ? '#10b981' : '#ef4444', 
                            fontWeight: '600',
                            animation: 'fadeIn 0.3s ease-in-out'
                        }}>
                            {saveStatus.message}
                        </span>
                    )}
                    <button className="save-btn" onClick={handleSave} disabled={isSaving || roster.length === 0}>
                        <Save size={18} /> {isSaving ? "Saving..." : "Save & Publish Attendance"}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default FacultyAttendance;