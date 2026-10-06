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
        // This state is deliberately derived only after client storage is available.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAuthenticated(true);
    }, [router]);

    useEffect(() => {
        document.body.classList.toggle("admin-shell-active", isAuthenticated);
        return () => document.body.classList.remove("admin-shell-active");
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0c0816] lg:fixed lg:inset-x-0 lg:bottom-0 lg:top-[70px] lg:min-h-0 lg:overflow-hidden">
            <main className="admin-main-scroll min-h-screen overflow-x-hidden p-4 pb-10 md:p-8 md:pt-8 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
                {children}
            </main>
        </div>
    );
}
