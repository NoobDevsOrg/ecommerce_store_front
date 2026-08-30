"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "../../components/product/ProductCard";
import { getPublicProducts } from "../../lib/publicApi";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") || "");
    }
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!query) {
          setProducts([]);
          return;
        }
        const data = await getPublicProducts(1, 40, query);
        const list = Array.isArray(data?.products) ? data.products : [];
        setProducts(list);
      } catch (err) {
        setError(err?.message || "Failed to fetch search results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <main className="bg-[#0f0a1a] min-h-screen py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-white">Search results for "{query}"</h1>
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
