# Panduan Deployment dan Konversi ke APK

## Deployment Web App

### 1. Deploy ke Netlify (Gratis)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Build aplikasi
npm run build

# Deploy
netlify deploy --prod
```

### 2. Deploy ke Vercel (Gratis)

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

## Konversi ke APK menggunakan PWA Builder

### Opsi 1: PWA Builder (Paling Mudah)

1. **Build aplikasi**
   ```bash
   npm run build
   ```

2. **Deploy ke hosting** (Netlify/Vercel/dll)

3. **Kunjungi PWA Builder**
   - Buka [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
   - Masukkan URL aplikasi Anda yang sudah di-deploy
   - Klik "Start"

4. **Generate APK**
   - Pilih tab "Publish"
   - Pilih "Android"
   - Klik "Generate Package"
   - Download file APK yang dihasilkan

5. **Install APK di Android**
   - Transfer file APK ke smartphone
   - Enable "Install from Unknown Sources" di Settings
   - Install APK

### Opsi 2: Menggunakan Capacitor

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. **Add Android Platform**
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

3. **Build dan Sync**
   ```bash
   npm run build
   npx cap sync
   ```

4. **Open di Android Studio**
   ```bash
   npx cap open android
   ```

5. **Build APK di Android Studio**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK akan tersedia di `android/app/build/outputs/apk/`

### Opsi 3: Menggunakan Cordova

1. **Install Cordova**
   ```bash
   npm install -g cordova
   ```

2. **Create Cordova Project**
   ```bash
   cordova create financeapp com.yourname.financeapp FinanceTracker
   cd financeapp
   ```

3. **Copy build files**
   - Build aplikasi React: `npm run build`
   - Copy isi folder `dist` ke `financeapp/www`

4. **Add Android Platform**
   ```bash
   cordova platform add android
   ```

5. **Build APK**
   ```bash
   cordova build android
   ```

6. **APK Location**
   - Debug APK: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`
   - Release APK: `platforms/android/app/build/outputs/apk/release/app-release.apk`

## PWA Install di Smartphone (Tanpa APK)

### Android
1. Buka aplikasi di Chrome browser
2. Tap menu (3 titik) di pojok kanan atas
3. Pilih "Install App" atau "Add to Home Screen"
4. Aplikasi akan muncul di home screen seperti app native

### iOS
1. Buka aplikasi di Safari browser
2. Tap tombol Share
3. Pilih "Add to Home Screen"
4. Aplikasi akan muncul di home screen

## Testing APK

### Testing di Emulator
1. Install Android Studio
2. Buka AVD Manager
3. Create virtual device
4. Drag & drop APK ke emulator

### Testing di Device Real
1. Enable Developer Options di Android
2. Enable USB Debugging
3. Connect phone via USB
4. Install APK:
   ```bash
   adb install app-debug.apk
   ```

## Tips untuk Production

### 1. Update manifest.json
- Ganti icon placeholder dengan logo custom
- Update name, description, theme_color

### 2. Generate Icons
Gunakan tools seperti:
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

### 3. SSL Certificate
- Pastikan aplikasi menggunakan HTTPS
- PWA hanya berfungsi di HTTPS (atau localhost)

### 4. Test PWA
- Gunakan Lighthouse di Chrome DevTools
- Cek PWA compliance score

### 5. Optimize Performance
```bash
# Analyze bundle size
npm run build -- --mode production

# Install bundle analyzer
npm install -D vite-plugin-bundle-analyzer
```

## Troubleshooting

### Service Worker tidak register
- Pastikan aplikasi di-akses via HTTPS
- Clear cache browser
- Check console untuk error

### APK tidak bisa install
- Enable "Install from Unknown Sources"
- Pastikan Android version minimal yang didukung
- Check signature APK

### App tidak offline
- Verify service worker aktif (Chrome DevTools > Application > Service Workers)
- Test di mode airplane
- Check cache storage

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Cordova Docs](https://cordova.apache.org/docs/en/latest/)
- [PWA Builder](https://www.pwabuilder.com/)
