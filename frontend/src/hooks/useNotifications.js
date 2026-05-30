import { useState, useCallback } from 'react';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const triggerNotifications = useCallback((notifs = []) => {
        if (notifs?.length > 0) {
            setNotifications(notifs);
        }
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return { notifications, triggerNotifications, clearNotifications };
};

export default useNotifications;