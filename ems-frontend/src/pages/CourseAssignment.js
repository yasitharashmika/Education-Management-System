import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { UserPlus, Filter } from 'lucide-react';
import { getCourseAllocations, getAvailableLecturers, assignLecturerToCourse } from '../services/apiService';
import './Dashboard.css';

const CourseAssignment = () => {
    // --- Raw Data from DB ---
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    
    // --- Filter States ---
    const [filterYear, setFilterYear] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');

    // --- Selection States ---
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    
    // --- UI States ---
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    // Fetch initial data
    const fetchDropdownData = async () => {
        setIsLoading(true);
        try {
            const [courseRes, lecturerRes] = await Promise.all([
                getCourseAllocations(),
                getAvailableLecturers()
            ]);
            setCourses(courseRes.data);
            setLecturers(lecturerRes.data);
        } catch (error) {
            console.error("Failed to fetch allocation data", error);
            setSaveStatus({ type: 'error', message: 'Failed to load database records.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    // --- SMART FUZZY MATCH FUNCTION ---
    const isDepartmentMatch = (dbDepartment, selectedFilter) => {
        if (!selectedFilter) return true; 
        if (!dbDepartment) return false;
        
        const dbDeptLower = dbDepartment.toLowerCase();
        const filterLower = selectedFilter.toLowerCase();
        
        return dbDeptLower.includes(filterLower) || filterLower.includes(dbDeptLower);
    };

    // --- APPLY FILTERS IN REAL-TIME ---
    const filteredCourses = courses.filter(c => 
        (filterYear === '' || c.academicYear === filterYear) &&
        (filterSemester === '' || c.semester === filterSemester) &&
        isDepartmentMatch(c.department, filterDepartment)
    );

    const filteredLecturers = lecturers.filter(l => 
        isDepartmentMatch(l.departmentName, filterDepartment)
    );

    // Auto-select the first item safely when filters change
    useEffect(() => {
        if (filteredCourses.length > 0) {
            const isValid = filteredCourses.some(c => c.courseId === Number(selectedCourseId));
            if (!isValid) setSelectedCourseId(filteredCourses[0].courseId);
        } else {
            setSelectedCourseId('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterYear, filterSemester, filterDepartment, courses]);

    useEffect(() => {
        if (filteredLecturers.length > 0) {
            const isValid = filteredLecturers.some(l => l.facultyId === Number(selectedFacultyId));
            if (!isValid) setSelectedFacultyId(filteredLecturers[0].facultyId);
        } else {
            setSelectedFacultyId('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterDepartment, lecturers]);

    // --- EXTRACT UNIQUE FILTER OPTIONS ---
    const uniqueYears = [...new Set(courses.map(c => c.academicYear).filter(Boolean))].sort();
    const uniqueSemesters = [...new Set(courses.map(c => c.semester).filter(Boolean))].sort();
    const uniqueDepartments = [...new Set(lecturers.map(l => l.departmentName).filter(Boolean))].sort();

    const handleSave = () => {
        if (!selectedCourseId || !selectedFacultyId) {
            setSaveStatus({ type: 'error', message: 'Please select both a course and a lecturer.' });
            return;
        }

        setIsSaving(true);
        setSaveStatus({ type: '', message: '' });

        const payload = {
            courseId: Number(selectedCourseId),
            facultyId: Number(selectedFacultyId)
        };

        assignLecturerToCourse(payload)
            .then(() => {
                setSaveStatus({ type: 'success', message: 'Lecturer successfully assigned to course!' });
                setIsSaving(false);
                fetchDropdownData(); 
                
                setTimeout(() => {
                    setSaveStatus({ type: '', message: '' });
                }, 3000);
            })
            .catch(err => {
                console.error(err);
                setSaveStatus({ type: 'error', message: 'Failed to assign lecturer. Please try again.' });
                setIsSaving(false);
            });
    };

    const activeCourse = courses.find(c => c.courseId === Number(selectedCourseId));

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content" style={{ paddingBottom: '0' }}>
                <div className="faculty-header" style={{ marginBottom: '20px' }}>
                    <h1>Course Allocation Management</h1>
                    <p>Filter, assign, and manage faculty modules</p>
                </div>

                {isLoading ? (
                    <div style={{ padding: '20px', color: '#94a3b8' }}>Loading secure database records...</div>
                ) : (
                    /* --- REMOVED maxWidth: '900px' AND SET width: '100%' --- */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                        
                        {/* --- TOP FILTER BAR --- */}
                        <div className="filter-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600', marginRight: '10px' }}>
                                <Filter size={18} /> Filters:
                            </div>
                            
                            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', backgroundColor: '#f8fafc', fontSize: '13px', flex: 1 }}>
                                <option value="">All Academic Years</option>
                                {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', backgroundColor: '#f8fafc', fontSize: '13px', flex: 1 }}>
                                <option value="">All Semesters</option>
                                {uniqueSemesters.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', backgroundColor: '#f8fafc', fontSize: '13px', flex: 1 }}>
                                <option value="">All Departments (Faculty)</option>
                                {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            
                            {/* Clear Filters Button */}
                            {(filterYear || filterSemester || filterDepartment) && (
                                <button 
                                    onClick={() => { setFilterYear(''); setFilterSemester(''); setFilterDepartment(''); }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600', textDecoration: 'underline' }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* --- ASSIGNMENT CARD --- */}
                        <div className="assignment-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                                <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b', fontSize: '14px' }}>Select Course Module ({filteredCourses.length})</label>
                                    <select 
                                        value={selectedCourseId} 
                                        onChange={e => setSelectedCourseId(e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', backgroundColor: '#f8fafc', width: '100%' }}
                                        disabled={filteredCourses.length === 0}
                                    >
                                        {filteredCourses.length === 0 ? <option value="">No courses match filters</option> : null}
                                        {filteredCourses.map(course => (
                                            <option key={course.courseId} value={course.courseId}>
                                                {course.courseCode} - {course.courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b', fontSize: '14px' }}>Assign Lecturer ({filteredLecturers.length})</label>
                                    <select 
                                        value={selectedFacultyId} 
                                        onChange={e => setSelectedFacultyId(e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', backgroundColor: '#f8fafc', width: '100%' }}
                                        disabled={filteredLecturers.length === 0}
                                    >
                                        {filteredLecturers.length === 0 ? <option value="">No lecturers match filters</option> : null}
                                        {filteredLecturers.map(lecturer => (
                                            <option key={lecturer.facultyId} value={lecturer.facultyId}>
                                                {lecturer.lecturerName} ({lecturer.departmentName})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {activeCourse && (
                                <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981', borderRadius: '4px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#064e3b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current DB Record: {activeCourse.courseCode}</h4>
                                        <p style={{ margin: 0, color: '#047857', fontSize: '15px' }}>
                                            Assigned Faculty: <strong>{activeCourse.currentLecturer || 'Unassigned'}</strong>
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '13px', color: '#047857', opacity: 0.8 }}>
                                        {activeCourse.academicYear} • {activeCourse.semester}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
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
                                <button 
                                    onClick={handleSave} 
                                    disabled={isSaving || !selectedCourseId || !selectedFacultyId}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        backgroundColor: '#2b3674', color: 'white', padding: '12px 24px', 
                                        border: 'none', borderRadius: '6px', cursor: (isSaving || !selectedCourseId || !selectedFacultyId) ? 'not-allowed' : 'pointer', fontWeight: '600',
                                        opacity: (isSaving || !selectedCourseId || !selectedFacultyId) ? 0.6 : 1
                                    }}
                                >
                                    <UserPlus size={18} /> {isSaving ? "Updating Database..." : "Confirm Assignment"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CourseAssignment;