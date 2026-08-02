# AI Engineer OS - Production Deployment Documentation

This documentation provides comprehensive guidelines for building and deploying **AI Engineer OS** to popular production cloud hosting providers as a static Single Page Application (SPA).

---

## 📦 Production Build Pipeline

AI Engineer OS uses **Vite** for its production compilation pipeline. The build output is structured, minified, and optimized with chunked code splitting.

### Build Command:
```bash
npm run build
```

This compiles your source files and writes the output to the `dist/` directory.

---

## ⚡ Production Hosting Configurations

Since AI Engineer OS uses client-side routing (`react-router-dom`), the hosting provider must serve the `index.html` file for all request paths to prevent 404 errors on page reloads.

---

### 1. Vercel Deployment

Deploying on Vercel is fully automated via the Git integration or using the Vercel CLI.

- **Configuration File**: `vercel.json` (located at the project root)
- **Settings**: Gathers route rewrites and forces immutable cache headers for compiled static assets (`/assets/*`).

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### 2. Netlify Deployment

Deploying on Netlify uses the Netlify CLI or Netlify dashboard.

- **Configuration File**: `netlify.toml` (located at the project root)
- **Settings**: Automatically instructs the Netlify runner to execute the build command and serve the `dist/` directory with wildcards rewrite redirects.

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  publish = "dist"
  command = "npm run build"
```

---

### 3. Firebase Hosting

Deploying to Firebase Hosting requires the Firebase CLI tool.

- **Configuration File**: `firebase.json` (located at the project root)
- **Build Directory**: `dist`
- **Deploy Command**:
  ```bash
  firebase deploy --only hosting
  ```

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

### 4. Cloudflare Pages

Deploying on Cloudflare Pages is done via the Cloudflare dashboard or Wrangler CLI.

- **Redirect File**: `public/_redirects` (compiled into `dist/_redirects`)
- **Settings**: Gathers single-line redirect fallbacks.

```text
/*    /index.html   200
```

---

## 🚀 Performance & SEO Optimization Practices

1. **Code Splitting**: Dynamic lazy-loaded components (`React.lazy`) split page views into standalone JS bundles, ensuring the browser only downloads the bundle needed for the active viewport.
2. **Asset Caching**: Static resources under `/assets/` are generated with unique hash strings in their filenames, allowing servers to set long-term cache headers (`max-age=31536000, immutable`) safely.
3. **Accessibility (a11y)**: Focus states, text color contrast ratios, input tags bindings, and semantic layouts are preserved.
4. **Environment Variables**: Configure your variables using `.env` configurations inside the root workspace folder to toggle endpoints at compile time.
