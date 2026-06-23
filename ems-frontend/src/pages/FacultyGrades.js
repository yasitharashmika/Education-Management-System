import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Save } from 'lucide-react';
import { getCourseRoster, saveCourseGrades, getFacultyAssignments } from '../services/apiService';
import './FacultyGrades.css';
import './Dashboard.css';

const FacultyGrades = () => {
    const [roster, setRoster] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // UI state for the success/error notice
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    // --- Dynamic Filter Options arrays ---
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);

    // --- Selected Values ---
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

    // 2. Fetch the roster whenever filters change
    useEffect(() => {
        if (courseId && academicYear && semester) { 
            fetchRoster();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear, semester, courseId]);

    const fetchRoster = () => {
        setIsLoading(true);
        setSaveStatus({ type: '', message: '' }); 

        getCourseRoster(courseId, academicYear, semester)
            .then(res => {
                const formattedRoster = res.data.map(student => ({
                    studentId: student.studentId,
                    formattedIndex: student.indexNumber || `ID-${student.studentId}`, 
                    name: student.studentName,
                    mid: student.midtermMarks !== null ? student.midtermMarks : '',
                    final: student.finalMarks !== null ? student.finalMarks : ''
                }));
                setRoster(formattedRoster);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load roster", err);
                setRoster([]);
                setIsLoading(false);
            });
    };

    const calculateGrade = (mid, final) => {
        const m = parseFloat(mid) || 0;
        const f = parseFloat(final) || 0;
        const total = (m * 0.30) + (f * 0.70);

        if (mid === '' && final === '') return { letter: '-', pill: 'pill-neutral' };

        if (total > 85) return { letter: 'A+', pill: 'pill-aplus' };
        if (total >= 75) return { letter: 'A', pill: 'pill-a' };
        if (total >= 65) return { letter: 'A-', pill: 'pill-aminus' }; 
        if (total > 55) return { letter: 'B', pill: 'pill-b' };
        if (total > 45) return { letter: 'B-', pill: 'pill-bminus' };
        return { letter: 'F', pill: 'pill-f' };
    };

    const handleMarkChange = (index, field, value) => {
        const newRoster = [...roster];
        newRoster[index][field] = value;
        setRoster(newRoster);
    };

    const handleSave = () => {
        setIsSaving(true);
        setSaveStatus({ type: '', message: '' });
        
        const payload = roster.map(student => ({
            studentId: student.studentId,
            courseId: courseId,
            academicYear: academicYear,
            semester: semester,
            midtermMarks: parseFloat(student.mid) || 0,
            finalMarks: parseFloat(student.final) || 0
        }));

        saveCourseGrades(payload)
            .then(() => {
                // --- THIS IS THE UPDATED SUCCESS NOTICE ---
                setSaveStatus({ type: 'success', message: 'Marks added and saved successfully!' });
                setIsSaving(false);
                fetchRoster(); 
                
                // Hides the message after 3 seconds
                setTimeout(() => {
                    setSaveStatus({ type: '', message: '' });
                }, 3000);
            })
            .catch(err => {
                console.error("Save Error:", err);
                setSaveStatus({ type: 'error', message: 'Failed to save marks. Please try again.' });
                setIsSaving(false);
            });
    };

    // --- LIVE STATISTICS CALCULATOR ---
    let midtermMarked = 0;
    let finalMarked = 0;
    let fullyGraded = 0;

    roster.forEach(student => {
        const hasMid = student.mid !== '' && student.mid !== null;
        const hasFinal = student.final !== '' && student.final !== null;
        
        if (hasMid) midtermMarked++;
        if (hasFinal) finalMarked++;
        if (hasMid && hasFinal) fullyGraded++;
    });

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content" style={{ paddingBottom: '0' }}>
                <div className="faculty-header">
                    <h1>Faculty Grade Management</h1>
                    <p>Enter and manage student grades for your assigned course modules</p>
                </div>

                <div className="top-filters">
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
                    {/* --- LIVE PROGRESS BAR --- */}
                    <div className="stats-bar" style={{ display: 'flex', gap: '15px', padding: '15px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', alignItems: 'center', fontSize: '14px' }}>
                        <span style={{ color: '#2b3674' }}>Fully Graded: <strong>{fullyGraded}</strong> / {roster.length}</span>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Midterms Entered: <strong>{midtermMarked}</strong></div>
                        <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Finals Entered: <strong>{finalMarked}</strong></div>
                    </div>

                    <table className="roster-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                <th style={{textAlign: 'center'}}>Midterm Marks (30%)</th>
                                <th style={{textAlign: 'center'}}>Final Marks (70%)</th>
                                <th style={{textAlign: 'center'}}>Letter Grade Preview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" style={{textAlign:'center', padding: '20px', color: '#a3aed0'}}>Loading database roster...</td></tr>
                            ) : roster.length === 0 ? (
                                <tr><td colSpan="5" style={{textAlign:'center', padding: '20px', color: '#a3aed0'}}>No students enrolled in this configuration.</td></tr>
                            ) : (
                                roster.map((student, index) => {
                                    const gradePreview = calculateGrade(student.mid, student.final);
                                    return (
                                        <tr key={student.studentId}>
                                            <td className="student-id" style={{ fontWeight: '600' }}>
                                                {student.formattedIndex}
                                            </td>
                                            <td className="student-name">{student.name}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <input 
                                                    type="number" 
                                                    className="mark-input" 
                                                    value={student.mid}
                                                    onChange={(e) => handleMarkChange(index, 'mid', e.target.value)}
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <input 
                                                    type="number" 
                                                    className="mark-input" 
                                                    value={student.final}
                                                    onChange={(e) => handleMarkChange(index, 'final', e.target.value)}
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className={`grade-pill ${gradePreview.pill}`}>
                                                    {gradePreview.letter}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="save-action-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {/* --- THE SUCCESS NOTICE DISPLAYS HERE --- */}
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
                        <Save size={18} /> {isSaving ? "Saving..." : "Save & Publish Grades"}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default FacultyGrades;