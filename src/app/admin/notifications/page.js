"use client";
import AdminLayout from "../../../components/layout/AdminLayout";
import NotificationList from "../../../components/notifications/NotificationList";
import { api } from "../../../lib/api";
export default function AdminNotificationsPage() { return <AdminLayout><main><NotificationList admin load={api.notifications.admin.list} markRead={api.notifications.admin.read} markAllRead={api.notifications.admin.readAll} /></main></AdminLayout>; }
