import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Database, Zap, User, FileText, CheckCircle2 } from 'lucide-react';
import { getSystemAuditLogs } from '../services/apiService';
import './AuditLog.css';
import './Dashboard.css';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter States
    const [filterTable, setFilterTable] = useState('All Tables');
    const [filterAction, setFilterAction] = useState('All Actions');

    // Trigger API call on mount and whenever filters change
    useEffect(() => {
        fetchAuditLogs();
    }, [filterTable, filterAction]);

    const fetchAuditLogs = async () => {
        setIsLoading(true);
        try {
            const response = await getSystemAuditLogs(filterTable, filterAction);
            setLogs(response.data);
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getActionClass = (action) => {
        switch(action) {
            case 'UPDATE': return 'action-update';
            case 'INSERT': return 'action-insert';
            case 'DELETE': return 'action-delete';
            default: return '';
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content">
                <div className="audit-header">
                    <h1>Security & Database Audit Log</h1>
                    <p>Comprehensive oversight of all system-level data mutations across the university database</p>
                </div>

                {/* Filter Controls */}
                <div className="audit-filters">
                    <div className="audit-filter-group">
                        <label>Select Table</label>
                        <div className="audit-select-wrapper">
                            <Database size={16} className="audit-select-icon" />
                            <select 
                                className="audit-select"
                                value={filterTable}
                                onChange={(e) => setFilterTable(e.target.value)}
                            >
                                <option>All Tables</option>
                                <option>Student</option>
                                <option>Enrollment</option>
                                <option>Grade</option>
                                <option>FeePayment</option>
                            </select>
                        </div>
                    </div>
                    <div className="audit-filter-group">
                        <label>Action Type</label>
                        <div className="audit-select-wrapper">
                            <Zap size={16} className="audit-select-icon" />
                            <select 
                                className="audit-select"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            >
                                <option>All Actions</option>
                                <option>INSERT</option>
                                <option>UPDATE</option>
                                <option>DELETE</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="audit-container">
                    <div className="audit-container-header">
                        <div className="audit-icon-box">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3>Database Mutation Log</h3>
                            <p>Real-time audit trail of all INSERT, UPDATE, and DELETE operations</p>
                        </div>
                    </div>

                    <div className="audit-meta-bar">
                        <span>Showing <strong>{logs.length}</strong> {logs.length === 20 ? '(Max 20)' : ''} log entries</span>
                        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <CheckCircle2 size={14} color="#05cd99" /> All actions are logged and auditable
                        </span>
                    </div>

                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            Loading secure audit logs...
                        </div>
                    ) : logs.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            No audit logs match your selected filters.
                        </div>
                    ) : (
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Performed By</th>
                                    <th>Action</th>
                                    <th>Affected Table</th>
                                    <th>Record ID</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="timestamp-cell">{log.timestamp}</td>
                                        <td>
                                            <div className="user-cell">
                                                <User size={14} color="#a3aed0" />
                                                {log.user}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`action-pill ${getActionClass(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="affected-table-badge">{log.table}</span>
                                        </td>
                                        <td className="record-id-cell">{log.recordId}</td>
                                        <td>{log.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuditLog;