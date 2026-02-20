import React, { useState, useEffect } from 'react';
import './ReservationDashboard.css';

const ReservationDashboard = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState('2026-02-07');
    const [lastUpdated, setLastUpdated] = useState(null);

    // Google Apps ScriptのウェブアプリURLを設定してください
    const GAS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // サマリーデータを取得
            const summaryResponse = await fetch(`${GAS_API_URL}?action=getSummary`);
            const summaryResult = await summaryResponse.json();

            if (summaryResult.status === 'success') {
                setSummaryData(summaryResult.data);
                setLastUpdated(new Date(summaryResult.lastUpdated));
            } else {
                throw new Error(summaryResult.message || '予約データの取得に失敗しました');
            }

            // 統計データを取得
            const statsResponse = await fetch(`${GAS_API_URL}?action=getDetailedStats`);
            const statsResult = await statsResponse.json();

            if (statsResult.status === 'success') {
                setStats(statsResult.data);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // 5分ごとに自動更新
        const interval = setInterval(fetchData, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        return `${date.getMonth() + 1}月${date.getDate()}日(${days[date.getDay()]})`;
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 100) return '#E60012'; // 満席: 赤
        if (percentage >= 70) return '#FF6B35'; // 混雑: オレンジ
        if (percentage >= 40) return '#FFC107'; // やや混雑: 黄色
        return '#4CAF50'; // 余裕あり: 緑
    };

    if (loading && !summaryData) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>予約データを読み込んでいます...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-message glass-card">
                    <h3>❌ エラーが発生しました</h3>
                    <p>{error}</p>
                    <button className="retry-button" onClick={fetchData}>
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container" id="dashboard">
            <div className="dashboard-header glass-card">
                <h1>📊 予約管理ダッシュボード</h1>
                <p className="subtitle">リアルタイム予約状況</p>

                {lastUpdated && (
                    <p className="last-updated">
                        最終更新: {lastUpdated.toLocaleString('ja-JP')}
                    </p>
                )}

                <button className="refresh-button" onClick={fetchData} disabled={loading}>
                    🔄 更新
                </button>
            </div>

            {/* 統計サマリー */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalReservations}</div>
                            <div className="stat-label">総予約数</div>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalAttendees}</div>
                            <div className="stat-label">総参加者数</div>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">🔍</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalMystery}</div>
                            <div className="stat-label">謎解き予約</div>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">🎨</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalWS}</div>
                            <div className="stat-label">WS予約</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 日付選択 */}
            <div className="date-selector glass-card">
                <button
                    className={`date-button ${selectedDate === '2026-02-07' ? 'active' : ''}`}
                    onClick={() => setSelectedDate('2026-02-07')}
                >
                    {formatDate('2026-02-07')}
                </button>
                <button
                    className={`date-button ${selectedDate === '2026-02-14' ? 'active' : ''}`}
                    onClick={() => setSelectedDate('2026-02-14')}
                >
                    {formatDate('2026-02-14')}
                </button>
            </div>

            {/* 時間帯別予約状況 */}
            {summaryData && summaryData[selectedDate] && (
                <div className="timeslots-container">
                    <h2 className="section-title">時間帯別予約状況</h2>

                    <div className="timeslots-grid">
                        {Object.entries(summaryData[selectedDate]).map(([time, courses]) => (
                            <div key={time} className="timeslot-card glass-card">
                                <h3 className="timeslot-time">🕐 {time}</h3>

                                {/* 謎解き */}
                                <div className="course-section">
                                    <div className="course-header">
                                        <span className="course-name">🔍 謎解き本編</span>
                                        <span className="course-count">
                                            {courses.mystery.count} / {courses.mystery.capacity}
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${courses.mystery.percentage}%`,
                                                backgroundColor: getStatusColor(courses.mystery.percentage)
                                            }}
                                        ></div>
                                    </div>
                                    <div className="remaining-info">
                                        残り: <strong>{courses.mystery.remaining}組</strong>
                                        {courses.mystery.percentage >= 100 && (
                                            <span className="full-badge">満席</span>
                                        )}
                                    </div>
                                </div>

                                {/* WS */}
                                <div className="course-section">
                                    <div className="course-header">
                                        <span className="course-name">🎨 村上なつかWS</span>
                                        <span className="course-count">
                                            {courses.ws.count} / {courses.ws.capacity}
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${courses.ws.percentage}%`,
                                                backgroundColor: getStatusColor(courses.ws.percentage)
                                            }}
                                        ></div>
                                    </div>
                                    <div className="remaining-info">
                                        残り: <strong>{courses.ws.remaining}組</strong>
                                        {courses.ws.percentage >= 100 && (
                                            <span className="full-badge">満席</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationDashboard;
