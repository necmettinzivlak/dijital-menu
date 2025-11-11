'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiMagnifyingGlass } from "react-icons/hi2";

export default function Home() {
  const [restaurantName, setRestaurantName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurantName.trim()) {
      router.push(`/${restaurantName.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans dark:bg-black transition-colors duration-200">
        <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-8 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-black dark:text-white transition-colors duration-200">
              Dijital Menü
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
              Restoran menüsünü görüntülemek için restoran adını girin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Örn: ahmetkebabevi"
                  className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 pl-12 text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20"
                />
                <HiMagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-black px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-zinc-800 hover:scale-105 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Git
              </button>
            </div>
          </form>
        </main>
      </div>
  );
}
