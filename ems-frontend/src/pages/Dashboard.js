import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getStudentReportCard, getStudentAttendance, getStudentProfile } from '../services/apiService';
import { BookOpen, Award, Calendar, Star, ChevronRight, LayoutList } from 'lucide-react';
import './Dashboard.css'; 

const Dashboard = () => {
    const navigate = useNavigate();

    // State Variables
    const [allRecords, setAllRecords] = useState([]);
    const [currentSemRecords, setCurrentSemRecords] = useState([]);
    const [studentProfile, setStudentProfile] = useState(null);
    const [attendanceRate, setAttendanceRate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Context & User Data
    const userStr = localStorage.getItem('nexusUser');
    const userData = userStr ? JSON.parse(userStr) : { fullName: 'Student' };
    const activeUserId = userData ? (userData.userId || userData.id || userData.UserId) : null;

    useEffect(() => {
        if (!activeUserId) {
            setIsLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Fetch Grades
                const gradesResponse = await getStudentReportCard(activeUserId);
                const data = gradesResponse.data || [];
                setAllRecords(data);

                if (data.length > 0) {
                    const latestYear = data[0].academicYear;
                    const latestSem = data[0].semester;
                    const current = data.filter(d => d.academicYear === latestYear && d.semester === latestSem);
                    setCurrentSemRecords(current);
                }

                // Fetch Attendance dynamically for the KPI card
                try {
                    const attResponse = await getStudentAttendance(activeUserId);
                    const attData = attResponse.data || [];
                    if (attData.length > 0) {
                        const attended = attData.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late').length;
                        setAttendanceRate(((attended / attData.length) * 100).toFixed(1));
                    } else {
                        setAttendanceRate("0.0");
                    }
                } catch (e) {
                    console.warn("Attendance API not ready yet", e);
                    setAttendanceRate("N/A");
                }

                // Fetch Profile dynamically (Degree Program)
                try {
                    // Note: Ensure getStudentProfile is exported in your apiService.js
                    const profileResponse = await getStudentProfile(activeUserId);
                    setStudentProfile(profileResponse.data);
                } catch (e) {
                    console.warn("Profile API not ready yet", e);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [activeUserId]);

    // --- Dynamic Calculations ---
    const calculateGPA = (records) => {
        if (!records || records.length === 0) return "0.00";
        const totalPoints = records.reduce((sum, d) => sum + (d.gpaPoints * d.credits), 0);
        const totalCredits = records.reduce((sum, d) => sum + d.credits, 0);
        return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
    };

    const currentGPA = calculateGPA(currentSemRecords);
    const cumulativeGPA = calculateGPA(allRecords);
    
    const currentCredits = currentSemRecords.reduce((sum, d) => sum + d.credits, 0);
    const totalCredits = allRecords.reduce((sum, d) => sum + d.credits, 0);
    const enrolledCoursesCount = currentSemRecords.length;

    const recentCourses = allRecords.slice(0, 5);

    const getAcademicStanding = (gpa) => {
        const numGPA = parseFloat(gpa);
        if (numGPA >= 3.7) return { title: "Excellent", sub: "Top 15%" };
        if (numGPA >= 3.0) return { title: "Good Standing", sub: "On Track" };
        if (numGPA >= 2.0) return { title: "Satisfactory", sub: "Passing" };
        return { title: "Academic Warning", sub: "Action Required" };
    };
    const standing = getAcademicStanding(cumulativeGPA);

    // Dynamic Database Values
    const latestAcademicYear = currentSemRecords.length > 0 ? currentSemRecords[0].academicYear : 'N/A';
    const latestSemester = currentSemRecords.length > 0 ? currentSemRecords[0].semester : 'N/A';
    
    // Will use the DB value if available, otherwise fallback
    const degreeProgramDisplay = studentProfile?.degreeProgram || "Degree Program Unassigned";

    // --- Styling Helpers ---
    const getGradeStyle = (grade) => {
        if (!grade) return 'grade-default';
        if (grade.includes('A')) return 'grade-excellent'; 
        if (grade.includes('B')) return 'grade-good';      
        return 'grade-average';                            
    };

    const getProgressBarColor = (grade) => {
        if (!grade) return '#e2e8f0';
        if (grade.includes('A')) return '#05cd99'; 
        if (grade.includes('B')) return '#4318ff'; 
        if (grade.includes('F')) return '#ef4444'; // Red for F
        return '#f6a623';                          
    };

    // Safely calculate the progress bar percentage (Final + Midterm fallback)
    const calculateCourseProgress = (course) => {
        if (course.totalMarks) return Math.round(course.totalMarks);
        // Fallback: If your API returns midtermMarks and finalMarks separately, approximate it:
        const mid = course.midtermMarks || 0;
        const fin = course.finalMarks || 0;
        return Math.round((mid * 0.3) + (fin * 0.7)); 
    };

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content" style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', padding: '24px' }}>
                
                <div className="hero-banner">
                    <div className="hero-content">
                        <p className="greeting">Good morning,</p>
                        <h1 className="student-name">{userData.fullName}</h1>
                        <p className="degree-info">
                            {degreeProgramDisplay} • {latestAcademicYear}, {latestSemester}
                        </p>
                        
                        <div className="hero-actions">
                            <button onClick={() => navigate('/enrollment')} className="hero-btn">
                                <BookOpen size={16} /> Enroll in Courses <ChevronRight size={16} />
                            </button>
                            <button onClick={() => navigate('/grades')} className="hero-btn">
                                <Award size={16} /> View Grades <ChevronRight size={16} />
                            </button>
                            <button onClick={() => navigate('/attendance')} className="hero-btn">
                                <Calendar size={16} /> Attendance <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="hero-floating-stats">
                        <div className="floating-stat-box">
                            <h2>{isLoading ? "..." : currentGPA}</h2>
                            <p>Current GPA</p>
                        </div>
                        <div className="floating-stat-box">
                            <h2>{isLoading ? "..." : currentCredits}</h2>
                            <p>Credits</p>
                        </div>
                    </div>
                </div>

                <div className="kpi-cards-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon blue-icon"><BookOpen size={20} /></div>
                        <h2>{isLoading ? "..." : enrolledCoursesCount}</h2>
                        <p className="kpi-title">Enrolled Courses</p>
                        <p className="kpi-sub">This semester</p>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon purple-icon"><Award size={20} /></div>
                        <h2>{isLoading ? "..." : `${currentCredits}/${totalCredits}`}</h2>
                        <p className="kpi-title">Total Credits</p>
                        <p className="kpi-sub">Current / All-time</p>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon green-icon"><Calendar size={20} /></div>
                        <h2>{isLoading ? "..." : `${attendanceRate}%`}</h2> 
                        <p className="kpi-title">Attendance Rate</p>
                        <p className="kpi-sub">All courses</p>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon yellow-icon"><Star size={20} /></div>
                        <h2>{isLoading ? "..." : standing.title}</h2>
                        <p className="kpi-title">Academic Standing</p>
                        <p className="kpi-sub">{standing.sub}</p>
                    </div>
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
                    <div className="courses-section card current-courses-card">
                        <div className="section-header">
                            <h3>Current Courses</h3>
                            <span className="course-count">{recentCourses.length} courses</span>
                        </div>
                        
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading database records...</p>
                            </div>
                        ) : recentCourses.length === 0 ? (
                            <p className="empty-state">No courses found for this student.</p>
                        ) : (
                            <div className="course-list">
                                {recentCourses.map((course, index) => {
                                    const progressPct = calculateCourseProgress(course);
                                    
                                    return (
                                        <div className="course-list-item" key={index}>
                                            <div className="course-icon-wrapper">
                                                <LayoutList size={20} />
                                            </div>
                                            <div className="course-content">
                                                <div className="course-top-row">
                                                    <div className="course-title-block">
                                                        <h4>{course.courseName}</h4>
                                                        <p>{course.courseCode} • {course.credits} credits</p>
                                                    </div>
                                                    <div className={`grade-badge ${getGradeStyle(course.letterGrade)}`}>
                                                        {course.letterGrade || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="course-progress-row">
                                                    <div className="progress-bar-bg">
                                                        <div 
                                                            className="progress-bar-fill"
                                                            style={{ 
                                                                width: `${progressPct}%`,
                                                                backgroundColor: getProgressBarColor(course.letterGrade)
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-text">{progressPct}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;