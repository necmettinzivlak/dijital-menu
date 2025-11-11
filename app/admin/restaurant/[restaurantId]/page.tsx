'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HiArrowLeft, HiPlus, HiPencil, HiTrash } from 'react-icons/hi2';
import { getRestaurantMenuUrl, appConfig, getApiUrl } from '../../../config/app.config';
import { useAuthStore } from '../../../store/authStore';

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
  category: string;
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
      category: item.category,
    };
    
    categoryMap.get(categoryName)!.push(menuItem);
  });
  
  const categories: Category[] = Array.from(categoryMap.entries()).map(
    ([categoryName, items], index) => ({
      id: `category-${index}`,
      name: categoryName,
      items: items.sort((a, b) => a.order - b.order),
    })
  );
  
  return { categories };
}

export default function AdminRestaurantMenu() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const { token } = useAuthStore();
  
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItemData>>({});

  useEffect(() => {
    setMounted(true);
    
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError('');
        
        const apiUrl = getRestaurantMenuUrl(restaurantId);
        console.log('[AdminRestaurantMenu] API URL:', apiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
          const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers,
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const apiData: ApiMenuItem[] = await response.json();
          console.log('[AdminRestaurantMenu] API Response:', apiData);
          
          const transformedData = transformApiDataToMenuData(apiData);
          setMenuData(transformedData);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            throw new Error('İstek zaman aşımına uğradı');
          }
          
          throw fetchError;
        }
      } catch (err: any) {
        console.error('[AdminRestaurantMenu] Menü yüklenirken hata:', err);
        setError(err.message || 'Menü yüklenirken bir hata oluştu.');
        setMenuData({ categories: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId, token]);

  const handleEdit = (item: MenuItemData) => {
    setEditingItem(item.id);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
    });
  };

  const handleSave = async (itemId: string) => {
    try {
      const apiUrl = getApiUrl(`/api/menu/${itemId}`);
      console.log('[AdminRestaurantMenu] Update API URL:', apiUrl);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Başarılı - menüyü yeniden yükle
      window.location.reload();
    } catch (err: any) {
      console.error('[AdminRestaurantMenu] Güncelleme hatası:', err);
      alert('Güncelleme başarısız: ' + err.message);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Bu menü öğesini silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      const apiUrl = getApiUrl(`/api/menu/${itemId}`);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Başarılı - menüyü yeniden yükle
      window.location.reload();
    } catch (err: any) {
      console.error('[AdminRestaurantMenu] Silme hatası:', err);
      alert('Silme başarısız: ' + err.message);
    }
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
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
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

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5 animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
              aria-label="Geri dön"
            >
              <HiArrowLeft className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
            </button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white transition-colors duration-200 animate-slide-up">
                Menü Yönetimi
              </h1>
              <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400 transition-colors duration-200 animate-slide-up animation-delay-100">
                Restoran ID: {restaurantId}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/restaurant/${restaurantId}/add-item`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <HiPlus className="h-5 w-5" />
            <span>Yeni Öğe Ekle</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Menu Categories */}
        {!menuData || menuData.categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Henüz menü öğesi yok</p>
            <button
              onClick={() => router.push(`/admin/restaurant/${restaurantId}/add-item`)}
              className="mt-4 flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200"
            >
              <HiPlus className="h-5 w-5" />
              <span>İlk Öğeyi Ekle</span>
            </button>
          </div>
        ) : (
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
                
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 transition-all duration-500 hover:border-black/10 hover:shadow-xl dark:border-white/5 dark:bg-black dark:hover:border-white/10 animate-slide-up opacity-0 animate-fade-in-up"
                      style={{
                        animationDelay: `${(categoryIndex * 100) + (itemIndex * 50)}ms`,
                        animationFillMode: 'forwards',
                      }}
                    >
                      {editingItem === item.id ? (
                        // Edit Form
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                              Ad
                            </label>
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                              Açıklama
                            </label>
                            <textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                Fiyat
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.price || ''}
                                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                Kategori
                              </label>
                              <input
                                type="text"
                                value={editForm.category || ''}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                              Resim URL
                            </label>
                            <input
                              type="url"
                              value={editForm.imageUrl || ''}
                              onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white"
                              placeholder="https://example.com/image.jpg"
                            />
                            {editForm.imageUrl && (
                              <div className="mt-3 relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10">
                                <img
                                  src={editForm.imageUrl}
                                  alt="Önizleme"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.error-message')) {
                                      const errorDiv = document.createElement('div');
                                      errorDiv.className = 'error-message flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm px-4 text-center';
                                      errorDiv.textContent = 'Resim yüklenemedi';
                                      parent.appendChild(errorDiv);
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(item.id)}
                              className="flex-1 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200"
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex-1 px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="flex items-start gap-6">
                          {item.imageUrl && (
                            <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="text-xl font-semibold text-black dark:text-white">
                                {item.name}
                              </h3>
                              <div className="shrink-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-2xl font-bold text-black dark:text-white">
                                    {item.price.toFixed(0)}
                                  </span>
                                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    ₺
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {item.description && (
                              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-2">
                                {item.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-4">
                              <button
                                onClick={() => handleEdit(item)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
                              >
                                <HiPencil className="h-4 w-4" />
                                <span>Düzenle</span>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                              >
                                <HiTrash className="h-4 w-4" />
                                <span>Sil</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

