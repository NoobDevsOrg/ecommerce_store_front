"use client";

import AdminLayout from "../../../components/layout/AdminLayout";

export default function OrderDetailsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Order Details</h1>
          <p className="mt-2 text-stone-400">Manage and track orders</p>
        </div>

        <div className="rounded-lg border border-stone-800 bg-[#0c0816] p-12 text-center">
          <p className="text-stone-400">Order details section coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
