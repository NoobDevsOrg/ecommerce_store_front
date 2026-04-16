"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Select from "react-select";
import { getPublicProducts } from "../../lib/publicApi";

const SORT_OPTIONS = [
    { id: "newest", label: "Newest First" },
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
    { id: "rating", label: "Highest Rated" },
    { id: "popularity", label: "Most Popular" },
    { id: "name-asc", label: "Name A-Z" },
    { id: "name-desc", label: "Name Z-A" },
];

const RatingStars = ({ value, size = "sm" }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    const sizeClass = size === "lg" ? "text-lg" : "text-xs";
    return (
        <div className={`flex items-center gap-1 ${sizeClass} text-amber-300`}>
            {stars.map((star) => (
                <span key={star} className="transition-colors duration-200">
                    {star <= value ? "★" : "☆"}
                </span>
            ))}
        </div>
    );
};

const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border border-stone-800 bg-[#11101a] p-4 shadow-lg">
        <div className="aspect-square bg-stone-800 rounded-xl mb-4" />
        <div className="h-4 bg-stone-800 rounded w-3/4 mb-2" />
        <div className="h-4 bg-stone-800 rounded w-1/2 mb-2" />
        <div className="h-4 bg-stone-800 rounded w-2/3 mb-4" />
        <div className="flex gap-2">
            <div className="h-8 bg-stone-800 rounded flex-1" />
            <div className="h-8 bg-stone-800 rounded flex-1" />
        </div>
    </div>
);

