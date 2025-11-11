'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiArrowLeft, HiBuildingStorefront, HiPlus, HiTrash, HiPencil } from 'react-icons/hi2';
import { getUserRestaurantsUrl, appConfig } from '../config/app.config';
import { useAuthStore } from '../store/authStore';
import { AddRestaurantModal } from '../components/AddRestaurantModal';

interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  slug?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const { token, userId, isAuthenticated, logout } = useAuthStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Restoranları çekme fonksiyonu
  const fetchRestaurants = async () => {
    if (!userId) {
      console.warn('[AdminPanel] UserId yok, restoranlar çekilemiyor');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // /api/restaurants/user/{userId} endpoint'ini kullan
      const apiUrl = getUserRestaurantsUrl(userId);
      console.log('[AdminPanel] Restoranlar çekiliyor...');
      console.log('[AdminPanel] UserId:', userId);
      console.log('[AdminPanel] API URL:', apiUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);
      
      // Headers oluştur - token varsa ekle
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          signal: controller.signal,
          headers,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - token geçersiz
            console.error('[AdminPanel] Unauthorized - token geçersiz');
            logout();
            router.push('/login');
            return;
          }
          const errorText = await response.text();
          console.error('[AdminPanel] API Error:', response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: Restaurant[] = await response.json();
        console.log('[AdminPanel] Restoranlar başarıyla çekildi:', data);
        console.log('[AdminPanel] Toplam restoran sayısı:', data.length);
        
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('[AdminPanel] API timeout');
          throw new Error('İstek zaman aşımına uğradı');
        }
        
        throw fetchError;
      }
    } catch (err: any) {
      console.error('[AdminPanel] Restoranlar yüklenirken hata:', err);
      setError(err.message || 'Restoranlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Mounted olduktan sonra auth kontrolü yap
    if (!mounted) return;
    
    // Zustand persist middleware yüklendikten sonra kontrol et
    // Sadece userId kontrolü yeterli, token zorunlu değil
    if (!userId) {
      console.log('[AdminPanel] UserId yok, login sayfasına yönlendiriliyor', { isAuthenticated, userId, token });
      router.push('/login');
      return;
    }
    
    // Restoranları çek
    fetchRestaurants();
  }, [mounted, router, userId, token, logout]);

  const handleRestaurantAdded = () => {
    // Restoran eklendikten sonra listeyi yenile
    fetchRestaurants();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5">
            <div className="h-11 w-11 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5">
            <button
              onClick={() => router.push('/')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
              aria-label="Ana sayfa"
            >
              <HiArrowLeft className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white transition-colors duration-200">
                Admin Panel
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5 animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
              aria-label="Ana sayfa"
            >
              <HiArrowLeft className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
            </button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white transition-colors duration-200 animate-slide-up">
                Admin Panel
              </h1>
              <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400 transition-colors duration-200 animate-slide-up animation-delay-100">
                Restoranlarınızı yönetin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200"
            >
              Çıkış Yap
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <HiPlus className="h-5 w-5" />
              <span>Yeni Restoran</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">{error}</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <HiBuildingStorefront className="h-16 w-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
              Henüz restoran yok
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              İlk restoranınızı ekleyerek başlayın
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <HiPlus className="h-5 w-5" />
              <span>Yeni Restoran Ekle</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant._id}
                className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 transition-all duration-500 hover:border-black/10 hover:shadow-xl hover:scale-[1.02] dark:border-white/5 dark:bg-black dark:hover:border-white/10 dark:hover:shadow-[0_8px_32px_rgba(255,255,255,0.08)] animate-slide-up opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                {/* Restaurant Image */}
                {restaurant.imageUrl && (
                  <div className="relative mb-4 h-32 w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Restaurant Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-black dark:text-white transition-colors duration-200 mb-1">
                    {restaurant.name}
                  </h3>
                  {restaurant.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                  {restaurant.slug && (
                    <Link
                      href={`/${restaurant.slug}`}
                      className="mt-2 text-sm text-black dark:text-white hover:underline transition-colors duration-200"
                    >
                      /{restaurant.slug}
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                  <Link
                    href={`/${restaurant.slug || restaurant._id}`}
                    className="flex-1 px-3 py-2 text-center text-sm font-medium rounded-lg bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
                  >
                    Görüntüle
                  </Link>
                  <button
                    onClick={() => router.push(`/admin/restaurant/${restaurant._id}`)}
                    className="flex-1 px-3 py-2 text-center text-sm font-medium rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200"
                  >
                    Menü Yönet
                  </button>
                  <button
                    className="p-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    aria-label="Sil"
                  >
                    <HiTrash className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      <AddRestaurantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRestaurantAdded}
      />
    </div>
  );
}

