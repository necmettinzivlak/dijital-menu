'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { getLoginUrl, appConfig } from '../config/app.config';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { userId, isAuthenticated } = useAuthStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Eğer zaten giriş yapılmışsa admin paneline yönlendir
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Mounted olduktan sonra kontrol et
    if (!mounted) return;
    
    // Zustand persist middleware yüklendikten sonra kontrol et
    // Sadece userId varsa yeterli, token zorunlu değil
    if (userId) {
      console.log('[Login] Zaten giriş yapılmış, admin paneline yönlendiriliyor', { userId, isAuthenticated });
      router.push('/admin');
    }
  }, [mounted, userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = getLoginUrl();
      console.log('[Login] API URL:', apiUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[Login] API Response:', data);
        
        // id kontrolü - id yoksa hata
        if (!data.id) {
          throw new Error('Giriş başarısız. Kullanıcı bilgisi alınamadı.');
        }
        
        // Zustand store'a kaydet
        setAuth(data.token || null, data.id, data.email || email);
        console.log('[Login] Auth bilgileri store\'a kaydedildi');
        
        // Başarılı login sonrası admin paneline yönlendirme
        router.push('/admin');
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('[Login] API timeout');
          throw new Error('İstek zaman aşımına uğradı');
        }
        
        throw fetchError;
      }
    } catch (err: any) {
      console.error('[Login] Giriş hatası:', err);
      setError(err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-black dark:text-white transition-colors duration-200 mb-2">
            Giriş Yap
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
            Hesabınıza giriş yapın
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
              E-posta
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiEnvelope className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-200">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiLockClosed className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3 rounded-lg border border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none transition-all duration-200 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors duration-200"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? (
                  <HiEyeSlash className="h-5 w-5" />
                ) : (
                  <HiEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-black/20 text-black focus:ring-black dark:border-white/20 dark:focus:ring-white transition-colors duration-200"
              />
              <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
                Beni hatırla
              </span>
            </label>
            <a
              href="#"
              className="text-sm font-medium text-black dark:text-white hover:underline transition-colors duration-200"
            >
              Şifremi unuttum
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-black text-white font-medium transition-all duration-200 hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
            Hesabınız yok mu?{' '}
            <Link
              href="/register"
              className="font-medium text-black dark:text-white hover:underline transition-colors duration-200"
            >
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

