# Dijital Menü 🍽️

Modern ve kullanıcı dostu bir dijital menü uygulaması. Restoranlar için menü yönetimi ve müşteriler için menü görüntüleme platformu.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Entegrasyonu](#api-entegrasyonu)
- [Proje Yapısı](#proje-yapısı)
- [Docker](#docker)
- [Geliştirme](#geliştirme)

## ✨ Özellikler

### 👥 Kullanıcı Özellikleri
- **Menü Görüntüleme**: Restoran menülerini kategorilere göre görüntüleme
- **QR Kod**: Her restoran menüsü için QR kod oluşturma ve paylaşma
- **Tema Desteği**: Siyah/Beyaz tema değiştirme (Dark/Light mode)
- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu
- **Animasyonlar**: Smooth geçişler ve hover efektleri

### 🔐 Admin Özellikleri
- **Kullanıcı Girişi**: Email ve şifre ile giriş yapma
- **Kayıt Olma**: Yeni hesap oluşturma
- **Restoran Yönetimi**: 
  - Restoran ekleme
  - Restoran listeleme
  - Restoran silme
- **Menü Yönetimi**:
  - Menü öğeleri ekleme
  - Menü öğeleri düzenleme
  - Menü öğeleri silme
  - Kategori bazlı organizasyon
- **Görsel Yönetim**: Menü öğeleri için resim URL'i ekleme ve önizleme

## 🛠️ Teknolojiler

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Icons**: React Icons (Heroicons)
- **QR Code**: react-qr-code
- **Language**: TypeScript
- **Package Manager**: npm

## 🚀 Kurulum

### Gereksinimler
- Node.js 20+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd dijital-menu
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın** (opsiyonel)
```bash
# .env.local dosyası oluşturun
NEXT_PUBLIC_API_URL=http://185.169.180.64:5001
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Tarayıcıda açın**
```
http://localhost:3000
```

## 📖 Kullanım

### Müşteri Kullanımı

1. Ana sayfada restoran adını girin (örn: `ahmetkebabevi`)
2. Menüyü görüntüleyin
3. QR kod butonuna tıklayarak QR kodu görüntüleyin ve paylaşın

### Admin Kullanımı

1. **Giriş Yapma**
   - `/login` sayfasına gidin
   - Email ve şifrenizi girin
   - Başarılı giriş sonrası admin paneline yönlendirilirsiniz

2. **Restoran Ekleme**
   - Admin panelinde "Yeni Restoran" butonuna tıklayın
   - Restoran adını girin
   - Kaydedin

3. **Menü Yönetimi**
   - Restoran kartında "Menü Yönet" butonuna tıklayın
   - "Yeni Öğe Ekle" butonu ile menü öğesi ekleyin
   - Mevcut öğeleri düzenleyin veya silin

## 🔌 API Entegrasyonu

### Base URL
```
http://185.169.180.64:5001
```

### Endpoint'ler

#### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı

#### Restaurants
- `GET /api/restaurants/user/{userId}` - Kullanıcının restoranlarını getir
- `POST /api/restaurants/add` - Yeni restoran ekle
  ```json
  {
    "name": "Restoran Adı",
    "ownerId": "userId"
  }
  ```

#### Menu
- `GET /api/menu/{restaurantId}` - Restoran menüsünü getir
- `POST /api/menu/add` - Menü öğesi ekle
  ```json
  {
    "name": "Ürün Adı",
    "description": "Açıklama",
    "price": 50.00,
    "category": "Kategori",
    "restaurantId": "restaurantId",
    "imageUrl": "https://example.com/image.jpg"
  }
  ```
- `PUT /api/menu/{itemId}` - Menü öğesi güncelle
- `DELETE /api/menu/{itemId}` - Menü öğesi sil

### Yapılandırma

API URL'leri `app/config/app.config.ts` dosyasında merkezi olarak yönetilir:

```typescript
export const appConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://185.169.180.64:5001',
    timeout: 10000,
  },
  // ...
};
```

## 📁 Proje Yapısı

```
dijital-menu/
├── app/
│   ├── [restaurant]/          # Dinamik restoran menü sayfası
│   │   └── page.tsx
│   ├── admin/                 # Admin paneli
│   │   ├── page.tsx           # Restoran listesi
│   │   └── restaurant/
│   │       └── [restaurantId]/
│   │           ├── page.tsx   # Menü yönetimi
│   │           └── add-item/
│   │               └── page.tsx # Menü öğesi ekleme
│   ├── components/             # React component'leri
│   │   ├── AddRestaurantModal.tsx
│   │   ├── MenuItem.tsx
│   │   ├── QRCode.tsx
│   │   └── ThemeToggle.tsx
│   ├── config/                 # Yapılandırma dosyaları
│   │   └── app.config.ts
│   ├── login/                  # Giriş sayfası
│   │   └── page.tsx
│   ├── register/               # Kayıt sayfası
│   │   └── page.tsx
│   ├── store/                  # Zustand store'ları
│   │   └── authStore.ts
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Ana sayfa
│   └── globals.css             # Global stiller
├── Dockerfile                  # Docker yapılandırması
├── next.config.ts              # Next.js yapılandırması
└── package.json
```

## 🐳 Docker

### Build
```bash
docker build -t dijital-menu .
```

### Run
```bash
docker run -p 3000:3000 dijital-menu
```

## 🎨 Tema Sistemi

Uygulama siyah/beyaz tema desteği sunar:
- **Light Mode**: Beyaz arka plan, siyah metin
- **Dark Mode**: Siyah arka plan, beyaz metin
- Tema tercihi `localStorage`'da saklanır
- Sistem tercihi otomatik algılanır

Tema değiştirmek için sağ üst köşedeki tema butonunu kullanın.

## 🔒 Authentication

- Zustand ile state management
- `localStorage` ile otomatik kayıt
- Token tabanlı authentication (opsiyonel)
- UserId bazlı yetkilendirme

## 📱 Responsive Tasarım

- **Mobile**: Tek sütun layout
- **Tablet**: 2 sütun grid
- **Desktop**: 3 sütun grid

## 🚢 Production Build

```bash
npm run build
npm start
```

## 📝 Notlar

- API timeout: 10 saniye
- Tüm API çağrıları timeout kontrolü ile yapılır
- Error handling tüm sayfalarda mevcuttur
- Loading state'leri skeleton loader ile gösterilir

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel bir projedir.

## 👨‍💻 Geliştirici

Dijital Menü - Modern restoran menü yönetim sistemi

---

**Not**: API URL'leri ve endpoint'ler `app/config/app.config.ts` dosyasından yönetilir. Production ortamında environment variable kullanılması önerilir.
