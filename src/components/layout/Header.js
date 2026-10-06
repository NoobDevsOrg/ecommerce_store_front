"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getToken } from "../../lib/auth";
import { clearCustomerLogoutState, CUSTOMER_AUTH_EVENT, getStoredCustomer } from "../../lib/customerAuth";
import { getCart } from "../../store/cartStore";
import AdminSidebar from "./AdminSidebar";
import { api } from "lib/api";
import { clearNotificationCount, useNotificationCount } from "../../lib/notificationCount";

function HeaderContent() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count: customerNotificationCount } = useNotificationCount("customer", Boolean(customer && !isAdminAuthenticated));
  const { count: adminNotificationCount } = useNotificationCount("admin", Boolean(isAdminAuthenticated));

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const updateCart = () => {
      const cart = getCart();
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    const updateUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(storedUser);
    };

    const syncAdminAuth = () => {
      const isAuthed = Boolean(getToken());
      setIsAdminAuthenticated(isAuthed);
    };

    const syncCustomerAuth = () => {
      setCustomer(getStoredCustomer());
    };



    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    handleScroll();
    updateCart();
    syncAdminAuth();
    syncCustomerAuth();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("cartUpdated", updateCart);
    window.addEventListener("storage", updateCart);
    window.addEventListener("userUpdated", updateUser);
    window.addEventListener("userUpdated", syncAdminAuth);
    window.addEventListener("storage", syncAdminAuth);
    window.addEventListener(CUSTOMER_AUTH_EVENT, syncCustomerAuth);
    window.addEventListener("storage", syncCustomerAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cartUpdated", updateCart);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("userUpdated", updateUser);
      window.removeEventListener("userUpdated", syncAdminAuth);
      window.removeEventListener("storage", syncAdminAuth);
      window.removeEventListener(CUSTOMER_AUTH_EVENT, syncCustomerAuth);
      window.removeEventListener("storage", syncCustomerAuth);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const shouldShiftContent = isAdminAuthenticated && adminSidebarOpen;
    document.body.classList.toggle("admin-sidebar-open", shouldShiftContent);
    return () => {
      document.body.classList.remove("admin-sidebar-open");
    };
  }, [isAdminAuthenticated, adminSidebarOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    const originalRootOverflow = document.documentElement.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalRootOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("q") || "";

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("user");
    setUser(null);
    setIsAdminAuthenticated(false);
    setAdminSidebarOpen(false);
    setShowDropdown(false);
    clearNotificationCount("admin");
    // Notify other components that user state has changed
    window.dispatchEvent(new Event("userUpdated"));
  };

  const handleCustomerLogout = async () => {
    try {
      await api.customerAuth.logout();
    } finally {
      clearCustomerLogoutState();
      clearNotificationCount("customer");
      setCustomer(null);
      setShowDropdown(false);
      setIsMobileMenuOpen(false);
      router.replace("/");
      router.refresh();
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    if (pathname === "/search") {
      setSearchQuery(urlSearchQuery);
    }
  }, [pathname, urlSearchQuery]);

  const navLinks = [
    { name: "Products", href: "/products" },
    // { name: "Blogs", href: "/blogs" },
    // { name: "Social", href: "#social" },
  ];

  return (
    <>
      {isAdminAuthenticated ? <AdminSidebar open={adminSidebarOpen} setOpen={setAdminSidebarOpen} /> : null}

      <header
        className={`fixed top-0 left-0 w-full z-[1000] py-3 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${isScrolled
          ? "bg-[#0c0816]/95 backdrop-blur-xl border-b border-[#b48a3c]/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          : "bg-[#0c0816] border-b border-transparent shadow-none"
          }`}
      >
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-3 sm:px-6 md:px-10">

          <div className="flex items-center gap-3">
            {isAdminAuthenticated ? (
              <button
                type="button"
                onClick={() => setAdminSidebarOpen((prev) => !prev)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-stone-800 bg-[#161022] text-stone-300 hover:text-white hover:border-stone-600 transition"
                aria-label={adminSidebarOpen ? "Close admin sidebar" : "Open admin sidebar"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  {adminSidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                  )}
                </svg>
              </button>
            ) : null}

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group relative z-[110]">
              <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border border-[#b48a3c]/30 group-hover:border-[#d4af37] transition-all duration-500">
                <Image
                  src="/sagunthala_logo2.jpg"
                  alt="Sagunthala Jewellers"
                  fill
                  sizes="(max-width: 768px) 40px, 44px"
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="leading-tight">
                <h1 className="text-lg md:text-xl font-serif text-white tracking-tight">
                  Sagunthala
                </h1>
                <p className="text-[9px] uppercase tracking-[0.35em] text-[#b48a3c] font-semibold">
                  Dance Jewellery
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-12">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-[11px] uppercase tracking-[0.25em] font-semibold text-stone-300 hover:text-[#d4af37] transition-colors"
              >
                {item.name}
                <span className="absolute left-0 -bottom-2 w-0 h-[1px] bg-[#b48a3c] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="relative z-[110] flex items-center gap-1 sm:gap-4 md:gap-6">

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-[#1b1728] border border-stone-800 rounded-full px-3 py-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="w-40 bg-transparent text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none"
              />
              <button type="submit" className="text-[#b48a3c] text-xs uppercase tracking-widest font-bold">Search</button>
            </form>

            {/* Theme Toggle */}

            {/* Auth */}
            <div className="relative hidden sm:block dropdown-container">
              {isAdminAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 text-[11px] uppercase tracking-widest font-semibold text-stone-200"
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#b48a3c] to-[#e6c76a] flex items-center justify-center text-[#0f0a1a] text-[11px] font-bold shadow-md">
                      {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[80px] truncate">
                      {user?.name || user?.email || "User"}
                    </span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-44">
                      <div className="bg-[#161022] border border-stone-800 rounded-md shadow-xl overflow-hidden">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-3 text-[10px] uppercase tracking-widest text-red-400/80 hover:bg-red-500/5 border-t border-stone-800"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : customer ? (
                <div>
                  <button type="button" onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 text-[11px] font-semibold text-stone-200">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#b48a3c] to-[#e6c76a] text-[11px] font-bold text-[#0f0a1a] shadow-md">
                      {(customer.fullName || customer.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[100px] truncate">{customer.fullName || customer.email || "Account"}</span>
                  </button>
                  {showDropdown ? <div className="absolute right-0 mt-3 w-44 overflow-hidden rounded-md border border-stone-800 bg-[#161022] shadow-xl"><Link href="/account" onClick={() => setShowDropdown(false)} className="block px-5 py-3 text-xs text-stone-200 hover:bg-stone-800">My Account</Link><Link href="/account/orders" onClick={() => setShowDropdown(false)} className="block px-5 py-3 text-xs text-stone-200 hover:bg-stone-800">My Orders</Link><Link href="/account/notifications" onClick={() => setShowDropdown(false)} className="block px-5 py-3 text-xs text-stone-200 hover:bg-stone-800">Notifications</Link><Link href="/account#saved-addresses" onClick={() => setShowDropdown(false)} className="block px-5 py-3 text-xs text-stone-200 hover:bg-stone-800">Saved Addresses</Link><button type="button" onClick={handleCustomerLogout} className="w-full border-t border-stone-800 px-5 py-3 text-left text-xs text-red-300 hover:bg-red-500/5">Logout</button></div> : null}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#b48a3c] border border-[#b48a3c]/30 px-4 py-2 rounded-full hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={() => router.push("/admin/notifications")}
                className="relative group p-2"
                aria-label={`Notifications${adminNotificationCount ? `, ${adminNotificationCount} unread` : ""}`}
              >
                <svg className="w-6 h-6 text-stone-200 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0018 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 00-2.311 6.022c1.733.64 3.56 1.085 5.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                {adminNotificationCount > 0 ? <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[#0c0816]">{adminNotificationCount > 99 ? "99+" : adminNotificationCount}</span> : null}
              </button>
            )}
            {customer && !isAdminAuthenticated ? <><Link href="/account/notifications" className="relative p-2 text-stone-200 hover:text-[#d4af37]" aria-label={`Notifications${customerNotificationCount ? `, ${customerNotificationCount} unread` : ""}`}><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0018 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 00-2.311 6.022c1.733.64 3.56 1.085 5.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>{customerNotificationCount > 0 ? <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[#0c0816]">{customerNotificationCount > 99 ? "99+" : customerNotificationCount}</span> : null}</Link><Link href="/account/orders" className="hidden p-2 text-stone-200 hover:text-[#d4af37] sm:block" aria-label="My Orders"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h11.25m-11.25 4.5h11.25m-11.25 4.5h6.75M4.5 6.75h.008v.008H4.5V6.75zm0 4.5h.008v.008H4.5v-.008zm0 4.5h.008v.008H4.5v-.008z" /></svg></Link></> : null}
            {/* Cart */}
            <Link href="/cart" className="relative inline-flex h-11 w-11 items-center justify-center" aria-label={`Shopping bag${cartCount ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}>
              <svg
                className="w-6 h-6 text-stone-200 group-hover:text-[#d4af37] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.3"
              >
                <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-[#d4af37] text-[9px] font-bold text-[#0f0a1a] rounded-full ring-2 ring-[#0c0816]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Toggle */}
            {!isAdminAuthenticated ? (
              <button
                className="inline-flex h-11 w-11 items-center justify-center text-stone-200 hover:text-[#d4af37] lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="customer-mobile-menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                  )}
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div aria-hidden="true" className="h-[70px] w-full" />

      {/* Mobile Menu */}
      <div
        id="customer-mobile-menu"
        className={`fixed inset-0 z-[90] overflow-y-auto bg-[#0c0816] transition-all duration-500 lg:hidden ${isMobileMenuOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
          }`}
      >
        <div className="flex min-h-full flex-col items-center justify-center gap-7 px-6 py-24">
          <form onSubmit={(event) => { handleSearch(event); setIsMobileMenuOpen(false); }} className="flex w-full max-w-sm items-center rounded-xl border border-stone-700 bg-[#161022] p-1">
            <label className="sr-only" htmlFor="mobile-product-search">Search products</label>
            <input id="mobile-product-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search jewellery" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-stone-100 placeholder:text-stone-500 focus:outline-none" />
            <button type="submit" className="min-h-11 rounded-lg bg-[#d4af37] px-4 text-xs font-bold uppercase tracking-wider text-[#0f0a1a]">Search</button>
          </form>
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex min-h-11 items-center px-4 text-2xl font-serif text-white hover:text-[#d4af37]"
            >
              {item.name}
            </Link>
          ))}

          {isAdminAuthenticated && user ? (
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="text-[12px] uppercase tracking-[0.3em] text-red-400/80"
            >
              Logout
            </button>
          ) : customer ? (
            <div className="flex flex-col items-center gap-5 text-[12px] uppercase tracking-[0.3em] text-[#b48a3c]"><Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>My account</Link><Link href="/account/orders" onClick={() => setIsMobileMenuOpen(false)}>My orders</Link><Link href="/account#saved-addresses" onClick={() => setIsMobileMenuOpen(false)}>Saved addresses</Link><button type="button" onClick={() => { handleCustomerLogout(); setIsMobileMenuOpen(false); }} className="text-red-300">Logout</button></div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[12px] uppercase tracking-[0.3em] text-[#b48a3c]"
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<div aria-hidden="true" className="h-[70px] w-full" />}>
      <HeaderContent />
    </Suspense>
  );
}
