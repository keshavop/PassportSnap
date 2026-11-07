# PassportSnap

Make passport and ID photos in seconds. Upload a photo, crop it to the right size, compress it and download it, all in your browser. Your photo is never uploaded to a server.

## Features

- **Upload** by click or drag and drop (JPG, PNG, WebP)
- **Size presets** for India/UK/EU (35×45 mm), USA (2×2 in), China, Canada and ID/Visa, plus custom sizes and 72–600 DPI
- **Crop and adjust**: drag to reposition, zoom, straighten, rotate 90°, brightness and contrast, with a face guide overlay
- **Background colour**: white, blue, red, grey or custom
- **Compress**: JPEG, PNG or WebP, a quality slider, or a target maximum file size in KB
- **Print sheet**: download a 6×4 in sheet with the photo tiled and cut guides

## Tech stack

Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui. Image processing uses the browser Canvas API.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Notes

The face guide is only a rough positioning aid. Check your country's official photo requirements before submitting.
