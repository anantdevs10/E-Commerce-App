import { useEffect, useState } from "react";
import api from "../api/api";

function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    const fetchNotifications = () => {
        api.get("notifications/").then((res) => setNotifications(res.data));
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async (id) => {
        await api.patch(`notifications/${id}/`, { is_read: true });
        fetchNotifications();
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (

        <div className="relative">

            <button onClick={() => setOpen(!open)} className="relative text-ink/70 hover:text-moss transition-colors">
                Notifications
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-moss text-paper text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-paper border border-line rounded-sm shadow-lg z-10">
                    {notifications.length === 0 && (
                        <p className="p-4 text-sm text-ink/50">No notifications.</p>
                    )}
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`p-4 text-sm border-b border-line last:border-0 cursor-pointer ${
                                n.is_read ? "text-ink/40" : "text-ink font-medium"
                            }`}
                        >
                            {n.message}
                        </div>
                    ))}
                </div>
            )}

        </div>

    );

}

export default NotificationBell;