"use client";
import NotificationList from "../../../components/notifications/NotificationList";
import { api } from "../../../lib/api";
export default function CustomerNotificationsPage() { return <main className="min-h-screen bg-[#0f0a1a] px-4 py-20 text-stone-200 sm:px-6"><div className="mx-auto max-w-4xl"><NotificationList load={api.notifications.mine} markRead={api.notifications.read} markAllRead={api.notifications.readAll} /></div></main>; }
