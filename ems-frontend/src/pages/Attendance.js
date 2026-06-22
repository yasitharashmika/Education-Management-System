import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStudentAttendance } from '../services/apiService';
import './Attendance.css';
import './Dashboard.css';

const Attendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [viewDate, setViewDate] = useState(new Date());

    const userStr = localStorage.getItem('nexusUser');
    const userData = userStr ? JSON.parse(userStr) : null;
    const studentId = userData ? userData.userId : null;

    useEffect(() => {
        if (studentId) {
            fetchAttendance();
        } else {
            setError("No student ID found. Please log in again.");
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    const fetchAttendance = async () => {
        try {
            const response = await getStudentAttendance(studentId);
            
            const formattedData = response.data.map(dbRecord => {
                const dateObj = new Date(dbRecord.attendanceDate);
                const statusLower = dbRecord.status ? dbRecord.status.toLowerCase() : 'empty';
                
                return {
                    rawDate: dateObj,
                    date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
                    code: dbRecord.courseCode,
                    name: dbRecord.courseName,
                    statusLower: statusLower,
                };
            });
            
            setAttendanceRecords(formattedData);
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching attendance data", err);
            setError("Failed to load attendance records from the database.");
            setIsLoading(false);
        }
    };

    // --- 1. Calendar View Variables ---
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    const handlePrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

    // --- 2. Monthly Statistics Calculation (Dynamically filtered by current viewDate) ---
    const monthlyRecords = attendanceRecords.filter(record => 
        record.rawDate.getMonth() === viewMonth && 
        record.rawDate.getFullYear() === viewYear
    );

    const stats = { present: 0, absent: 0, late: 0, total: monthlyRecords.length };
    monthlyRecords.forEach(record => {
        if (record.statusLower === 'present') stats.present++;
        if (record.statusLower === 'absent') stats.absent++;
        if (record.statusLower === 'late') stats.late++;
    });

    const attendanceRate = stats.total > 0 
        ? (((stats.present + stats.late) / stats.total) * 100).toFixed(1) 
        : "0.0";

    // --- 3. Course-by-Course Percentage Calculation (All-time overall performance) ---
    const courseStats = {};
    attendanceRecords.forEach(record => {
        if (!courseStats[record.code]) {
            courseStats[record.code] = {
                code: record.code,
                name: record.name,
                total: 0,
                present: 0,
                absent: 0,
                late: 0
            };
        }
        courseStats[record.code].total++;
        if (record.statusLower === 'present') courseStats[record.code].present++;
        if (record.statusLower === 'absent') courseStats[record.code].absent++;
        if (record.statusLower === 'late') courseStats[record.code].late++;
    });

    // Convert object to array and calculate percentages
    const courseSummaryArray = Object.values(courseStats).map(course => {
        const attended = course.present + course.late; // Assuming 'late' counts as attended
        const percentage = course.total > 0 ? ((attended / course.total) * 100).toFixed(1) : "0.0";
        return { ...course, percentage };
    });

    // --- 4. Dynamic Calendar Generation ---
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const record = monthlyRecords.find(r => r.rawDate.getDate() === day);
        
        if (record) {
            return { date: day, course: record.code, status: record.statusLower };
        }
        return { date: day, course: '', status: 'empty' };
    });

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content">
                <div className="attendance-header">
                    <h1>Attendance Management</h1>
                    <p>Monitor your class attendance and track participation across all courses</p>
                </div>

                {error ? (
                    <div style={{ padding: '20px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                ) : isLoading ? (
                    <div style={{ padding: '20px', color: '#94a3b8' }}>Loading secure database records...</div>
                ) : (
                    <>
                        {/* Top Summary Cards (Now correctly scoped to the month) */}
                        <div className="attendance-summary-grid">
                            <div className="attendance-card main-card">
                                <div className="circular-progress">
                                    <svg viewBox="0 0 100 100">
                                        <circle className="progress-bg" cx="50" cy="50" r="45"></circle>
                                        <circle className="progress-value" cx="50" cy="50" r="45" strokeDasharray={`${attendanceRate * 2.82} 282`}></circle>
                                    </svg>
                                    <div className="progress-text">
                                        <h2>{attendanceRate}%</h2>
                                        <p>Attendance</p>
                                    </div>
                                </div>
                                {/* Updated text to dynamically show the month and year */}
                                <p style={{fontSize: '11px', color: '#a3aed0'}}>Attendance rate for {monthName} {viewYear}</p>
                            </div>

                            <div className="attendance-card">
                                <div className="stat-header">
                                    <div className="icon-box-small" style={{background: '#4318ff'}}><Calendar size={18} /></div>
                                </div>
                                <div className="stat-value">
                                    <h2>{stats.total}</h2>
                                    <p>Total Classes</p>
                                </div>
                            </div>

                            <div className="attendance-card">
                                <div className="stat-header">
                                    <div className="icon-box-small" style={{background: '#05cd99'}}><CheckCircle size={18} /></div>
                                </div>
                                <div className="stat-value">
                                    <h2>{stats.present}</h2>
                                    <p>Present</p>
                                </div>
                            </div>

                            <div className="attendance-card">
                                <div className="stat-header">
                                    <div className="icon-box-small" style={{background: '#ee5d50'}}><XCircle size={18} /></div>
                                </div>
                                <div className="stat-value">
                                    <h2>{stats.absent}</h2>
                                    <p>Absent</p>
                                </div>
                            </div>

                            <div className="attendance-card">
                                <div className="stat-header">
                                    <div className="icon-box-small" style={{background: '#ffb547'}}><Clock size={18} /></div>
                                </div>
                                <div className="stat-value">
                                    <h2>{stats.late}</h2>
                                    <p>Late</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Calendar Grid */}
                        <div className="calendar-container">
                            <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <button onClick={handlePrevMonth} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        <ChevronLeft size={20} color="#475569" />
                                    </button>
                                    <h3 style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>{monthName} {viewYear}</h3>
                                    <button onClick={handleNextMonth} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        <ChevronRight size={20} color="#475569" />
                                    </button>
                                </div>

                                <div className="calendar-legend">
                                    <div className="legend-item"><div className="legend-color status-present"></div> Present</div>
                                    <div className="legend-item"><div className="legend-color status-absent"></div> Absent</div>
                                    <div className="legend-item"><div className="legend-color status-late"></div> Late</div>
                                    <div className="legend-item"><div className="legend-color status-excused"></div> Excused</div>
                                </div>
                            </div>

                            <div className="calendar-grid">
                                <div className="weekday-header">Mon</div>
                                <div className="weekday-header">Tue</div>
                                <div className="weekday-header">Wed</div>
                                <div className="weekday-header">Thu</div>
                                <div className="weekday-header">Fri</div>
                                <div className="weekday-header">Sat</div>
                                <div className="weekday-header">Sun</div>

                                {calendarDays.map((day, idx) => (
                                    <div key={idx} className={`calendar-day status-${day.status}`}>
                                        <span className="day-number">{day.date}</span>
                                        {day.course && <span className="day-course">{day.course}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course-by-Course Percentage Summary */}
                        <div className="records-container">
                            <h3>Course Attendance Overview</h3>
                            <p>Your calculated attendance percentages for each enrolled module (All-Time)</p>
                            
                            {courseSummaryArray.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', marginTop: '15px' }}>
                                    No attendance records found for your enrollments.
                                </div>
                            ) : (
                                <table className="records-table">
                                    <thead>
                                        <tr>
                                            <th>Course Code</th>
                                            <th>Course Name</th>
                                            <th style={{textAlign: 'center'}}>Present</th>
                                            <th style={{textAlign: 'center'}}>Absent</th>
                                            <th style={{textAlign: 'center'}}>Late</th>
                                            <th style={{width: '200px'}}>Attendance Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseSummaryArray.map((course, index) => (
                                            <tr key={index}>
                                                <td><span className="course-code-badge">{course.code}</span></td>
                                                <td>{course.name}</td>
                                                <td style={{textAlign: 'center', color: '#10b981', fontWeight: '600'}}>{course.present}</td>
                                                <td style={{textAlign: 'center', color: '#ef4444', fontWeight: '600'}}>{course.absent}</td>
                                                <td style={{textAlign: 'center', color: '#f59e0b', fontWeight: '600'}}>{course.late}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                            {/* Color changes dynamically based on the percentage */}
                                                            <div style={{ 
                                                                height: '100%', 
                                                                width: `${course.percentage}%`, 
                                                                backgroundColor: course.percentage >= 80 ? '#10b981' : course.percentage >= 60 ? '#f59e0b' : '#ef4444',
                                                                transition: 'width 0.5s ease-in-out'
                                                            }}></div>
                                                        </div>
                                                        <span style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b', minWidth: '45px' }}>
                                                            {course.percentage}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Attendance;