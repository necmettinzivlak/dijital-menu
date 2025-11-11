'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';
import { getApiUrl, appConfig } from '../../../../config/app.config';
import { useAuthStore } from '../../../../store/authStore';

export default function AddMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const { token } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Ürün adı gereklidir');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Geçerli bir fiyat giriniz');
      return;
    }

    if (!formData.category.trim()) {
      setError('Kategori gereklidir');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiUrl('/api/menu/add');
      console.log('[AddMenuItem] API URL:', apiUrl);

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
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            price: parseFloat(formData.price),
            category: formData.category.trim(),
            restaurantId: restaurantId,
            imageUrl: formData.imageUrl.trim() || undefined,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[AddMenuItem] API Response:', data);

        // Başarılı - menü yönetim sayfasına dön
        router.push(`/admin/restaurant/${restaurantId}`);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          console.error('[AddMenuItem] API timeout');
          throw new Error('İstek zaman aşımına uğradı');
        }

        throw fetchError;
      }
    } catch (err: any) {
      console.error('[AddMenuItem] Menü öğesi eklenirken hata:', err);
      setError(err.message || 'Menü öğesi eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5 animate-fade-in">
          <button
            onClick={() => router.push(`/admin/restaurant/${restaurantId}`)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
            aria-label="Geri dön"
          >
            <HiArrowLeft className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white transition-colors duration-200 animate-slide-up">
              Yeni Menü Öğesi Ekle
            </h1>
            <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400 transition-colors duration-200 animate-slide-up animation-delay-100">
              Restoran ID: {restaurantId}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Örn: Adana Kebap"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Ürün açıklaması..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
                    Fiyat (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Örn: Kebap, Salata, İçecek"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
                  Resim URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Right Column - Image Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <label className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
                  Resim Önizleme
                </label>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 group">
                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Önizleme"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm px-4 text-center';
                            errorDiv.textContent = 'Resim yüklenemedi. Lütfen geçerli bir URL giriniz.';
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm px-4 text-center">
                      Resim URL giriniz
                    </div>
                  )}
                </div>
                {formData.imageUrl && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    Resim URL'si girildiğinde önizleme görünecektir
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => router.push(`/admin/restaurant/${restaurantId}`)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.price || !formData.category.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-black text-white font-medium transition-all duration-200 hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

