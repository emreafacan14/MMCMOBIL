# MMCard — Dijital Kartvizit

MMCardSystem backend'ine bağlanan premium dijital kartvizit mobil uygulaması.

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Expo SDK 57 · React Native 0.86 (New Architecture) |
| Dil | TypeScript strict (`noUncheckedIndexedAccess`, `noUncheckedIndexedAccess`, `any` yasak) |
| Routing | Expo Router (dosya tabanlı) |
| Stil | NativeWind v4 + StyleSheet karışımı, koyu tema |
| Animasyon | Reanimated 4 + Gesture Handler (60fps, basış ölçekleme) |
| Sunucu state | TanStack Query v5 (`hooks/queries/`) |
| Global state | Zustand (auth → SecureStore, settings → AsyncStorage) |
| Klavye | react-native-keyboard-controller (KeyboardAwareScrollView / KeyboardStickyView) |

> **Not:** Prompt'ta Reanimated 3 istendi; SDK 57'nin eşleşen sürümü **Reanimated 4.5.1**'dir ve `react-native-worklets` zorunlu peer bağımlılığıdır. Kullanılan API'ler iki sürümde de aynıdır.

## Kurulum

```bash
npm install --legacy-peer-deps   # react-dom peer çakışması için gerekli
```

`.env.example` → `.env` kopyala. Uygulama aşağıdaki API adresini kullanır:

```dotenv
EXPO_PUBLIC_API_URL=https://mmcard.rascal.com.tr
```

## Çalıştırma

```bash
npx expo start                          # Metro (Expo Go / dev client)
npx expo run:android                    # native dev build derle + kur
npx expo run:android --device <model>   # belirli USB cihaza
npx tsc --noEmit                        # tip kontrolü
```

## Yapı

```
src/app/            Ekranlar (Expo Router): (auth), (tabs), card, activate, public, my-info, support, about
src/components/ui/  UI kit: GlassCard, PremiumButton, Skeleton, TextField, OtpInput, ScreenHeader...
src/services/       axios client (token refresh, ResponseDto unwrap) + feature API'leri
src/hooks/queries/  TanStack Query hook'ları + query key fabrikası
src/store/          auth (SecureStore), settings (dil), toast
src/types/api.ts    Backend DTO'larının birebir yansıması (enumlar SAYI olarak taşınır)
src/i18n/           TR kaynak sözlük + EN ayna; tüm metinler t("path") ile
src/utils/          validasyon, paylaşım (VCF/deep link), tarih/biçim yardımcıları
```

## Bilinmesi gerekenler

- **Zarf yanıtı:** Backend her iş cevabını HTTP 200 ile döner; gerçek sonuç `success`
  alanındadır. Tüm istekler `unwrap`/`unwrapVoid`'tan geçer, hata `ApiError` olarak fırlar.
- **OTP sızıntısı:** `OtpCreationResponse.code` alanı backend'in geliştirme kolaylığı için
  ham kodu içerir — UI'da asla gösterilmez, ama production öncesi backend'den kaldırılmalı.
- **Kapsam dışı bırakılanlar** (backend endpoint'i yok): kullanıcı profili düzenleme,
  şifre değiştirme (DTO var, route yok), istatistik/analitik, NFC okuma, kart tasarım şablonları.
- **Paylaşım:** "Paylaş" = VCF indirip natif paylaşıma gönder; QR ve link kopyalama =
  `mmcard://public/{urlKey}` deep link'i (backend'de public web sayfası yoktur).
