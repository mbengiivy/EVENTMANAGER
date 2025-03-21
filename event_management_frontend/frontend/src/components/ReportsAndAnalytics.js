import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ReportsAndAnalytics = () => {
    const [eventReports, setEventReports] = useState([]);
    const [taskReports, setTaskReports] = useState([]);
    const [vendorReports, setVendorReports] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEventReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/event-reports/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEventReports(response.data);
            } catch (err) {
                setError('Failed to load event reports.');
                console.error('Error fetching event reports:', err);
            }
        };

        const fetchTaskReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/task-reports/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTaskReports(response.data);
            } catch (err) {
                setError('Failed to load task reports.');
                console.error('Error fetching task reports:', err);
            }
        };

        const fetchVendorReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/vendor-reports/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setVendorReports(response.data);
            } catch (err) {
                setError('Failed to load vendor reports.');
                console.error('Error fetching vendor reports:', err);
            }
        };

        fetchEventReports();
        fetchTaskReports();
        fetchVendorReports();
    }, []);

    // Prepare chart data for event reports
    const eventChartData = {
        labels: eventReports.map(report => report.name),
        datasets: [
            {
                label: 'Event Count',
                data: eventReports.map(() => 1),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
        ],
    };

    const eventChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Event Reports' },
        },
    };

    // Prepare chart data for task reports
    const taskChartData = {
        labels: [...new Set(taskReports.map(report => report.assigned_to))],
        datasets: [
            {
                label: 'Task Count per Crew Member',
                data: [...new Set(taskReports.map(report => report.assigned_to))].map(assignedTo =>
                    taskReports.filter(report => report.assigned_to === assignedTo).length
                ),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const taskChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Task Reports' },
        },
    };

    // Prepare chart data for vendor reports (example: count vendors per assigned crew member)
    const vendorChartData = {
        labels: [...new Set(vendorReports.map(report => report.assigned_to))],
        datasets: [
            {
                label: 'Vendor Count per Crew Member',
                data: [...new Set(vendorReports.map(report => report.assigned_to))].map(assignedTo =>
                    vendorReports.filter(report => report.assigned_to === assignedTo).length
                ),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    const vendorChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Vendor Reports' },
        },
    };

    return (
        <DashboardLayout>
            {error && <div>{error}</div>}

            <h2>Event Reports</h2>
            <Bar data={eventChartData} options={eventChartOptions} />

            <h2>Task Reports</h2>
            <Bar data={taskChartData} options={taskChartOptions} />

            <h2>Vendor Reports</h2>
            <Bar data={vendorChartData} options={vendorChartOptions} />

            <h2>Event Report Table</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Chief Planner</th>
                    </tr>
                </thead>
                <tbody>
                    {eventReports.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.name}</td>
                            <td>{report.date}</td>
                            <td>{report.chief_planner}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Task Report Table</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Event</th>
                        <th>Assigned To</th>
                    </tr>
                </thead>
                <tbody>
                    {taskReports.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.name}</td>
                            <td>{report.description}</td>
                            <td>{report.event}</td>
                            <td>{report.assigned_to}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Vendor Report Table</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Assigned To</th>
                    </tr>
                </thead>
                <tbody>
                    {vendorReports.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.name}</td>
                            <td>{report.contact}</td>
                            <td>{report.assigned_to}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DashboardLayout>
    );
};

export default ReportsAndAnalytics;