const ProductCard = ({ product, index }) => {
    const imageUrl =
        product.image_urls?.[0]?.url ||
        product.images?.[0]?.url ||
        product.image ||
        "/images/placeholder.jpg";

    const price = Number(product.price || product.price_in_cents || 0);
    const oldPrice = Number(product.originalPrice || product.compare_price || product.mrp || price);
    const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    const rating = Math.min(5, Math.max(0, Number(product.rating || product.star_rating || 0)));
    const inStock = Number(product.stock_qty || product.stock || product.inventory || 0) > 0;

    return (
        <article
            className="group overflow-hidden rounded-2xl border border-stone-800 bg-[#11101a] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#b48a3c]/20 hover:border-[#b48a3c]/50 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.name || "Product"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(event) => { event.currentTarget.src = "/images/placeholder.jpg"; }}
                />
                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discount}%
                    </div>
                )}
                {!inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm bg-stone-800 px-3 py-1 rounded-full">Out of Stock</span>
                    </div>
                )}
            </Link>
            <div className="p-4 space-y-3">
                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white leading-snug group-hover:text-[#b48a3c] transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-[#d4af37]">₹{price.toLocaleString("en-IN")}</span>
                        {discount > 0 && (
                            <span className="text-sm text-stone-400 line-through">₹{oldPrice.toLocaleString("en-IN")}</span>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        <RatingStars value={rating} />
                        <span className="text-xs text-stone-400">{product.reviewCount || 0} reviews</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    <button
                        className="flex-1 rounded-lg border border-[#b48a3c] px-3 py-2 text-sm text-[#b48a3c] hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-200 font-medium"
                        disabled={!inStock}
                    >
                        {inStock ? "Add to Cart" : "Notify Me"}
                    </button>
                    <button className="flex-1 rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all duration-200">
                        Wishlist
                    </button>
                </div>
            </div>
        </article>
    );
};

export default function ProductsListingPage() {
    const [rawProducts, setRawProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1000000]);

    const [sortOption, setSortOption] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 40,
            borderRadius: 12,
            borderColor: state.isFocused ? "#b48a3c" : "#44403c",
            backgroundColor: "#12101b",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(180,138,60,0.2)" : "none",
            ":hover": { borderColor: "#b48a3c" },
        }),
        menu: (base) => ({ ...base, backgroundColor: "#12101b", border: "1px solid #44403c", zIndex: 1200 }),
        singleValue: (base) => ({ ...base, color: "#ffffff" }),
        option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#292524" : "#12101b", color: "#ffffff" }),
        input: (base) => ({ ...base, color: "#ffffff" }),
        placeholder: (base) => ({ ...base, color: "#a8a29e" }),
        indicatorSeparator: (base) => ({ ...base, backgroundColor: "#57534e" }),
        dropdownIndicator: (base) => ({ ...base, color: "#a8a29e" }),
        menuPortal: (base) => ({ ...base, zIndex: 1300 }),
    };

    const sortSelectOptions = SORT_OPTIONS.map((option) => ({ value: option.id, label: option.label }));
    const itemsPerPageOptions = [12, 24, 36, 48].map((count) => ({ value: count, label: String(count) }));
    const ratingOptions = [
        { value: 0, label: "All Ratings" },
        { value: 4, label: "4+ Stars" },
        { value: 3, label: "3+ Stars" },
        { value: 2, label: "2+ Stars" },
        { value: 1, label: "1+ Star" },
    ];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getPublicProducts(1, 500);
                const products = Array.isArray(data?.products) ? data.products : [];
                setRawProducts(products);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError(err?.message || "Failed to load products");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = useMemo(() => {
        const set = new Set();
        rawProducts.forEach((product) => {
            if (product.category_name) set.add(product.category_name);
            if (product.category) set.add(product.category);
        });
        return Array.from(set).sort();
    }, [rawProducts]);

    const priceBounds = useMemo(() => {
        const prices = rawProducts.map((p) => Number(p.price || p.originalPrice || p.compare_price || 0)).filter(Boolean);
        if (!prices.length) return [0, 1000000];
        return [Math.min(...prices), Math.max(...prices)];
    }, [rawProducts]);

    useEffect(() => {
        if (priceBounds[0] !== 0 && priceBounds[1] !== 1000000) {
            setPriceRange(priceBounds);
        }
    }, [priceBounds]);

    const filteredProducts = useMemo(() => {
        let items = [...rawProducts];

        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase();
            items = items.filter((p) =>
                (p.name || "").toLowerCase().includes(query) ||
                (p.slug || "").toLowerCase().includes(query) ||
                (p.description || "").toLowerCase().includes(query)
            );
        }

        if (categoryFilter.length) {
            items = items.filter((p) => categoryFilter.includes(p.category_name || p.category));
        }

        if (ratingFilter > 0) {
            items = items.filter((p) => Number(p.rating || p.star_rating || 0) >= ratingFilter);
        }

        if (inStockOnly) {
            items = items.filter((p) => Number(p.stock_qty || p.stock || p.inventory || 0) > 0);
        }

        items = items.filter((p) => {
            const price = Number(p.price || p.originalPrice || p.compare_price || 0);
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Sorting
        switch (sortOption) {
            case "price-asc":
                items.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)));
                break;
            case "price-desc":
                items.sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)));
                break;
            case "rating":
                items.sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)));
                break;
            case "popularity":
                items.sort((a, b) => (Number(b.reviewCount || 0) - Number(a.reviewCount || 0)));
                break;
            case "name-asc":
                items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case "name-desc":
                items.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            default: // newest
                items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        return items;
    }, [rawProducts, debouncedSearch, categoryFilter, ratingFilter, inStockOnly, priceRange, sortOption]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const displayedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const clearFilters = useCallback(() => {
        setSearchQuery("");
        setCategoryFilter([]);
        setRatingFilter(0);
        setInStockOnly(false);
        setPriceRange(priceBounds);
        setSortOption("newest");
        setCurrentPage(1);
    }, [priceBounds]);

    const toggleCategory = useCallback((category) => {
        setCategoryFilter((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    }, []);

    const loadMore = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, totalPages]);

    return (
        <main className="bg-[#0f0a1a] min-h-screen pb-10">
            {/* Header Section */}
            <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0f0a1a] to-[#1a1525]">
                <div className="mx-auto max-w-[1440px] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">Discover Our Collection</h1>
                            <p className="text-sm text-stone-400">{filteredProducts.length} exquisite pieces found</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="relative flex-1 sm:flex-initial">
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    type="search"
                                    placeholder="Search jewelry, diamonds, gold..."
                                    className="w-full max-w-sm rounded-xl border border-stone-700 bg-[#12101b] px-4 py-3 pl-10 text-sm text-white outline-none focus:border-[#b48a3c] focus:ring-2 focus:ring-[#b48a3c]/20 transition-all"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                onClick={clearFilters}
                                className="rounded-xl border border-stone-700 px-4 py-3 text-xs uppercase tracking-wider text-stone-300 hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all duration-200"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters((prev) => !prev)}
                                className="lg:hidden rounded-xl border border-stone-700 bg-[#12101b] px-4 py-2 text-sm text-stone-200 hover:border-[#b48a3c] transition-all"
                            >
                                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-stone-500">View:</span>
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#b48a3c] text-[#0f0a1a]" : "text-stone-400 hover:text-white"}`}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#b48a3c] text-[#0f0a1a]" : "text-stone-400 hover:text-white"}`}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-stone-500">Sort:</span>
                                <div className="min-w-[220px]">
                                    <Select
                                        value={sortSelectOptions.find((option) => option.value === sortOption) || null}
                                        options={sortSelectOptions}
                                        styles={selectStyles}
                                        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                        onChange={(option) => setSortOption(option?.value || "newest")}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-stone-500">Show:</span>
                                <div className="w-[100px]">
                                    <Select
                                        value={itemsPerPageOptions.find((option) => option.value === itemsPerPage) || null}
                                        options={itemsPerPageOptions}
                                        styles={selectStyles}
                                        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                        onChange={(option) => {
                                            setItemsPerPage(Number(option?.value || 12));
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8 py-8">
                {/* Filters Sidebar */}
                <aside className={`${showFilters ? "block" : "hidden"} lg:block rounded-2xl border border-stone-800 bg-[#11101a] p-6 shadow-xl`}>
                    <h2 className="text-lg font-semibold uppercase text-stone-200 tracking-wider mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </h2>

                    <div className="space-y-6">
                        {/* Categories */}
                        <div>
                            <p className="text-sm uppercase tracking-wider text-stone-400 mb-3 font-medium">Categories</p>
                            <div className="space-y-2 max-h-48 overflow-auto pr-2">
                                {categories.length === 0 ? (
                                    <p className="text-sm text-stone-500">No categories available</p>
                                ) : (
                                    categories.map((category) => (
                                        <label key={category} className="flex items-center gap-3 text-sm text-stone-200 hover:text-white cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={categoryFilter.includes(category)}
                                                onChange={() => toggleCategory(category)}
                                                className="h-4 w-4 accent-[#b48a3c] rounded"
                                            />
                                            <span className="group-hover:text-[#b48a3c] transition-colors">{category}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <p className="text-sm uppercase tracking-wider text-stone-400 mb-3 font-medium">Price Range</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-stone-200">
                                    <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
                                    <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="range"
                                        min={priceBounds[0]}
                                        max={priceBounds[1]}
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                    <input
                                        type="range"
                                        min={priceBounds[0]}
                                        max={priceBounds[1]}
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <p className="text-sm uppercase tracking-wider text-stone-400 mb-3 font-medium">Minimum Rating</p>
                            <Select
                                value={ratingOptions.find((option) => option.value === ratingFilter) || null}
                                options={ratingOptions}
                                styles={selectStyles}
                                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                onChange={(option) => setRatingFilter(Number(option?.value || 0))}
                            />
                        </div>

                        {/* In Stock */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="inStock"
                                checked={inStockOnly}
                                onChange={(e) => setInStockOnly(e.target.checked)}
                                className="h-5 w-5 accent-[#b48a3c] rounded"
                            />
                            <label htmlFor="inStock" className="text-sm text-stone-200 hover:text-white cursor-pointer">In Stock Only</label>
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <section className="space-y-6">
                    {isLoading && (
                        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                            {Array.from({ length: itemsPerPage }).map((_, idx) => <SkeletonCard key={idx} />)}
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="rounded-2xl border border-rose-800 bg-rose-950/30 p-8 text-center text-rose-200">
                            <svg className="w-12 h-12 mx-auto mb-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="font-semibold text-lg mb-2">{error}</p>
                            <p className="text-sm text-rose-300">Please refresh the page or try again later.</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredProducts.length === 0 && (
                        <div className="rounded-2xl border border-stone-800 bg-[#11101a] p-12 text-center text-stone-300">
                            <svg className="w-16 h-16 mx-auto mb-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold text-white mb-2">No products found</h2>
                            <p className="text-sm text-stone-400 mb-4">Try adjusting your filters or search terms.</p>
                            <button onClick={clearFilters} className="rounded-xl border border-[#b48a3c] px-6 py-3 text-[#b48a3c] hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all">
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && filteredProducts.length > 0 && (
                        <>
                            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                                {displayedProducts.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>

                            {/* Load More Button */}
                            {currentPage < totalPages && (
                                <div className="text-center">
                                    <button
                                        onClick={loadMore}
                                        className="rounded-xl border border-[#b48a3c] px-8 py-4 text-[#b48a3c] hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-200 font-medium"
                                    >
                                        Load More Products
                                    </button>
                                </div>
                            )}

                            {/* Page Info */}
                            <div className="text-center text-sm text-stone-400">
                                Showing {displayedProducts.length} of {filteredProducts.length} products
                            </div>
                        </>
                    )}
                </section>
            </section>

            <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #b48a3c;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #b48a3c;
          cursor: pointer;
          border: none;
        }
      `}</style>
        </main>
    );
}

