import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css'; // Import custom CSS

const Homepage = () => {
    return (
        <div className="homepage-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Unlock Seamless Event Management</h1>
                    <p className="hero-subtitle">
                        Effortlessly plan, organize, and execute your events with our intuitive platform.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/login" className="button primary-button">Login</Link>
                        <Link to="/registration" className="button secondary-button">Register</Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Key Features</h2>
                    <div className="row">
                        <div className="col-md-4 feature-item">
                            <i className="fas fa-calendar-alt fa-3x feature-icon primary-icon"></i>
                            <h3>Smart Scheduling</h3>
                            <p className="feature-description">Intuitively schedule events, set reminders, and manage timelines effectively.</p>
                        </div>
                        <div className="col-md-4 feature-item">
                            <i className="fas fa-tasks fa-3x feature-icon success-icon"></i>
                            <h3>Efficient Task Management</h3>
                            <p className="feature-description">Create, assign, and track tasks to ensure every detail is covered.</p>
                        </div>
                        <div className="col-md-4 feature-item">
                            <i className="fas fa-users fa-3x feature-icon info-icon"></i>
                            <h3>Collaborative Vendor Coordination</h3>
                            <p className="feature-description">Seamlessly communicate and manage your event vendors in one place.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <div className="container">
                    <h2 className="cta-title">Ready to Elevate Your Events?</h2>
                    <p className="cta-subtitle">
                        Join our community and experience the future of event management.
                    </p>
                    <Link to="/registration" className="button call-to-action-button">Sign Up for Free</Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="site-footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Event Manager. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;