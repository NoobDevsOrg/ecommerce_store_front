"use client";

import AdminLayout from "../../../components/layout/AdminLayout";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-stone-400">Welcome to your admin dashboard</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Total Products" value="0" icon="📦" />
          <DashboardCard title="Total Clients" value="0" icon="👥" />
          <DashboardCard title="Total Orders" value="0" icon="📋" />
          <DashboardCard title="Enquiries" value="0" icon="💬" />
        </div>

        {/* Empty State */}
        <div className="rounded-lg border border-stone-800 bg-[#0c0816] p-12 text-center">
          <p className="text-stone-400">Start by managing your products, clients, and orders from the sidebar.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

function DashboardCard({ title, value, icon }) {
  return (
    <div className="rounded-lg border border-stone-800 bg-[#0c0816] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
