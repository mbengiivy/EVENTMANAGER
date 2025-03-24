import React from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
    return (
        <div className="container-fluid p-0">
            {/* Hero Section */}
            <section className="jumbotron text-center bg-light">
                <div className="container">
                    <h1 className="jumbotron-heading">Manage Your Events with Ease</h1>
                    <p className="lead text-muted">
                        Streamline your event planning and management with our powerful platform.
                    </p>
                    <p>
                        <Link to="/login" className="btn btn-primary m-2">Login</Link>
                        <Link to="/register" className="btn btn-secondary m-2">Register</Link>
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5 bg-white">
                <div className="container">
                    <div className="row">
                        <div className="col-md-4 text-center mb-4">
                            <i className="fas fa-calendar-alt fa-3x text-primary mb-3"></i>
                            <h3>Event Scheduling</h3>
                            <p className="text-muted">Plan and schedule events with ease.</p>
                        </div>
                        <div className="col-md-4 text-center mb-4">
                            <i className="fas fa-tasks fa-3x text-success mb-3"></i>
                            <h3>Task Management</h3>
                            <p className="text-muted">Organize and assign tasks effectively.</p>
                        </div>
                        <div className="col-md-4 text-center mb-4">
                            <i className="fas fa-users fa-3x text-info mb-3"></i>
                            <h3>Vendor Coordination</h3>
                            <p className="text-muted">Manage vendors and coordinate services.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-5 bg-light text-center">
                <div className="container">
                    <h2>Ready to Get Started?</h2>
                    <p className="lead text-muted">
                        Join our platform and experience seamless event management.
                    </p>
                    <p>
                        <Link to="/register" className="btn btn-success btn-lg">Sign Up Now</Link>
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-3 bg-dark text-white text-center">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Event Manager. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;