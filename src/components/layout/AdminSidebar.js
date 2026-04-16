"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Product Onboarding", href: "/admin/products" },
    { label: "Client Details", href: "/admin/clients" },
    { label: "Order Details", href: "/admin/orders" },
    { label: "Enquiry Details", href: "/admin/enquiries" },
];

export default function AdminSidebar({ open, setOpen }) {
    const pathname = usePathname();

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${open ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={() => setOpen(false)}
                aria-hidden={!open}
            />

            <aside
                className={`fixed left-0 z-20 flex w-64 flex-col 
            border-r border-stone-800 bg-[#0c0816] text-white shadow-xl 
            transition-transform duration-200 
            top-[70px] h-[calc(100vh-70px)]
            ${open ? "translate-x-0" : "-translate-x-full"}
            `}
            >
                <div className="flex items-center justify-between gap-2 border-b border-stone-700 p-5">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-[#b48a3c]">Admin Panel</h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-700 bg-[#161022] text-stone-300 transition hover:bg-[#0c0816] md:hidden"
                        aria-label={open ? "Close sidebar" : "Open sidebar"}
                    >
                        <span className="block h-0.5 w-5 rounded-full bg-current"></span>
                        <span className="mt-1 block h-0.5 w-5 rounded-full bg-current"></span>
                        <span className="mt-1 block h-0.5 w-5 rounded-full bg-current"></span>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 pb-6">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                    ? "bg-[#b48a3c] text-[#0c0816]"
                                    : "text-stone-400 hover:bg-[#161022] hover:text-white"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>


            </aside>
        </>
    );
}
