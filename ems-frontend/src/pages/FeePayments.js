import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { recordFeePayment, enrollStudent, getPaymentHash, getStudentPayments, getStudentSummary } from '../services/apiService'; 
import './FeePayments.css';
import './Dashboard.css';

const FeePayments = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const pendingCourse = location.state?.pendingCourse || null;
    const amountDue = location.state?.feeAmount || '';
    const customMessage = location.state?.message || '';

    const [amount, setAmount] = useState(amountDue);
    const [method, setMethod] = useState('Online');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const [paymentHistory, setPaymentHistory] = useState([]);
    const [totalPaid, setTotalPaid] = useState(0);

    // --- Secure User Data Extraction ---
    const userStr = localStorage.getItem('nexusUser');
    const userData = userStr ? JSON.parse(userStr) : null;
    
    // Safely check for the ID regardless of how the login API formats it
    const activeUserId = userData ? (userData.userId || userData.id || userData.UserId) : null;

    useEffect(() => {
        if (!activeUserId) {
            showPopup('error', 'User session not found. Please log in again.');
            return;
        }
        fetchHistoryAndSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeUserId]);

    const fetchHistoryAndSummary = () => {
        // Fetch the list of past payments
        getStudentPayments(activeUserId)
            .then(res => setPaymentHistory(res.data))
            .catch(err => console.error("Failed to fetch payment history", err));

        // Fetch the exact mathematical summary for Total Paid
        getStudentSummary(activeUserId)
            .then(res => {
                setTotalPaid(res.data.totalPaid || 0);
            })
            .catch(err => console.error("Failed to fetch financial summary", err));
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://www.payhere.lk/lib/payhere.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const showPopup = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!activeUserId) {
            showPopup('error', "Cannot process payment: No active user session.");
            return;
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            showPopup('error', "Please enter a valid payment amount.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await getPaymentHash(parseFloat(amount), 'LKR');
            const { merchantId, orderId, hash, formattedAmount } = response.data;

            const fullName = userData?.fullName || "Student";

            // --- Dynamic Payload for PayHere ---
            const payment = {
                sandbox: true,
                merchant_id: merchantId,
                return_url: "http://localhost:3000/fees",
                cancel_url: "http://localhost:3000/fees",
                notify_url: "http://localhost:8080/api/payments/notify", 
                order_id: orderId,
                items: pendingCourse ? `Enrollment: ${pendingCourse.courseCode}` : "Semester Fees",
                amount: formattedAmount,
                currency: "LKR",
                hash: hash,
                first_name: fullName.split(' ')[0] || "N/A",
                last_name: fullName.split(' ')[1] || "N/A",
                email: userData?.email || "N/A",
                phone: userData?.phone || "N/A",
                address: userData?.address || "N/A",
                city: userData?.city || "N/A",
                country: userData?.country || "Sri Lanka",
            };

            window.payhere.onCompleted = function onCompleted(orderId) {
                processFinalDatabaseUpdate(orderId);
            };

            window.payhere.onDismissed = function onDismissed() {
                showPopup('error', "Payment was cancelled. Enrollment halted.");
                setIsSubmitting(false);
            };

            window.payhere.onError = function onError(error) {
                showPopup('error', "Payment Error: " + error);
                setIsSubmitting(false);
            };

            if (window.payhere) {
                window.payhere.startPayment(payment);
            } else {
                showPopup('error', "Payment gateway is still loading. Please try again in a few seconds.");
                setIsSubmitting(false);
            }

        } catch (error) {
            showPopup('error', "Failed to connect to secure payment server.");
            setIsSubmitting(false);
        }
    };

    const processFinalDatabaseUpdate = (transactionId) => {
        // --- FIXED: Use paymentMethod so Spring Boot understands it ---
        const paymentPayload = {
            studentId: activeUserId,
            amount: parseFloat(amount),
            paymentMethod: method 
        };

        recordFeePayment(paymentPayload)
            .then(() => {
                if (pendingCourse) {
                    const enrollmentPayload = {
                        studentId: activeUserId,
                        courseId: pendingCourse.courseId,
                        academicYear: pendingCourse.academicYear,
                        semester: pendingCourse.semester,
                        facultyId: pendingCourse.facultyId || 1 
                    };

                    return enrollStudent(enrollmentPayload)
                        .then(() => {
                            showPopup('success', `Transaction ${transactionId} cleared! Enrolled in ${pendingCourse.courseCode}.`);
                            setAmount('');
                            setIsSubmitting(false);
                            fetchHistoryAndSummary(); 
                            setTimeout(() => { navigate('/enrollment', { replace: true }); }, 3000);
                        });
                } else {
                    showPopup('success', `Payment of LKR ${amount} Successful. TXN ID: ${transactionId}`);
                    setAmount('');
                    setIsSubmitting(false);
                    fetchHistoryAndSummary(); 
                }
            })
            .catch(error => {
                showPopup('error', "Database Error: " + (error.response?.data?.message || "Failed to finalize."));
                setIsSubmitting(false);
            });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="app-layout">
            <Sidebar />

            {notification.show && (
                <div className={`toast-notification toast-${notification.type}`} style={{ position: 'fixed', top: '32px', right: '32px', zIndex: 3000, padding: '16px 24px', borderRadius: '12px', color: 'white', display: 'flex', gap: '12px', alignItems: 'flex-start', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}
            
            <main className="main-content">
                <div className="fee-header">
                    <h1>Fee Management & Payments</h1>
                    <p>View payment history and settle outstanding fees</p>
                </div>

                <div className="fee-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <div className="fee-card">
                        <div className="fee-icon-box" style={{background: '#05cd99'}}><CheckCircle size={24} /></div>
                        <div className="fee-details">
                            <h2>LKR {totalPaid.toLocaleString()}</h2>
                            <p>Total Amount Paid</p>
                        </div>
                    </div>
                </div>

                <div className="fee-layout">
                    <div className="history-container">
                        <h3>Payment History</h3>
                        <p>All fee payments pulled from your verified records</p>
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount (LKR)</th>
                                    <th>Method</th>
                                    <th>Transaction ID</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.length === 0 ? (
                                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#a3aed0'}}>No payment records found.</td></tr>
                                ) : (
                                    paymentHistory.map((record, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(record.paymentDate)}</td>
                                            <td className="amount-cell">{record.amount?.toLocaleString()}</td>
                                            {/* FIXED: Uses lowercase and provides a fallback for old records */}
                                            <td>{record.paymentMethod || 'Online'}</td>
                                            <td><span style={{color: '#a3aed0', fontSize: '12px'}}>TXN-{record.paymentId}</span></td>
                                            <td>
                                                <span className={`status-pill ${record.status === 'Paid' ? 'pill-paid' : 'pill-pending'}`}>
                                                    {record.status || 'Paid'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pendingCourse ? (
                        <div className="payment-form-container">
                            <h3>Make a Payment</h3>
                            <p>Pay your outstanding fees securely</p>

                            <div style={{ background: '#fff8e1', border: '1px solid #f6a623', padding: '16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <AlertCircle size={24} color="#f6a623" style={{ flexShrink: 0 }} />
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', color: '#b27300', fontSize: '14px' }}>Enrollment Hold</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#2b3674', lineHeight: 1.5 }}>
                                        {customMessage}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Amount (LKR)</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        placeholder="Enter amount in LKR" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        readOnly={true} 
                                        style={{ backgroundColor: '#f4f7fe', color: '#a3aed0', cursor: 'not-allowed' }}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Payment Method</label>
                                    <select 
                                        className="form-input"
                                        value={method}
                                        disabled 
                                        style={{ backgroundColor: '#f4f7fe', cursor: 'not-allowed' }}
                                    >
                                        <option value="Online">PayHere (Credit/Debit Card)</option>
                                    </select>
                                </div>

                                <button 
                                    type="submit" 
                                    className="pay-btn"
                                    style={{ background: '#05cd99' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : 'Pay & Confirm Enrollment'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="payment-form-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', backgroundColor: '#f4f7fe', border: '2px dashed #e2e8f0', boxShadow: 'none' }}>
                            <CheckCircle size={48} color="#05cd99" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: '#2b3674', marginBottom: '8px' }}>No Pending Payments</h3>
                            <p style={{ color: '#a3aed0', fontSize: '14px', lineHeight: '1.5' }}>
                                Your account is up to date. To enroll in a new module, please navigate to the Course Enrollment catalog.
                            </p>
                            <button 
                                onClick={() => navigate('/enrollment')} 
                                className="pay-btn" 
                                style={{ marginTop: '20px', background: '#4318ff' }}
                            >
                                Go to Course Enrollment
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FeePayments;