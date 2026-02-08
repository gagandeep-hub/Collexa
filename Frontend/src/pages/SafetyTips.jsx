import './InfoPages.css';

const SafetyTips = () => {
    const tips = [
        {
            title: 'Meet in Public Places',
            description: 'Always meet in well-lit, public areas on campus like the library, cafeteria, or student center. Avoid secluded locations.',
            color: '#10b981',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            )
        },
        {
            title: 'Bring a Friend',
            description: 'For high-value items, consider bringing a friend along. There is safety in numbers.',
            color: '#3b82f6',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        },
        {
            title: 'Inspect Before Buying',
            description: 'Always inspect items thoroughly before completing the purchase. Test electronics to ensure they work.',
            color: '#8b5cf6',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
            )
        },
        {
            title: 'Trust Your Instincts',
            description: 'If something feels off about a deal or a person, walk away. Your safety is more important than any item.',
            color: '#ef4444',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            )
        },
        {
            title: 'Document Everything',
            description: 'Take screenshots of listings and conversations. For expensive items, consider getting a receipt.',
            color: '#84cc16',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            )
        },
        {
            title: 'Report Suspicious Activity',
            description: 'If you encounter fraudulent listings or suspicious users, report them immediately to help keep our community safe.',
            color: '#f97316',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
            )
        }
    ];

    return (
        <div className="info-page">
            <div className="info-hero safety-hero">
                <h1>Safety Tips</h1>
                <p>Your safety is our priority. Follow these guidelines for secure transactions</p>
            </div>

            <div className="tips-grid">
                {tips.map((tip, index) => (
                    <div key={index} className="tip-card">
                        <div className="tip-icon-svg" style={{ background: `${tip.color}15` }}>
                            <span style={{ color: tip.color }}>{tip.icon}</span>
                        </div>
                        <h3>{tip.title}</h3>
                        <p>{tip.description}</p>
                    </div>
                ))}
            </div>

            <div className="safety-reminder">
                <div className="reminder-icon">🛡️</div>
                <h3>Remember</h3>
                <p>Collexa is a platform to connect students. We do not handle payments or shipping.
                    All transactions are between users, so please exercise caution and follow these safety guidelines.</p>
            </div>
        </div>
    );
};

export default SafetyTips;
