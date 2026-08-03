# Puantaj Uygulaması

Expo (React Native) + Supabase ile yazılmış, konum doğrulamalı giriş/çıkış
takibi yapan mobil puantaj uygulaması. Çalışanlar mesaiye başlar/biter,
yöneticiler tüm ekibin aylık özetini görür.

## Özellikler

- E-posta/şifre ile giriş (Supabase Auth)
- GPS konumu ile giriş/çıkış (mesai başlangıç/bitiş) kaydı
- Kullanıcının kendi geçmiş mesai kayıtları
- Yönetici paneli: tüm çalışanların aylık toplam çalışma saati özeti
- Row Level Security (RLS): her çalışan sadece kendi verisini görür,
  yöneticiler hepsini görür

## Klasör Yapısı

```
app/                  # Expo Router ekranları
  (auth)/login.tsx     # Giriş ekranı
  (tabs)/home.tsx       # Mesai başlat/bitir
  (tabs)/history.tsx    # Kendi geçmişi
  (tabs)/admin.tsx      # Yönetici raporu (sadece role=admin)
src/
  lib/supabase.ts       # Supabase client
  hooks/useAuth.tsx      # Oturum/profil context'i
  types/database.ts      # TypeScript tipleri
supabase/
  schema.sql             # Veritabanı tabloları + güvenlik politikaları
```

## Kurulum

### 1. Supabase Projesi Oluşturun

1. [supabase.com](https://supabase.com) üzerinden ücretsiz bir proje açın.
2. Proje panelinde **SQL Editor**'e girin, `supabase/schema.sql`
   dosyasının tüm içeriğini yapıştırıp **Run** butonuna basın.
3. **Project Settings > API** sayfasından `Project URL` ve `anon public
   key` değerlerini kopyalayın.

### 2. Ortam Değişkenleri

Proje kök dizininde `.env.example` dosyasını `.env` olarak kopyalayıp
kendi Supabase bilgilerinizi girin:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Bağımlılıkları Yükleyin ve Çalıştırın

```bash
npm install
npx expo start
```

Telefonunuza **Expo Go** uygulamasını indirip QR kodu okutarak anında
test edebilirsiniz.

### 4. İlk Kullanıcıları Oluşturma

Supabase Dashboard > **Authentication > Users > Add User** kısmından
çalışanlar için e-posta/şifre ile kullanıcı oluşturun. Yeni kullanıcı
otomatik olarak `employee` rolüyle bir profil kaydı alır.

Bir kullanıcıyı yönetici yapmak için SQL Editor'de:

```sql
update public.profiles set role = 'admin' where id = '<kullanıcının-uuid-si>';
```

(UUID'yi Authentication > Users listesinden kopyalayabilirsiniz.)

## GitHub'a Yükleme

```bash
git init
git add .
git commit -m "İlk sürüm: Puantaj uygulaması"
git branch -M main
git remote add origin https://github.com/<kullanici-adiniz>/puantaj-app.git
git push -u origin main
```

`.env` dosyanız `.gitignore` içinde olduğu için Supabase anahtarlarınız
GitHub'a yüklenmez — her klonlayan kendi `.env` dosyasını oluşturmalıdır.

## Play Store'a Yükleme (APK/AAB Üretimi)

Bu proje **EAS Build** ile Google Play'e yüklenebilir bir `.aab` dosyası
üretebilir:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production
```

Build tamamlandığında EAS size bir indirme linki verir. Bu `.aab`
dosyasını [Google Play Console](https://play.google.com/console)
üzerinden (bir kereye mahsus geliştirici hesabı ücreti ile) yeni bir
uygulama olarak yükleyebilirsiniz.

`app.json` içindeki `android.package` değerini kendi paket adınızla
(örn. `com.sirketiniz.puantaj`) güncellemeyi unutmayın — bu değer Play
Store'da uygulamanızın benzersiz kimliğidir ve sonradan değiştirilemez.

## Notlar / Sonraki Adımlar

- Şu an yönetici çalışan ekleyemiyor (Supabase panelinden manuel
  ekleniyor); isterseniz uygulama içine "çalışan davet et" ekranı
  eklenebilir.
- Aylık rapor şu an sadece toplam süre gösteriyor; Excel/CSV dışa aktarma
  eklenebilir.
- Konum, sadece giriş/çıkış anında bir kez alınıyor (sürekli takip
  yapılmıyor) — gizlilik açısından tercih edildi.
