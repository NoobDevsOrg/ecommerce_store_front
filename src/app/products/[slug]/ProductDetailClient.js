"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductReviews from "../../../components/product/ProductReviews";
import EnquiryModal from "../../../components/product/ProductEnquiry";
import ProductActions from "../../../components/product/ProductActions";
import RatingStars from "../../../components/product/RatingStars";
import RelatedProductSection from "../../../components/product/RelatedProductSection";

export default function ProductDetailPage({ product }) {
    // The detailed public Product response exposes `images` as Product Image
    // records. `image_urls` intentionally contains only strings, so it cannot
    // provide React keys or preserve the selected Product Image identity.
    const images = (Array.isArray(product.images) ? product.images : [])
        .filter((image) => image?.id && image?.url)
        .filter((image, index, allImages) =>
            allImages.findIndex((candidate) => candidate.id === image.id) === index
        );
    const primaryImage = images.find((image) => image.is_primary) || images[0];

    const [selectedImageId, setSelectedImageId] = useState(primaryImage?.id ?? null);
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const canBuy = Boolean(product.isPurchasable);
    const canEnquire = Boolean(product.isEnquiryEnabled);
    const averageRating = Number(product.average_rating || 0);
    const reviewCount = Number(product.review_count || 0);

    // Detect touch/coarse-pointer devices on mount so we can skip the
    // hover-zoom interaction there — mousemove/mouseenter don't behave
    // reliably on touch and the zoom overlay ends up "stuck" mid-tap.
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(pointer: coarse)");
        setIsTouchDevice(mq.matches);
        const handler = (e) => setIsTouchDevice(e.matches);
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    // If the product changes (e.g. client-side navigation between products),
    // reset the selected image back to that product's primary image.
    useEffect(() => {
        setSelectedImageId(primaryImage?.id ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?.id]);

    // This was the bug: it needs to actually respect selectedImageId,
    // otherwise clicking a thumbnail updates state but the main image
    // never changes.
    const selectedImage =
        images.find((image) => image.id === selectedImageId) ||
        primaryImage ||
        { url: "/images/placeholder.jpg" };

    const handleZoomMove = (event) => {
        if (isTouchDevice) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({
            x: Math.min(100, Math.max(0, x)),
            y: Math.min(100, Math.max(0, y)),
        });
    };

    return (
        <main className="bg-[#0f0a1a] min-h-screen">
            {/* Breadcrumb */}
            <section className="border-b border-stone-900/50 px-[clamp(1rem,2.5vw,2rem)] py-[clamp(0.75rem,1.5vw,1.5rem)]">
                <div className="mx-auto w-full max-w-[min(1700px,96vw)]">
                    <div className="flex items-center gap-3 text-sm overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="text-stone-400 hover:text-stone-200 transition-colors">
                            Home
                        </Link>
                        <span className="text-stone-600">/</span>
                        <Link href="/products" className="text-stone-400 hover:text-stone-200 transition-colors">
                            Products
                        </Link>
                        <span className="text-stone-600">/</span>
                        <span className="text-[#b48a3c]">{product.name}</span>
                    </div>
                </div>
            </section>

            {/* Product Details */}
            <section className="px-[clamp(1rem,2.5vw,2rem)] py-[clamp(2rem,5vw,5rem)]">
                <div className="mx-auto w-full max-w-[min(1700px,96vw)] grid grid-cols-1 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-[clamp(1.5rem,3vw,3.25rem)]">
                    {/* Image Gallery */}
                    <div className="xl:pr-[clamp(1.5rem,2.8vw,3rem)] xl:border-r xl:border-stone-800/70">
                        {/* Main Image */}
                        <div
                            className={`relative h-[clamp(280px,52vw,760px)] overflow-hidden rounded-sm bg-[#120f1d] border border-stone-800/60 mb-4 ${isTouchDevice ? "" : "cursor-zoom-in"
                                }`}
                            onMouseEnter={() => !isTouchDevice && setIsZooming(true)}
                            onMouseLeave={() => setIsZooming(false)}
                            onMouseMove={handleZoomMove}
                        >
                            <img
                                src={selectedImage?.url}
                                alt={selectedImage?.alt_text || product.name}
                                className={`w-full h-full object-contain ${isZooming && !isTouchDevice
                                        ? "scale-[2.5] transition-none"
                                        : "scale-100 transition-transform duration-300"
                                    }`}
                                style={
                                    isZooming && !isTouchDevice
                                        ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                                        : undefined
                                }
                                onError={(e) => {
                                    e.target.src = "/images/placeholder.jpg";
                                }}
                            />

                            {isZooming && !isTouchDevice ? (
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute h-24 w-24 rounded-sm border border-[#b48a3c]/70 bg-[#b48a3c]/10"
                                    style={{
                                        left: `calc(${zoomPosition.x}% - 3rem)`,
                                        top: `calc(${zoomPosition.y}% - 3rem)`,
                                    }}
                                />
                            ) : null}
                        </div>

                        {/* Thumbnails */}
 
                        <div className="grid grid-cols-4 gap-[clamp(0.5rem,1vw,1rem)]">
                            {images.map((image) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setSelectedImageId(image.id)}
                                    aria-label={`View ${image.alt_text || `${product.name} image`}`}
                                    aria-pressed={selectedImageId === image.id}
                                    className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-colors ${selectedImageId === image.id
                                            ? "border-[#b48a3c]"
                                            : "border-stone-800/50 hover:border-stone-700 active:border-stone-600"
                                        }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt_text || product.name}
                                        className="w-full h-full object-contain bg-[#120f1d]"
                                        onError={(e) => {
                                            e.target.src = "/images/placeholder.jpg";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col xl:pl-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="mb-5 flex flex-wrap gap-2">
                            {product.category_name ? <Link href={`/products?category=${encodeURIComponent(product.category_id || "")}`} className="rounded-full border border-[#b48a3c]/35 bg-[#b48a3c]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] transition hover:border-[#d4af37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]">{product.category_name}</Link> : null}
                            {product.collection_name ? <Link href={`/products?search=${encodeURIComponent(product.collection_name)}`} className="rounded-full border border-stone-700 bg-stone-900/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300 transition hover:border-stone-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]">{product.collection_name}</Link> : null}
                        </div>

                        {/* Name */}
                        <h1 className="mb-6 text-[clamp(1.75rem,3.8vw,3.6rem)] font-serif text-white leading-[1.12] break-words">
                            {product.name}
                        </h1>

                        {/* Divider */}
                        <div className="w-12 h-[1px] bg-[#b48a3c]/50 mb-6" />

                        {product.description ? <p className="mb-7 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">{product.description}</p> : <p className="mb-7 max-w-xl text-sm leading-7 text-stone-400">A carefully chosen dance jewellery piece, finished to complement your performance and celebration wardrobe.</p>}

                        <a href="#reviews" className="mb-7 inline-flex w-fit items-center gap-3 rounded-full border border-stone-800 bg-[#161022] px-4 py-2 text-sm transition hover:border-[#b48a3c]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4af37]">
                            <RatingStars value={averageRating} size="sm" />
                            <span className="text-stone-200">{reviewCount ? `${averageRating.toFixed(1)} · ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}` : "No reviews yet"}</span>
                            <span className="text-[#d4af37]">Read reviews</span>
                        </a>

                        {/* Price */}
                        <div className="mb-8">
                            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-2">Price</p>
                            <p className="text-[clamp(1.6rem,2.8vw,2.35rem)] text-[#b48a3c] font-medium tabular-nums">
                                {canBuy ? `₹${Number(product.price).toLocaleString("en-IN")}` : "Price on request"}
                            </p>
                        </div>

                        <div className="mb-8 grid gap-3 rounded-2xl border border-stone-800/80 bg-[#161022]/80 p-4 sm:grid-cols-2">
                          <div>
                            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-2">Availability</p>
                            <p
                                className={`text-sm font-medium ${product.stock_qty > 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {product.stock_qty > 0
                                    ? "Available to order"
                                    : "Out of Stock"}
                            </p>
                          </div><div><p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-2">Order with confidence</p><p className="text-sm text-stone-200">Secure checkout · Carefully packed for your occasion</p></div>
                        </div>

                        {canBuy ? <ProductActions product={product} /> : null}
                        {canEnquire ? <button type="button" onClick={() => setIsEnquiryOpen(true)} className="mb-6 flex w-full items-center justify-center gap-3 px-6 py-4 border border-stone-700 text-stone-200 font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:border-[#b48a3c] hover:text-[#d4af37] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.9 9.9 0 0 1-4.255-.949L3 20l1.16-3.479A7.72 7.72 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" /></svg>Ask About This Product</button> : null}

                        <Link
                            href="/products"
                            className="w-full text-center px-6 py-4 border border-[#b48a3c]/30 text-[#b48a3c] font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-[#b48a3c]/10 active:bg-[#b48a3c]/20 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </section>

            {/* Customer Reviews */}
            <ProductReviews productId={product.id} />
            {canEnquire ? <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} productId={product.id} productName={product.name} /> : null}

            <RelatedProductSection product={product} />
        </main>
    );
}
