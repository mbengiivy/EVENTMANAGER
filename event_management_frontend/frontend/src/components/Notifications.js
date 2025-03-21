import React, { useState, useEffect } from 'react';

const Notifications = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        if (!userId) {
            return; // Don't connect if userId is not available
        }
        const socket = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}/`);

        socket.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotifications((prevNotifications) => [...prevNotifications, data.notification]);
            setNotificationMessage(data.notification);
            setShowNotification(true);

            // Hide the notification after a few seconds
            setTimeout(() => {
                setShowNotification(false);
            }, 5000); // 5 seconds
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            socket.close();
        };
    }, [userId]);

    return (
        <div>
            {showNotification && (
                <div
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        background: 'lightblue',
                        padding: '10px',
                        borderRadius: '5px',
                        zIndex: 1000,
                    }}
                >
                    {notificationMessage}
                </div>
            )}
            {/* You can also display a list of all notifications here */}
        </div>
    );
};

export default Notifications;