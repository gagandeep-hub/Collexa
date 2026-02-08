import { useState } from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const FAQs = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            category: 'General',
            questions: [
                {
                    q: 'What is Collexa?',
                    a: 'Collexa is a campus marketplace where students can buy and sell pre-owned items like books, electronics, furniture, and more within their college community.'
                },
                {
                    q: 'Is Collexa free to use?',
                    a: 'Yes! Collexa is completely free for students. There are no listing fees or commission charges on sales.'
                },
                {
                    q: 'Who can use Collexa?',
                    a: 'Collexa is designed for college students. Anyone with a valid email can create an account and start buying or selling.'
                }
            ]
        },
        {
            category: 'Buying',
            questions: [
                {
                    q: 'How do I buy an item?',
                    a: 'Browse listings, find something you like, and contact the seller through the platform. Arrange a meetup on campus to inspect the item and complete the purchase.'
                },
                {
                    q: 'Can I negotiate the price?',
                    a: 'Yes! You can message the seller to negotiate. Most student sellers are open to reasonable offers.'
                },
                {
                    q: 'What payment methods are accepted?',
                    a: 'Collexa does not handle payments. Transactions are done directly between buyers and sellers, typically in cash or UPI during meetups.'
                }
            ]
        },
        {
            category: 'Selling',
            questions: [
                {
                    q: 'How do I list an item for sale?',
                    a: 'Log in to your account, click "Sell Your Items," fill in the details, upload photos, set your price, and publish your listing.'
                },
                {
                    q: 'How many items can I list?',
                    a: 'There is no limit! You can list as many items as you want to sell.'
                },
                {
                    q: 'How do I price my items?',
                    a: 'Check similar listings for reference. Generally, used items sell for 30-70% of their original price depending on condition.'
                }
            ]
        },
        {
            category: 'Safety & Trust',
            questions: [
                {
                    q: 'Is it safe to meet strangers?',
                    a: 'Always meet in public places on campus during daylight hours. Bring a friend for high-value transactions. Trust your instincts—if something feels wrong, walk away.'
                },
                {
                    q: 'What if I get scammed?',
                    a: 'Report the user immediately through our platform. While we cannot guarantee refunds, we take fraud seriously and will ban scammers.'
                },
                {
                    q: 'How do I report a suspicious listing?',
                    a: 'Click the "Report" button on any listing or contact us through the Contact page with details about the suspicious activity.'
                }
            ]
        },
        {
            category: 'Account',
            questions: [
                {
                    q: 'How do I delete my account?',
                    a: 'Contact us through the Contact page with your account email, and we will process your deletion request within 48 hours.'
                },
                {
                    q: 'I forgot my password. What do I do?',
                    a: 'Click "Forgot Password" on the login page and follow the instructions to reset your password via email.'
                }
            ]
        }
    ];

    const toggleFAQ = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setActiveIndex(activeIndex === key ? null : key);
    };

    return (
        <div className="info-page">
            <div className="info-hero">
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about Collexa</p>
            </div>

            <div className="faq-container">
                {faqs.map((category, catIndex) => (
                    <div key={catIndex} className="faq-category">
                        <h2 className="faq-category-title">{category.category}</h2>
                        <div className="faq-list">
                            {category.questions.map((faq, qIndex) => {
                                const isActive = activeIndex === `${catIndex}-${qIndex}`;
                                return (
                                    <div
                                        key={qIndex}
                                        className={`faq-item ${isActive ? 'active' : ''}`}
                                    >
                                        <button
                                            className="faq-question"
                                            onClick={() => toggleFAQ(catIndex, qIndex)}
                                        >
                                            <span>{faq.q}</span>
                                            <span className="faq-toggle-icon">
                                                {isActive ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                )}
                                            </span>
                                        </button>
                                        <div className={`faq-answer ${isActive ? 'show' : ''}`}>
                                            <p>{faq.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="faq-cta">
                <h3>Still have questions?</h3>
                <p>Can't find what you're looking for? We're here to help!</p>
                <Link to="/contact" className="cta-btn">Contact Us</Link>
            </div>
        </div>
    );
};

export default FAQs;
