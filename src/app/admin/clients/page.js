"use client";

import AdminLayout from "../../../components/layout/AdminLayout";

export default function ClientDetailsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Details</h1>
          <p className="mt-2 text-stone-400">Manage and view client information</p>
        </div>

        <div className="rounded-lg border border-stone-800 bg-[#0c0816] p-12 text-center">
          <p className="text-stone-400">Client details section coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
