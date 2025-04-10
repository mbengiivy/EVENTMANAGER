import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsAndAnalytics = () => {
    const [eventReports, setEventReports] = useState([]);
    const [taskReports, setTaskReports] = useState([]);
    const [vendorReports, setVendorReports] = useState([]);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [eventFilter, setEventFilter] = useState('');
    const [taskFilter, setTaskFilter] = useState('');
    const [vendorFilter, setVendorFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const eventRef = useRef(null);
    const taskRef = useRef(null);
    const vendorRef = useRef(null);

    const downloadPDF = async (ref, filename) => {
        const element = ref.current;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`${filename}.pdf`);
    };

    useEffect(() => {
        const fetchReports = async () => {
            const token = localStorage.getItem('token');
            setLoading(true);
            try {
                const userResponse = await axios.get('http://localhost:8000/api/users/me/', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(userResponse.data.username);

                if (!userResponse.data.is_admin) {
                    setError('Access denied. Please log in as an admin.');
                    return;
                }

                const [eventResponse, taskResponse, vendorResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/reports/events', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get('http://localhost:8000/api/reports/tasks', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get('http://localhost:8000/api/reports/vendors', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setEventReports(eventResponse.data);
                setTaskReports(taskResponse.data);
                setVendorReports(vendorResponse.data);
                setLoading(false);

            } catch (err) {
                setError('Failed to load reports.');
                console.error('Error fetching reports:', err);
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (error) return <div className="alert alert-danger">{error}</div>;
    if (loading) return <>Loading...</>;

    return (
        <>
            <h2>Reports & Analytics</h2>
            {user && <p>You are logged in as <strong>{user}</strong></p>}

            {/* Event Reports */}
            <div className="mb-4" ref={eventRef}>
                <Link to="/view-events" className="btn btn-primary mb-2">View Events</Link>
                <Button onClick={() => downloadPDF(eventRef, 'Event_Reports')} className="btn btn-secondary ms-2 mb-2">Download Events PDF</Button>
                <Form.Control type="text" placeholder="Filter by event name" className="mb-2" value={eventFilter} onChange={e => setEventFilter(e.target.value)} />
                <Bar
                    data={{
                        labels: eventReports.map(report => report.name),
                        datasets: [{
                            label: 'Event Count',
                            data: eventReports.map(() => 1),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        }],
                    }}
                />
                <table className="table table-bordered table-striped mt-2">
                    <thead>
                        <tr><th>Event Name</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        {eventReports.filter(report => report.name.includes(eventFilter)).map((report, index) => (
                            <tr key={index}>
                                <td>{report.name}</td>
                                <td>{report.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Task Reports */}
            <div className="mb-4" ref={taskRef}>
                <Link to="/task-management" className="btn btn-primary mb-2">View Tasks</Link>
                <Button onClick={() => downloadPDF(taskRef, 'Task_Reports')} className="btn btn-secondary ms-2 mb-2">Download Tasks PDF</Button>
                <Form.Control type="text" placeholder="Filter by task description" className="mb-2" value={taskFilter} onChange={e => setTaskFilter(e.target.value)} />
                <Bar
                    data={{
                        labels: taskReports.map(report => report.assigned_to_name || 'Unknown'),
                        datasets: [{
                            label: 'Tasks per Crew Member',
                            data: taskReports.map(() => 1),
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        }],
                    }}
                />
                <table className="table table-bordered table-striped mt-2">
                    <thead>
                        <tr><th>Task Description</th><th>Assigned To</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {taskReports.filter(report => report.description.includes(taskFilter)).map((report, index) => (
                            <tr key={index}>
                                <td>{report.description}</td>
                                <td>{report.assigned_to_name || 'Unknown'}</td>
                                <td>{report.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vendor Reports */}
            <div className="mb-4" ref={vendorRef}>
                <Link to="/view-vendor" className="btn btn-primary mb-2">View Vendors</Link>
                <Button onClick={() => downloadPDF(vendorRef, 'Vendor_Reports')} className="btn btn-secondary ms-2 mb-2">Download Vendors PDF</Button>
                <Form.Control type="text" placeholder="Filter by vendor name" className="mb-2" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} />
                <Bar
                    data={{
                        labels: vendorReports.map(report => report.name),
                        datasets: [{
                            label: 'Vendors',
                            data: vendorReports.map(() => 1),
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        }],
                    }}
                />
                <table className="table table-bordered table-striped mt-2">
                    <thead>
                        <tr><th>Vendor Name</th><th>Services Offered</th></tr>
                    </thead>
                    <tbody>
                        {vendorReports.filter(report => report.name.includes(vendorFilter)).map((report, index) => (
                            <tr key={index}>
                                <td>{report.name}</td>
                                <td>{report.services_offered}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ReportsAndAnalytics;
