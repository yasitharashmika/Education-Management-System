import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Clock, Award, Bookmark, CreditCard, CheckCircle, Filter } from 'lucide-react';
import { getAllCourses, getStudentReportCard } from '../services/apiService'; 
import './CourseEnrollment.css';
import './Dashboard.css';

const CourseEnrollment = () => {
    const navigate = useNavigate();
    
    // States
    const [courseData, setCourseData] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [filterSemester, setFilterSemester] = useState('All');

    // Get Active User
    const userStr = localStorage.getItem('nexusUser');
    const userData = userStr ? JSON.parse(userStr) : null;
    const activeUserId = userData ? (userData.userId || userData.id || userData.UserId) : null;

    useEffect(() => {
        // Fetch ALL available courses
        getAllCourses()
            .then(response => {
                setCourseData(response.data);
            })
            .catch(error => console.error("Failed to load courses", error));

        // Fetch user's EXISTING enrollments to calculate credit limit
        if (activeUserId) {
            getStudentReportCard(activeUserId)
                .then(response => {
                    const records = response.data || [];
                    // Filter down to just the current active semester
                    if (records.length > 0) {
                        const latestYear = records[0].academicYear;
                        const latestSem = records[0].semester;
                        const current = records.filter(d => d.academicYear === latestYear && d.semester === latestSem);
                        setEnrolledCourses(current);
                    }
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Failed to fetch report card", error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [activeUserId]);

    const currentCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0);

    const handleInitiateEnrollment = (course) => {
        if (enrolledCourses.find(c => c.courseCode === course.courseCode)) {
            alert("You are already enrolled in this module!");
            return;
        }

        if (currentCredits + course.credits > 20) {
            alert(`Enrollment failed! Adding ${course.credits} credits will exceed your 20 credit limit.`);
            return;
        }

        const calculatedFee = course.credits * 5000;
        navigate('/fees', { 
            state: { 
                pendingCourse: course,
                feeAmount: calculatedFee,
                message: `You must complete the payment of Rs. ${calculatedFee} to finalize enrollment for ${course.courseCode}.`
            } 
        });
    };

    // --- NEW BULLETPROOF FILTER LOGIC ---
    const isMatch = (dbValue, filterValue) => {
        if (filterValue === 'All') return true;
        if (!dbValue) return false;
        
        // Strip out the word "Faculty of" if it exists, and trim whitespace
        const cleanDbValue = dbValue.toLowerCase().replace('faculty of', '').trim();
        const cleanFilterValue = filterValue.toLowerCase().replace('faculty of', '').trim();
        
        return cleanDbValue.includes(cleanFilterValue) || cleanFilterValue.includes(cleanDbValue);
    };

    const filteredCourses = courseData.filter(course => {
        const matchesSearch = course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());
                              
        const matchesDept = isMatch(course.department, filterDepartment);
        const matchesYear = isMatch(course.academicYear, filterYear);
        const matchesSem = isMatch(course.semester, filterSemester);

        return matchesSearch && matchesDept && matchesYear && matchesSem;
    });

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content">
                <div className="enrollment-header">
                    <h1>Course Enrollment</h1>
                    <p>Browse the academic catalog and select modules. Enrollment is confirmed upon fee payment.</p>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="search-filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' }}>
                        <Filter size={18} /> Filters:
                    </div>

                    <div className="search-box" style={{ flex: 1.5, minWidth: '200px' }}>
                        <Search size={20} color="#a3aed0" />
                        <input 
                            type="text" 
                            placeholder="Search by module name or code..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', border: 'none', outline: 'none', marginLeft: '8px' }}
                        />
                    </div>
                    
                    <select className="filter-select" style={{ flex: 1, minWidth: '150px' }} value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                        <option value="All">All Faculties</option>
                        <option value="Computing">Faculty of Computing</option>
                        <option value="Business">Faculty of Business</option>
                        <option value="Engineering">Faculty of Engineering</option>
                    </select>

                    <select className="filter-select" style={{ flex: 1, minWidth: '120px' }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                        <option value="All">All Years</option>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                    </select>

                    <select className="filter-select" style={{ flex: 1, minWidth: '140px' }} value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
                        <option value="All">All Semesters</option>
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                    </select>

                    {/* Clear Filters Button */}
                    {(filterYear !== 'All' || filterSemester !== 'All' || filterDepartment !== 'All' || searchQuery !== '') && (
                        <button 
                            onClick={() => { setFilterYear('All'); setFilterSemester('All'); setFilterDepartment('All'); setSearchQuery(''); }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600', textDecoration: 'underline' }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="enrollment-layout">
                    {/* LEFT SIDE: Course Grid */}
                    <div className="courses-grid">
                        {isLoading ? (
                            <p style={{ color: '#a3aed0', padding: '20px' }}>Loading academic catalog...</p>
                        ) : filteredCourses.length === 0 ? (
                            <p style={{ color: '#a3aed0', padding: '20px' }}>No modules found matching your filters.</p>
                        ) : (
                            filteredCourses.map((course) => {
                                const isAlreadyEnrolled = enrolledCourses.find(c => c.courseCode === course.courseCode);
                                
                                return (
                                    <div className="course-card" key={course.courseId}>
                                        <div className="course-card-header">
                                            <span className="course-code" style={{ fontWeight: 'bold', color: '#4318ff' }}>{course.courseCode}</span>
                                            <span className="seats-badge seats-available">
                                                {course.department ? course.department.replace('Faculty of ', '') : 'General'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="course-title" style={{ marginTop: '12px' }}>{course.courseName}</h3>
                                        
                                        <div className="course-meta" style={{ marginTop: '16px', display: 'flex', gap: '16px', color: '#a3aed0', fontSize: '13px' }}>
                                            <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} /> {course.academicYear} - {course.semester}
                                            </div>
                                            <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Award size={14} /> {course.credits} Credits
                                            </div>
                                        </div>

                                        {isAlreadyEnrolled ? (
                                            <button 
                                                className="enroll-btn"
                                                style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', background: '#e6f9f0', color: '#03906b', border: 'none', cursor: 'not-allowed' }}
                                                disabled
                                            >
                                                <CheckCircle size={18} /> Currently Enrolled
                                            </button>
                                        ) : (
                                            <button 
                                                className="enroll-btn btn-primary"
                                                style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                                                onClick={() => handleInitiateEnrollment(course)}
                                            >
                                                <CreditCard size={18} /> Proceed to Payment
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* RIGHT SIDE: Real Database Summary Panel */}
                    <div className="summary-panel">
                        <div className="summary-card">
                            <h3>Current Semester Load</h3>
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <h2 style={{ fontSize: '36px', color: currentCredits >= 20 ? '#ee5d50' : '#05cd99', margin: 0 }}>
                                    {currentCredits} <span style={{ fontSize: '16px', color: '#a3aed0' }}>/ 20</span>
                                </h2>
                                <p style={{ fontSize: '12px', color: '#a3aed0', marginTop: '8px' }}>
                                    {20 - currentCredits > 0 ? `${20 - currentCredits} credits remaining` : 'Maximum credits reached'}
                                </p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <h3>My Enrolled Modules</h3>
                            {enrolledCourses.length === 0 ? (
                                <div className="empty-state" style={{ textAlign: 'center', padding: '30px 0', color: '#a3aed0' }}>
                                    <Bookmark size={32} color="#e2e8f0" style={{ marginBottom: '10px' }} />
                                    <p style={{ fontSize: '13px', margin: 0 }}>You have not enrolled in any<br/>courses this semester.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {enrolledCourses.map((c, index) => (
                                        <div key={index} style={{ padding: '12px', background: '#e6f9f0', borderLeft: '4px solid #05cd99', borderRadius: '8px' }}>
                                            <h4 style={{ fontSize: '14px', color: '#2b3674', margin: '0 0 4px 0' }}>{c.courseCode}</h4>
                                            <p style={{ fontSize: '12px', color: '#a3aed0', margin: 0 }}>{c.courseName}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseEnrollment;