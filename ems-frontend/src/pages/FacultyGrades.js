import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { LineChart, Flag, Award, Medal } from 'lucide-react';
import { getStudentReportCard } from '../services/apiService';
import './Grades.css';
import './Dashboard.css'; 

const Grades = () => {
    const [reportData, setReportData] = useState([]);
    const [availableTabs, setAvailableTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // --- Secure User Data Extraction ---
    const userStr = localStorage.getItem('nexusUser');
    const userData = userStr ? JSON.parse(userStr) : null;
    const activeUserId = userData ? (userData.userId || userData.id || userData.UserId) : null;

    useEffect(() => {
        const fetchReportCard = () => {
            setIsLoading(true);
            getStudentReportCard(activeUserId)
                .then(res => {
                    const data = res.data || [];
                    setReportData(data);
                    
                    // Extract unique Semester groupings (e.g., "Year 1 - Semester 1")
                    const uniqueSemesters = [...new Set(data.map(d => `${d.academicYear} - ${d.semester}`))];
                    setAvailableTabs(uniqueSemesters);
                    
                    if (uniqueSemesters.length > 0) {
                        setActiveTab(uniqueSemesters[0]); // Default to the first available semester
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch report card", err);
                    setIsLoading(false);
                });
        };

        if (activeUserId) {
            fetchReportCard();
        } else {
            setIsLoading(false);
        }
    }, [activeUserId]);

    // --- Dynamic Filters & GPA Calculations ---
    const currentTabRecords = reportData.filter(d => `${d.academicYear} - ${d.semester}` === activeTab);
    const totalCreditsEarned = reportData.reduce((sum, d) => sum + d.credits, 0);

    const calculateGPA = (records) => {
        if (records.length === 0) return "0.00";
        const totalPoints = records.reduce((sum, d) => sum + (d.gpaPoints * d.credits), 0);
        const totalCredits = records.reduce((sum, d) => sum + d.credits, 0);
        return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
    };

    const cumulativeGPA = calculateGPA(reportData);
    const currentSemGPA = calculateGPA(currentTabRecords);

    // Dynamic Styling Helpers based on the database Letter Grade
    const getPillClass = (grade) => {
        if (!grade) return 'pill-f';
        if (grade.includes('A')) return grade === 'A+' ? 'pill-aplus' : (grade === 'A' ? 'pill-a' : 'pill-aminus');
        if (grade.includes('B')) return 'pill-b';
        if (grade.includes('C')) return 'pill-c'; 
        return 'pill-f';
    };

    const getColorClass = (grade) => {
        if (!grade) return 'total-orange';
        if (grade.includes('A')) return 'total-green';
        if (grade.includes('B')) return 'total-blue';
        return 'total-orange';
    };

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content">
                <div className="grades-header">
                    <h1>Grades & Academic Performance</h1>
                    <p>Track your academic progress across all semesters</p>
                </div>

                {/* Top Summary Cards */}
                <div className="summary-stats-container">
                    <div className="stat-card">
                        <div className="stat-icon-box icon-blue"><LineChart size={24} /></div>
                        <div className="stat-details">
                            <h2>{cumulativeGPA}</h2>
                            <p>Cumulative GPA</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-box icon-green"><Flag size={24} /></div>
                        <div className="stat-details">
                            <h2>{currentSemGPA}</h2>
                            <p>Current Sem GPA</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-box icon-orange"><Award size={24} /></div>
                        <div className="stat-details">
                            <h2>{totalCreditsEarned}</h2>
                            <p>Credits Earned</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-box icon-blue"><Medal size={24} /></div>
                        <div className="stat-details">
                            <h2>{parseFloat(cumulativeGPA) >= 3.5 ? 'Honours' : 'Good'}</h2>
                            <p>Academic Standing</p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Semester Tabs */}
                <div className="semester-tabs">
                    {availableTabs.length === 0 ? (
                        <p style={{ color: '#a3aed0' }}>No academic records found.</p>
                    ) : (
                        availableTabs.map((tab, index) => {
                            const tabRecords = reportData.filter(d => `${d.academicYear} - ${d.semester}` === tab);
                            const tabGPA = calculateGPA(tabRecords);
                            return (
                                <button 
                                    key={index}
                                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab} <span>GPA {tabGPA}</span>
                                </button>
                            )
                        })
                    )}
                </div>

                {/* Dynamic Data Table */}
                <div className="table-container">
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Credits</th>
                                <th>Midterm</th>
                                <th>Finals</th>
                                <th>Total %</th>
                                <th>Grade</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#a3aed0'}}>Loading academic records...</td></tr>
                            ) : currentTabRecords.length === 0 ? (
                                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#a3aed0'}}>No grades posted for this semester.</td></tr>
                            ) : (
                                currentTabRecords.map((course, index) => (
                                    <tr key={index}>
                                        <td className="course-name-cell">
                                            <h4>{course.courseName}</h4>
                                            <p>{course.courseCode}</p>
                                        </td>
                                        <td className="numeric-cell">{course.credits}</td>
                                        <td className="numeric-cell">{course.midtermMarks}</td>
                                        <td className="numeric-cell">{course.finalMarks}</td>
                                        <td className={`numeric-cell total-pct ${getColorClass(course.letterGrade)}`}>{course.totalMarks}%</td>
                                        <td>
                                            <span className={`grade-pill ${getPillClass(course.letterGrade)}`}>{course.letterGrade}</span>
                                        </td>
                                        <td className="numeric-cell">{course.gpaPoints.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Grading Scale Legend */}
                <div className="reference-card">
                    <h3>Grading Scale Reference</h3>
                    <div className="legend-grid">
                        <div className="legend-item"><div className="dot" style={{background: '#05cd99'}}></div> <strong>A+</strong> 85-100% GP: 4.00</div>
                        <div className="legend-item"><div className="dot" style={{background: '#05cd99'}}></div> <strong>A</strong> 80-84% GP: 4.00</div>
                        <div className="legend-item"><div className="dot" style={{background: '#03906b'}}></div> <strong>A-</strong> 75-79% GP: 3.70</div>
                        <div className="legend-item"><div className="dot" style={{background: '#4318ff'}}></div> <strong>B+</strong> 70-74% GP: 3.30</div>
                        <div className="legend-item"><div className="dot" style={{background: '#3b82f6'}}></div> <strong>B</strong> 65-69% GP: 3.00</div>
                        <div className="legend-item"><div className="dot" style={{background: '#ffb547'}}></div> <strong>B-</strong> 60-64% GP: 2.70</div>
                        <div className="legend-item"><div className="dot" style={{background: '#f6a623'}}></div> <strong>C+</strong> 55-59% GP: 2.30</div>
                        <div className="legend-item"><div className="dot" style={{background: '#fcd34d'}}></div> <strong>C</strong> 50-54% GP: 2.00</div>
                        <div className="legend-item"><div className="dot" style={{background: '#ee5d50'}}></div> <strong>F</strong> 0-49% GP: 0.00</div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Grades;