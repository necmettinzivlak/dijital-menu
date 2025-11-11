'use client';

import { useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { getApiUrl, appConfig } from '../config/app.config';
import { useAuthStore } from '../store/authStore';

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRestaurantModal({ isOpen, onClose, onSuccess }: AddRestaurantModalProps) {
  const { userId } = useAuthStore();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Restoran adı gereklidir');
      return;
    }

    if (!userId) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiUrl('/api/restaurants/add');
      console.log('[AddRestaurantModal] API URL:', apiUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            ownerId: userId,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[AddRestaurantModal] API Response:', data);

        // Başarılı - formu temizle ve modal'ı kapat
        setName('');
        onSuccess();
        onClose();
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          console.error('[AddRestaurantModal] API timeout');
          throw new Error('İstek zaman aşımına uğradı');
        }

        throw fetchError;
      }
    } catch (err: any) {
      console.error('[AddRestaurantModal] Restoran eklenirken hata:', err);
      setError(err.message || 'Restoran eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-black rounded-2xl shadow-xl border border-black/10 dark:border-white/10 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-2xl font-bold text-black dark:text-white transition-colors duration-200">
            Yeni Restoran Ekle
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Kapat"
          >
            <HiXMark className="h-5 w-5 text-black dark:text-white transition-colors duration-200" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="restaurant-name" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
              Restoran Adı
            </label>
            <input
              id="restaurant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Örn: Tarihi Ahmet Kebab Evi"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
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

