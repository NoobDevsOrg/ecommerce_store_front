"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/auth";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.replace("/admin/login");
            return;
        }
        setIsAuthenticated(true);
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0c0816]">
            <main className="p-4 pb-10 md:p-8 md:pt-8">
                {children}
            </main>
        </div>
    );
}
