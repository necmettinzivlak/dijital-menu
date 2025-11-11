// Uygulama yapılandırma dosyası
export const appConfig = {
  // API ayarları
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ahmetburakbackend.dileksoft.comhttp://185.169.180.64:5001',
    timeout: 10000, // 10 saniye
    endpoints: {
      restaurantMenu: (restaurantId: string) => 
        `/api/menu/${restaurantId}`,
      restaurants: (userId: string) => 
        `/api/restaurants/user/${userId}`,
      login: '/api/auth/login',
      register: '/api/auth/register',
    },
  },
  
  // Uygulama ayarları
  app: {
    name: 'Dijital Menü',
    version: '1.0.0',
    defaultTheme: 'light' as 'light' | 'dark',
  },
  
  // UI ayarları
  ui: {
    animationDuration: 300,
    transitionDuration: 200,
  },
} as const;

// API URL helper fonksiyonu
export function getApiUrl(endpoint: string): string {
  const baseUrl = appConfig.api.baseUrl.replace(/\/$/, ''); // Trailing slash'i kaldır
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// Restaurant menü endpoint'i
export function getRestaurantMenuUrl(restaurantId: string): string {
  return getApiUrl(appConfig.api.endpoints.restaurantMenu(restaurantId));
}

// Login endpoint'i
export function getLoginUrl(): string {
  return getApiUrl(appConfig.api.endpoints.login);
}

// Register endpoint'i
export function getRegisterUrl(): string {
  return getApiUrl(appConfig.api.endpoints.register);
}

// User restaurants endpoint'i
export function getUserRestaurantsUrl(userId: string): string {
  return getApiUrl(appConfig.api.endpoints.restaurants(userId));
}

