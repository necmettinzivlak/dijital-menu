'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HiArrowLeft, HiQrCode, HiXMark } from 'react-icons/hi2';
import { getRestaurantMenuUrl, appConfig } from '../config/app.config';
import { MenuItem } from '../components/MenuItem';
import { QRCode } from '../components/QRCode';

// API'den gelen item formatı
interface ApiMenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  restaurantId: string;
  imageUrl?: string;
  order: number;
}

// UI'da kullanılan format
interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
  items: MenuItemData[];
}

interface MenuData {
  categories: Category[];
}

// API'den gelen array'i category'lere göre grupla
function transformApiDataToMenuData(apiItems: ApiMenuItem[]): MenuData {
  // Category'lere göre grupla
  const categoryMap = new Map<string, MenuItemData[]>();
  
  apiItems.forEach((item) => {
    const categoryName = item.category || 'Diğer';
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    
    const menuItem: MenuItemData = {
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      order: item.order,
    };
    
    categoryMap.get(categoryName)!.push(menuItem);
  });
  
  // Category'leri oluştur ve order'a göre sırala
  const categories: Category[] = Array.from(categoryMap.entries()).map(
    ([categoryName, items], index) => ({
      id: `category-${index}`,
      name: categoryName,
      items: items.sort((a, b) => a.order - b.order),
    })
  );
  
  return { categories };
}

export default function RestaurantMenu() {
  const params = useParams();
  const router = useRouter();
  const restaurantName = params.restaurant as string;
  
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // QR kod için mevcut sayfa URL'si
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrCodeUrl(window.location.href);
    }
  }, []);

  // Restoran adını formatla (ilk harfleri büyük yap)
  const formattedName = restaurantName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    setMounted(true);
    
    // API çağrısı
    const fetchMenu = async () => {
      try {
        setLoading(true);
        
        const apiUrl = getRestaurantMenuUrl(restaurantName);
        console.log('[RestaurantMenu] API URL:', apiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);
        
        try {
          const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const apiData: ApiMenuItem[] = await response.json();
          console.log('[RestaurantMenu] API Response:', apiData);
          
          // API formatını UI formatına dönüştür
          const transformedData = transformApiDataToMenuData(apiData);
          console.log('[RestaurantMenu] Transformed Data:', transformedData);
          
          setMenuData(transformedData);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            console.error('[RestaurantMenu] API timeout');
            throw new Error('İstek zaman aşımına uğradı');
          }
          
          throw fetchError;
        }
      } catch (error) {
        console.error('[RestaurantMenu] Menü yüklenirken hata:', error);
        // Hata durumunda boş menü göster
        setMenuData({ categories: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantName]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5">
            <button
              onClick={() => router.push('/')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
              aria-label="Geri dön"
            >
              <HiArrowLeft className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
            </button>
            <div className="flex-1">
              <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="mt-2 h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!menuData || menuData.categories.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5">
            <button
              onClick={() => router.push('/')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
              aria-label="Geri dön"
            >
              <HiArrowLeft className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white transition-colors duration-200">
                {formattedName}
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">Menü bulunamadı</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">Bu restoran için henüz menü eklenmemiş.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5 animate-fade-in">
          <button
            onClick={() => router.push('/')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
            aria-label="Geri dön"
          >
            <HiArrowLeft className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white transition-colors duration-200 animate-slide-up">
              {restaurantName === '691399056e02650c405d7782' ? 'Ahmet Kebab Evi' : restaurantName}
            </h1>
            <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400 transition-colors duration-200 animate-slide-up animation-delay-100">
              Menü
            </p>
          </div>
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
            aria-label="QR Kod Göster"
          >
            <HiQrCode className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
          </button>
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
            <div className="relative bg-white dark:bg-black rounded-2xl shadow-xl border border-black/10 dark:border-white/10 p-8 max-w-md w-full animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  QR Kod
                </h2>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-200"
                  aria-label="Kapat"
                >
                  <HiXMark className="h-5 w-5 text-black dark:text-white" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <QRCode value={qrCodeUrl} size={256} />
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                  Bu QR kodu tarayarak menüyü paylaşabilirsiniz
                </p>
                <div className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 break-all text-center">
                    {qrCodeUrl}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Categories */}
        <div className="space-y-16">
          {menuData.categories.map((category, categoryIndex) => (
            <div 
              key={category.id} 
              className="scroll-mt-8 animate-fade-in"
              style={{ animationDelay: `${categoryIndex * 100}ms` }}
            >
              <div className="mb-8 flex items-center gap-3 animate-slide-up">
                <div className="h-px flex-1 bg-black/5 dark:bg-white/5 animate-expand" />
                <h2 className="text-2xl font-bold text-black dark:text-white transition-colors duration-200 px-4">
                  {category.name}
                </h2>
                <div className="h-px flex-1 bg-black/5 dark:bg-white/5 animate-expand" />
              </div>
              
              <div className="grid gap-4 sm:gap-5">
                {category.items.map((item, itemIndex) => (
                  <MenuItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    imageUrl={item.imageUrl}
                    order={item.order}
                    index={itemIndex}
                    categoryIndex={categoryIndex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

