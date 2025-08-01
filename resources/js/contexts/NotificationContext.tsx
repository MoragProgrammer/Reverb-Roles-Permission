import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface NotificationContextType {
    unreadCount: number;
    setUnreadCount: (count: number) => void;
    incrementUnreadCount: () => void;
    decrementUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

declare global {
    interface Window {
        Echo: {
            channel: (channel: string) => {
                listen: <T>(event: string, callback: (data: T) => void) => void;
            };
            leave: (channel: string) => void;
        };
    }
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const { props } = usePage<SharedData>();
    const [unreadCount, setUnreadCount] = useState<number>(props.auth.unreadNotificationsCount || 0);

    const incrementUnreadCount = () => {
        setUnreadCount(prev => prev + 1);
    };

    const decrementUnreadCount = () => {
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    useEffect(() => {
        // Update count when page props change (page navigation)
        setUnreadCount(props.auth.unreadNotificationsCount || 0);
    }, [props.auth.unreadNotificationsCount]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo && props.auth.user) {
            // Listen for notification events on the notifications channel
            const channel = window.Echo.channel('notifications');

            // Listen for new notifications created
            channel.listen<{ notification: any }>('NotificationCreated', (data) => {
                // Check if this notification is for the current user
                if (data.notification && data.notification.user_id === props.auth.user.id) {
                    incrementUnreadCount();
                    
                    // Show toast notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(data.notification.title || 'New Notification', {
                            body: data.notification.message || 'You have a new notification',
                            icon: '/favicon.ico',
                        });
                    }
                }
            });

            // Listen for notification updates (could be marking as read)
            channel.listen<{ notification: any }>('NotificationUpdated', (data) => {
                // Check if this notification update is for the current user
                if (data.notification && data.notification.user_id === props.auth.user.id) {
                    // If notification was marked as read, decrement count
                    if (data.notification.status === 'read') {
                        decrementUnreadCount();
                    }
                    // If notification was marked as unread, increment count
                    else if (data.notification.status === 'unread') {
                        incrementUnreadCount();
                    }
                }
            });

            // Cleanup on unmount
            return () => {
                window.Echo.leave('notifications');
            };
        }
    }, [props.auth.user]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const value: NotificationContextType = {
        unreadCount,
        setUnreadCount,
        incrementUnreadCount,
        decrementUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
