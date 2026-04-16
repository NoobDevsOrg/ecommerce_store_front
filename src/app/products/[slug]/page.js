"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicProductBySlug } from "../../../lib/publicApi";
import { addToCart } from "../../../store/cartStore";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!slug) return;
    // console.log(slug)

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPublicProductBySlug(slug);
        setProduct(data);
        // const images = data || [];
        // console.log("Fetched product:", data);
        // const cover = images.find((data) => data.is_primary) || images[0];
        // console.log("Selected cover image:", cover);
        if (data?.image_urls?.length > 0) {
          setSelectedImageId(data.image_urls[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err.message || "Product not found");
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="bg-[#0f0a1a] min-h-screen flex items-center justify-center">
        <p className="text-stone-400">Loading product details...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="bg-[#0f0a1a] min-h-screen px-6 py-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center py-16">
            <p className="text-stone-400 mb-6">{error || "Product not found"}</p>
            <Link href="/products" className="text-[#b48a3c] hover:text-[#d4af37] transition-colors">
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const images = product.image_urls || [];
  // const cover = images.find((image) => image.is_primary) || images[0];
  // const gallery = [...images].sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0));
  // const selectedImage = gallery.find((image) => image.id === selectedImageId) || cover || gallery[0] || { url: "/images/placeholder.jpg" };
  const selectedImage = images.find((image) => image.id === selectedImageId) || images[0] || { url: "/images/placeholder.jpg" };

  const handleZoomMove = (event) => {
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
          <div className="flex items-center gap-3 text-sm">
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
              className="relative h-[clamp(320px,52vw,760px)] overflow-hidden rounded-sm bg-[#120f1d] border border-stone-800/60 mb-4 cursor-zoom-in"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleZoomMove}
            >
              <img
                src={selectedImage?.url}
                alt={product.name}
                className={`w-full h-full object-contain ${isZooming ? "scale-[2.5] transition-none" : "scale-100 transition-transform duration-300"}`}
                style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
                onError={(e) => {
                  e.target.src = "/images/placeholder.jpg";
                }}
              />

              {isZooming ? (
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
                  onClick={() => setSelectedImageId(image.id)}
                  className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-colors ${selectedImageId === image.id
                    ? "border-[#b48a3c]"
                    : "border-stone-800/50 hover:border-stone-700"
                    }`}
                >
                  <img
                    src={image.url}
                    alt="Product"
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
            <h1 className="mb-6 text-[clamp(1.75rem,3.8vw,3.6rem)] font-serif text-white leading-[1.12]">
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
              <p className={`text-sm font-medium ${product.stock_qty > 0 ? "text-green-400" : "text-red-400"
                }`}>
                {product.stock_qty > 0 ? `In Stock (${product.stock_qty} available)` : "Out of Stock"}
              </p>
            </div>

            {/* Slug & ID (Debug Info) */}
            {/* <div className="mb-8 p-3 bg-stone-900/30 rounded-sm border border-stone-800/30">
              <p className="text-[10px] text-stone-500">
                <span className="block">ID: {product.id}</span>
                <span className="block">Slug: {product.slug}</span>
              </p>
            </div> */}

            {/* Add to Cart Button */}
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock_qty <= 0}
              className="w-full mb-6 px-6 py-4 bg-[#b48a3c] text-[#0f0a1a] font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock_qty > 0 ? "Add to Collection" : "Out of Stock"}
            </button>

            <Link
              href="/products"
              className="w-full text-center px-6 py-4 border border-[#b48a3c]/30 text-[#b48a3c] font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-[#b48a3c]/10 transition-colors"
            >
              Continue Shopping
            </Link>

            {/* Created Date */}
            {/* {product.created_at && (
              <p className="text-stone-500 text-xs mt-8">
                Added on {new Date(product.created_at).toLocaleDateString("en-IN")}
              </p>
            )} */}
          </div>
        </div>
      </section>

      {/* Related Products (Optional) */}
      <section className="border-t border-stone-900/50 px-[clamp(1rem,2.5vw,2rem)] py-[clamp(2rem,5vw,5rem)]">
        <div className="mx-auto w-full max-w-[min(1700px,96vw)]">
          <h2 className="text-3xl font-serif text-white mb-12">
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
