import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, TrendingUp, Coins, AlertTriangle } from 'lucide-react';
import { getAdminAnalyticsDashboard } from '../services/apiService';
import './AdminAnalytics.css';
import './Dashboard.css';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAdminAnalyticsDashboard()
            .then(res => {
                setAnalytics(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics", err);
                setError("Unable to load BI models. Ensure the Python engine is running.");
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return <div className="app-layout"><Sidebar /><main className="main-content"><div style={{padding: '20px', color: '#94a3b8'}}>Running Business Intelligence models...</div></main></div>;
    if (error) return <div className="app-layout"><Sidebar /><main className="main-content"><div style={{padding: '20px', color: '#dc2626'}}>{error}</div></main></div>;
    if (!analytics) return null;

    const { forecastData, riskData } = analytics;

    // Formatting currency smartly (K for thousands, M for millions)
    const formattedRevenue = analytics.totalRevenue >= 1000000 
        ? (analytics.totalRevenue / 1000000).toFixed(1) + "M" 
        : (analytics.totalRevenue / 1000).toFixed(1) + "K";

    // --- DONUT CHART CALCULATION ---
    const lowPct = riskData.lowRiskPct;
    const medPct = riskData.medRiskPct;
    const conicString = `#00b87c 0% ${lowPct}%, #d9a000 ${lowPct}% ${lowPct + medPct}%, #e74c3c ${lowPct + medPct}% 100%`;

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content">
                <div className="analytics-header">
                    <h1>Institutional Analytics & Insights</h1>
                    <p>High-level institutional metrics, enrollment trends, and academic risk monitoring</p>
                </div>

                {/* Top KPI Cards */}
                <div className="analytics-summary-grid">
                    <div className="analytics-card">
                        <div className="analytics-icon-box icon-blue"><Users size={28} /></div>
                        <div className="analytics-details">
                            <h2>{analytics.totalStudents.toLocaleString()}</h2>
                            <p>Total Active Students</p>
                        </div>
                    </div>
                    <div className="analytics-card">
                        <div className="analytics-icon-box icon-green"><TrendingUp size={28} /></div>
                        <div className="analytics-details">
                            <h2>{analytics.avgGPA.toFixed(2)}</h2>
                            <p>Average University GPA</p>
                        </div>
                    </div>
                    <div className="analytics-card">
                        <div className="analytics-icon-box icon-yellow"><Coins size={28} /></div>
                        <div className="analytics-details">
                            <h2>LKR {formattedRevenue}</h2>
                            <p>Total Revenue (LKR)</p>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    {/* Linear Regression Forecast Model */}
                    <div className="chart-container">
                        <h3>Enrollment Forecasting</h3>
                        <p>Historical data with prediction trajectory</p>

                        <div className="forecast-visual">
                            {forecastData.map((data, index) => (
                                <div className="data-point" key={index}>
                                    <span className="data-value">{data.value}</span>
                                    <div className={`data-line ${data.type === 'historical' ? 'line-historical' : 'line-forecast'}`}></div>
                                    <span className="data-label">{data.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="forecast-legend">
                            <div className="legend-item"><div className="legend-color line-historical"></div> Historical</div>
                            <div className="legend-item"><div className="legend-color line-forecast"></div> Forecast</div>
                        </div>
                    </div>

                    {/* K-Means Clustering Risk Model */}
                    <div className="chart-container">
                        <h3 style={{ marginBottom: '4px' }}>Academic Risk Clusters</h3>
                        <p style={{ marginTop: 0, color: '#64748b', fontSize: '13px' }}>Student segmentation by academic risk level</p>

                        <div className="risk-content">
                            {/* CSS Donut Chart */}
                            <div className="donut-wrapper" style={{ background: `conic-gradient(${conicString})` }}>
                                <div className="donut-hole">
                                    <h2>{riskData.highRiskPct}%</h2>
                                    <p>High Risk</p>
                                </div>
                            </div>

                            {/* Legend Details */}
                            <div className="risk-legend">
                                <div className="risk-legend-item">
                                    <div className="risk-dot" style={{background: '#00b87c'}}></div>
                                    <div className="risk-text">
                                        <h4>Low Risk</h4>
                                        <p>{riskData.lowRiskPct}% — {riskData.lowRiskCount.toLocaleString()} students</p>
                                    </div>
                                </div>
                                <div className="risk-legend-item">
                                    <div className="risk-dot" style={{background: '#d9a000'}}></div>
                                    <div className="risk-text">
                                        <h4>Medium Risk</h4>
                                        <p>{riskData.medRiskPct}% — {riskData.medRiskCount.toLocaleString()} students</p>
                                    </div>
                                </div>
                                <div className="risk-legend-item">
                                    <div className="risk-dot" style={{background: '#e74c3c'}}></div>
                                    <div className="risk-text">
                                        <h4>High Risk</h4>
                                        <p>{riskData.highRiskPct}% — {riskData.highRiskCount.toLocaleString()} students</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Red Alert Box */}
                        <div className="alert-box">
                            <AlertTriangle size={20} color="#dc2626" style={{flexShrink: 0, marginTop: '2px'}} />
                            <div className="alert-text">
                                <strong>{riskData.highRiskPct}% of active students</strong> fall into the high-risk cluster. These students require immediate academic intervention and targeted support programs to improve retention and graduation rates.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAnalytics;