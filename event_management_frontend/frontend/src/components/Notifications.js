import React, { useState, useEffect, useRef } from 'react';

const Notifications = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const socketRef = useRef(null); // Use useRef to hold the socket instance

    useEffect(() => {
        if (!userId) {
            return;
        }

        socketRef.current = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}/`);

        socketRef.current.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotifications((prevNotifications) => [...prevNotifications, data.notification]);
            setNotificationMessage(data.notification);
            setShowNotification(true);

            setTimeout(() => {
                setShowNotification(false);
            }, 5000);
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [userId]);

    return (
        <div className="container mt-4">
            {showNotification && (
                <div
                    className="alert alert-info"
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        zIndex: 1000,
                    }}
                >
                    {notificationMessage}
                </div>
            )}
            {notifications.length > 0 && (
                <div className="mt-4">
                    <h3 className="mb-3">Notifications History</h3>
                    <ul className="list-group">
                        {notifications.map((notification, index) => (
                            <li key={index} className="list-group-item">
                                {notification}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Notifications;