"use client";

import { useEffect, useState } from "react";
import useDebounce from "@/utils/debounce";

interface Product {
  id: string;
  product_name: string;
  price: string;
  description: string;
  image_url: string;
}

interface UserProps {
  user_id: string;
}

export default function ProductList({ user_id }: UserProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const response = await fetch(`${baseUrl}/api/getProducts`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to load products.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToBucket = async (productId: string, userId: string) => {
    console.log("Sending to backend:", {
      product_id: productId,
      user_id: userId,
    });

    try {
      const response = await fetch("/api/bucketItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Product added to bucket:", result.data);
        alert("Product added to your cart!");
      } else {
        console.error("Error:", result.error);
        alert("Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred while adding the product.");
    }
  };

  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  const filteredAndSortedProducts = products
    .filter((product) =>
      product.product_name
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);

      if (sortOrder === "asc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-400">Loading products...</p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="p-4 mt-20">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <select
          onChange={(e) => handleSort(e.target.value as "asc" | "desc")}
          className="ml-4 p-2 border rounded-lg"
        >
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredAndSortedProducts.length > 0 ? (
          filteredAndSortedProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg shadow-md p-4 bg-slate-300 text-slate-700 dark:bg-gray-800 dark:text-white transition-transform hover:scale-105"
            >
              <img
                src={product.image_url}
                alt={`Image of ${product.product_name}`}
                className="w-full h-48 object-cover rounded-md"
              />
              <h2 className="text-xl font-semibold mt-2">
                {product.product_name}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {product.description}
              </p>
              <p className="text-green-500 dark:text-green-400 font-bold mt-1">
                ${product.price}
              </p>

              <button
                className={`w-full text-white bg-orange-600 px-5 py-2 mt-3 rounded-lg transition ${
                  addingToCart === product.id
                    ? "bg-orange-400 cursor-not-allowed"
                    : "hover:bg-orange-700"
                }`}
                onClick={() => addToBucket(product.id, user_id)}
                disabled={addingToCart === product.id}
                aria-busy={addingToCart === product.id}
              >
                {addingToCart === product.id ? "Adding..." : "Add To Cart"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-full">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
