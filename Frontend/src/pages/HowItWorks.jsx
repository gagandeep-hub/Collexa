import { Link } from 'react-router-dom';
import './InfoPages.css';

const HowItWorks = () => {
    const steps = [
        {
            number: '01',
            title: 'Create Your Account',
            description: 'Sign up with your email and create your profile. It takes less than a minute to get started.',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        },
        {
            number: '02',
            title: 'List Your Items',
            description: 'Take photos of items you want to sell, add a description, set your price, and publish your listing.',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            )
        },
        {
            number: '03',
            title: 'Browse & Discover',
            description: 'Explore listings from fellow students. Filter by category, condition, and price to find what you need.',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
            )
        },
        {
            number: '04',
            title: 'Connect with Seller',
            description: 'Interested in something? Contact the seller directly to ask questions or negotiate the price.',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
            )
        },
        {
            number: '05',
            title: 'Meet & Exchange',
            description: 'Arrange a safe meetup on campus to inspect the item and complete the transaction in person.',
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
            number: '06',
            title: 'Complete the Deal',
            description: 'After a successful trade, both parties walk away happy. It\'s that simple!',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            )
        }
    ];

    return (
        <div className="info-page">
            <div className="info-hero">
                <h1>How It Works</h1>
                <p>Buying and selling on Collexa is simple, safe, and student-friendly</p>
            </div>

            <div className="steps-container">
                {steps.map((step, index) => (
                    <div key={index} className="step-card">
                        <div className="step-number">{step.number}</div>
                        <div className="step-icon-svg">{step.icon}</div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                    </div>
                ))}
            </div>

            <div className="info-cta">
                <h2>Ready to get started?</h2>
                <p>Join hundreds of students already buying and selling on Collexa</p>
                <Link to="/register" className="cta-btn">Create Account</Link>
            </div>
        </div>
    );
};

export default HowItWorks;
