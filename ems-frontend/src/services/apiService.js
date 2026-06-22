import axios from 'axios';

// This is the base URL of your Spring Boot server
const BASE_URL = 'http://localhost:8080/api';

// We create an Axios instance with default settings
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ==========================================
// CENTRALIZED API CALLS
// ==========================================

// Fetch standard dashboard metrics (from SQL Server)
export const getDashboardMetrics = () => apiClient.get('/dashboard');

// Submit a new course enrollment
export const enrollStudent = (enrollmentData) => apiClient.post('/enrollments', enrollmentData);

// Submit a fee payment
export const recordFeePayment = (paymentData) => apiClient.post('/fees', paymentData);

// Authentication API
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);

// User Management API
export const getAllUsers = () => apiClient.get('/users');
export const createNewUser = (userData) => apiClient.post('/users/create', userData);
export const updateUser = (id, userData) => apiClient.put(`/users/${id}`, userData); 
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);          

// Change password
export const changeUserPassword = (data) => apiClient.post('/users/change-password', data);

// Course Management API
export const getAllCourses = () => apiClient.get('/courses');
export const createCourse = (courseData) => apiClient.post('/courses/create', courseData);
export const updateCourse = (id, courseData) => apiClient.put(`/courses/${id}`, courseData);
export const deleteCourse = (id) => apiClient.delete(`/courses/${id}`);

// Course Enrollment Management
export const getEnrolledStudents = (courseId) => apiClient.get(`/courses/${courseId}/students`);
export const removeStudentFromCourse = (courseId, userId) => apiClient.delete(`/courses/${courseId}/students/${userId}`);
export const removeAllStudentsFromCourse = (courseId) => apiClient.delete(`/courses/${courseId}/students/clear-all`);

// Payment Gateway API
export const getPaymentHash = (amount, currency = 'LKR') => 
    apiClient.get(`/payments/generate-hash?amount=${amount}&currency=${currency}`);

// Fetch Payment History (Routing mapped to /fees)
export const getStudentPayments = (studentId) => 
    apiClient.get(`/fees/student/${studentId}`);

// Fetch Financial Summary (Routing mapped to /fees)
export const getStudentSummary = (studentId) => 
    apiClient.get(`/fees/summary/${studentId}`);

// --- Grade Management API ---

// 1. Fetch the student roster for a specific course
export const getCourseRoster = (courseId, academicYear, semester) => 
    apiClient.get(`/grades/roster?courseId=${courseId}&academicYear=${academicYear}&semester=${semester}`);

// 2. Save the entered grades back to the database
export const saveCourseGrades = (gradesPayload) => 
    apiClient.post(`/grades/save`, gradesPayload);

// 3. Fetch unique faculty assignments for the filter dropdowns
export const getFacultyAssignments = (facultyId) => 
    apiClient.get(`/grades/assignments/${facultyId}`);

// 4. Fetch a specific student's report card
export const getStudentReportCard = (studentId) => 
    apiClient.get(`/grades/report/${studentId}`);

// --- Attendance Management API ---
export const getAttendanceRoster = (courseId, date, academicYear, semester) => 
    apiClient.get(`/attendance/roster?courseId=${courseId}&date=${date}&academicYear=${academicYear}&semester=${semester}`);

export const saveAttendanceRecords = (payload) => 
    apiClient.post(`/attendance/save`, payload);

// Fetch a specific student's attendance history
export const getStudentAttendance = (studentId) => 
    apiClient.get(`/attendance/student/${studentId}`);

// --- Course Allocation Management API ---
export const getCourseAllocations = () => apiClient.get('/courses/allocations');
export const getAvailableLecturers = () => apiClient.get('/courses/lecturers');
export const assignLecturerToCourse = (payload) => apiClient.post('/courses/assign-lecturer', payload);

// --- Student Profile API ---
export const getStudentProfile = (studentId) => apiClient.get(`/students/profile/${studentId}`);

// --- Analytics API ---
// Fetch Python Business Intelligence forecasts & SQL Metrics
export const getAdminAnalyticsDashboard = () => apiClient.get('/analytics/dashboard');

// --- Audit Log API ---
export const getSystemAuditLogs = (table, action) => {
    let url = `/audit-logs?`;
    if (table) url += `table=${encodeURIComponent(table)}&`;
    if (action) url += `action=${encodeURIComponent(action)}`;
    return apiClient.get(url);
};

export default apiClient;