"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToCart } from "../../../store/cartStore";
import ProductReviews from "../../../components/product/ProductReviews";

<<<<<<< HEAD
export default function ProductDetailPage({ product }) {
    // The detailed public Product response exposes `images` as Product Image
    // records. `image_urls` intentionally contains only strings, so it cannot
    // provide React keys or preserve the selected Product Image identity.
    const images = (Array.isArray(product.images) ? product.images : [])
        .filter((image) => image?.id && image?.url)
        .filter((image, index, allImages) =>
            allImages.findIndex((candidate) => candidate.id === image.id) === index
        );
=======
export default function ProductDetailPage({ product }) {
    const images = product.image_urls || [];
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
    const primaryImage = images.find((image) => image.is_primary) || images[0];

    const [selectedImageId, setSelectedImageId] = useState(primaryImage?.id ?? null);
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isTouchDevice, setIsTouchDevice] = useState(false);

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
<<<<<<< HEAD
                            <img
                                src={selectedImage?.url}
                                alt={selectedImage?.alt_text || product.name}
=======
                            <img
                                src={selectedImage?.url}
                                alt={product.name}
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
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
<<<<<<< HEAD
                                    aria-label={`View ${image.alt_text || `${product.name} image`}`}
=======
                                    aria-label={`View image ${image.id}`}
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
                                    aria-pressed={selectedImageId === image.id}
                                    className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-colors ${selectedImageId === image.id
                                            ? "border-[#b48a3c]"
                                            : "border-stone-800/50 hover:border-stone-700 active:border-stone-600"
                                        }`}
                                >
<<<<<<< HEAD
                                    <img
                                        src={image.url}
                                        alt={image.alt_text || product.name}
=======
                                    <img
                                        src={image.url}
                                        alt="Product"
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
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
                        {/* Category */}
                        {product.category_name && (
                            <span className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#b48a3c] font-bold">
                                {product.category_name}
                            </span>
                        )}

                        {/* Name */}
                        <h1 className="mb-6 text-[clamp(1.75rem,3.8vw,3.6rem)] font-serif text-white leading-[1.12] break-words">
                            {product.name}
                        </h1>

                        {/* Divider */}
                        <div className="w-12 h-[1px] bg-[#b48a3c]/50 mb-6" />

                        {/* Price */}
                        <div className="mb-8">
                            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-2">Price</p>
                            <p className="text-[clamp(1.6rem,2.8vw,2.35rem)] text-[#b48a3c] font-medium tabular-nums">
                                ₹{product.price?.toLocaleString("en-IN")}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-8">
                            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-2">Availability</p>
                            <p
                                className={`text-sm font-medium ${product.stock_qty > 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {product.stock_qty > 0
                                    ? `In Stock (${product.stock_qty} available)`
                                    : "Out of Stock"}
                            </p>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock_qty <= 0}
                            className="w-full mb-6 px-6 py-4 bg-[#b48a3c] text-[#0f0a1a] font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-[#d4af37] active:bg-[#c49a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {product.stock_qty > 0 ? "Add to Collection" : "Out of Stock"}
                        </button>

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

            {/* Related Products (Optional) */}
            <section className="border-t border-stone-900/50 px-[clamp(1rem,2.5vw,2rem)] py-[clamp(2rem,5vw,5rem)]">
                <div className="mx-auto w-full max-w-[min(1700px,96vw)]">
                    <h2 className="text-2xl md:text-3xl font-serif text-white mb-8 md:mb-12">
                        You May Also <span className="text-stone-500 font-light italic">Like</span>
                    </h2>
                    <p className="text-stone-400 text-center py-8">
                        More related products coming soon...
                    </p>
                </div>
            </section>
        </main>
    );
}
