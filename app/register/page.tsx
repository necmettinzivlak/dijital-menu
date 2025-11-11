'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { getRegisterUrl, appConfig } from '../config/app.config';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const apiUrl = getRegisterUrl();
      console.log('[Register] API URL:', apiUrl);
      
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
        console.log('[Register] API Response:', data);
        
        // id kontrolü - id yoksa hata
        if (!data.id) {
          throw new Error('Kayıt başarısız. Kullanıcı bilgisi alınamadı.');
        }
        
        // Başarılı kayıt
        setSuccess(true);
        
        // Zustand store'a kaydet
        setAuth(data.token || null, data.id, data.email || email);
        console.log('[Register] Auth bilgileri store\'a kaydedildi');
        
        // 2 saniye sonra admin paneline yönlendir
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('[Register] API timeout');
          throw new Error('İstek zaman aşımına uğradı');
        }
        
        throw fetchError;
      }
    } catch (err: any) {
      console.error('[Register] Kayıt hatası:', err);
      setError(err.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-black dark:text-white transition-colors duration-200 mb-2">
            Kayıt Ol
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
            Yeni hesap oluşturun
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">
                Kayıt başarılı! Yönlendiriliyorsunuz...
              </p>
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

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-lg bg-black text-white font-medium transition-all duration-200 hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? 'Kayıt yapılıyor...' : success ? 'Kayıt başarılı!' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
            Zaten hesabınız var mı?{' '}
            <Link
              href="/login"
              className="font-medium text-black dark:text-white hover:underline transition-colors duration-200"
            >
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

