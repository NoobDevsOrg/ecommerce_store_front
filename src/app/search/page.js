"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "../../components/product/ProductCard";
import { getPublicProducts } from "../../lib/publicApi";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      setProducts([]);
      try {
        if (!query) {
          return;
        }
        const data = await getPublicProducts(1, 40, query);
        const list = Array.isArray(data?.products) ? data.products : [];
        if (!cancelled) setProducts(list);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to fetch search results");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchResults();
    return () => { cancelled = true; };
  }, [query]);

  return (
    <main className="bg-[#0f0a1a] min-h-screen py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-white">Search results for &quot;{query}&quot;</h1>
          <button onClick={() => router.push("/products")} className="text-sm text-[#b48a3c] font-bold">Back to products</button>
        </div>

        {isLoading ? (
          <p className="text-stone-400">Searching...</p>
        ) : error ? (
          <p className="text-rose-400">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-stone-400">No results found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0f0a1a]" />}>
      <SearchPageContent />
    </Suspense>
  );
}
