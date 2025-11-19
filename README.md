# Pilgrim Notes

A spiritual journaling app for Bahá'í pilgrims visiting holy sites in Haifa and 'Akká.

## 📦 Repository Structure

This repository contains **two versions** of the Pilgrim Notes app:

### 🌐 PWA Version (Current/Main) - **Production Ready**
**Location:** Root directory
**Tech Stack:** SolidJS + Tailwind CSS 4 + Vite
**Status:** ✅ Complete and Ready to Deploy

Modern Progressive Web App with:
- Installable on any device (iOS, Android, Desktop)
- Offline-first functionality
- 60% smaller bundle size than React Native
- Works in any modern browser
- No app store submission needed

📖 **[Read PWA Documentation →](./PWA-README.md)**

### 📱 React Native Version (Legacy)
**Location:** `react-native-app/` directory
**Tech Stack:** React Native + Expo
**Status:** Original implementation (archived)

The original mobile app built with React Native and Expo.

---

## 🚀 Quick Start (PWA)

### Using pnpm (Recommended)

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
# Opens at http://localhost:5173

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Using npm

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

## ✨ Features

- 📝 **Rich Text Notes** - Format with headings, lists, blockquotes
- 🎤 **Audio Recording** - Record up to 30 minutes
- 📷 **Photo Capture** - Camera or gallery selection
- 🗺️ **58 Holy Sites** - Pre-loaded with images and quotes
- 🔍 **Search & Filter** - Find notes by title, content, or site
- 📄 **PDF Export** - Generate complete pilgrimage journals
- 💾 **Offline First** - All data stored locally in IndexedDB
- 📱 **PWA Installable** - Add to home screen on any device

---

## 📱 Installation

### As a PWA (Recommended)

1. **Deploy** to any static hosting (Netlify, Vercel, GitHub Pages, etc.)
2. **Visit** the URL in a modern browser
3. **Install** via browser prompt or menu:
   - **iOS Safari:** Share → Add to Home Screen
   - **Android Chrome:** Menu → Install App
   - **Desktop Chrome:** Address bar → Install icon

### As a Development Build

```bash
pnpm install
pnpm dev
# Visit http://localhost:5173
```

---

## 🏗️ Tech Stack Comparison

| Feature | PWA (SolidJS) | React Native |
|---------|---------------|--------------|
| Bundle Size | ~127KB | ~300KB+ |
| Startup Time | <1s | 2-3s |
| Platform | Web (all devices) | iOS/Android |
| Distribution | URL/PWA | App Stores |
| Updates | Instant | App Store review |
| Offline | ✅ Service Worker | ✅ Native |
| Camera/Mic | ✅ Web APIs | ✅ Native APIs |

---

## 📚 Documentation

- **[PWA README](./PWA-README.md)** - Complete PWA documentation
- **[Deployment Guide](./DEPLOYMENT.md)** - How to deploy to 8+ platforms
- **[Conversion Summary](./CONVERSION_SUMMARY.md)** - Technical conversion details
- **[React Native README](./react-native-app/README-RN.md)** - Original app docs

---

## 🚢 Deployment

The PWA is a static site and can be deployed to any hosting platform:

### Recommended Platforms (Free Tier Available)

1. **Netlify** - Drag & drop deployment
   ```bash
   pnpm build
   # Upload dist/ folder to Netlify
   ```

2. **Vercel** - Git integration
   ```bash
   pnpm build
   # Deploy via Vercel CLI or web interface
   ```

3. **GitHub Pages**
   ```bash
   pnpm build
   # Push dist/ to gh-pages branch
   ```

4. **Cloudflare Pages** - Fast global CDN
5. **Firebase Hosting** - Google infrastructure

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed instructions.

---

## 🔧 Development

### Project Structure

```
pilgrim-notes/
├── src/                    # PWA source code
│   ├── components/        # UI components
│   ├── views/             # Page views
│   ├── stores/            # State management
│   ├── lib/               # Database & utilities
│   ├── data/              # 58 holy sites data
│   └── types/             # TypeScript types
├── public/                # Static assets
├── react-native-app/      # Legacy React Native app
├── vite.config.ts         # Build configuration
├── package.json           # PWA dependencies
└── README.md              # This file
```

### Requirements

- Node.js 18+
- pnpm (or npm/yarn)

### Scripts

```bash
pnpm dev         # Start dev server
pnpm build       # Build for production
pnpm preview     # Preview production build
pnpm typecheck   # Check TypeScript types
```

---

## 🎯 Migration from React Native to PWA

The PWA version maintains **100% feature parity** with the React Native app:

✅ All original features working
✅ Better performance
✅ Smaller bundle size
✅ Modern tech stack
✅ Easier deployment
✅ No app store requirements

See **[CONVERSION_SUMMARY.md](./CONVERSION_SUMMARY.md)** for technical details.

---

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Ensure site is served over **HTTPS** (required for Web APIs)
- Check browser permissions
- Use Chrome or Safari (best compatibility)

### PWA Not Installing
- Must be served over HTTPS
- Check manifest.json is accessible
- Clear cache and try again

### Build Errors
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 📄 License

Same as original React Native app.

---

## 🙏 Credits

- Original React Native app by the Pilgrim Notes team
- Site information from Bahá'í World Centre
- Images from [pilgrim-images repository](https://github.com/Lastofthefirst/pilgrim-images)
- Bahá'í community for spiritual guidance

---

## 📞 Support

For issues or questions:
1. Check [PWA-README.md](./PWA-README.md) for usage details
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
3. See browser console for runtime errors
4. Ensure HTTPS for camera/microphone features

---

**Built with 💙 for the Bahá'í pilgrimage experience**

*Progressive Web App version powered by SolidJS & Tailwind CSS 4*
