export type Preset = { id: string; label: string; w: number; h: number }

// Sizes in millimetres
export const PRESETS: Preset[] = [
  { id: "in-uk-eu", label: "India / UK / EU — 35 × 45 mm", w: 35, h: 45 },
  { id: "us", label: "USA — 2 × 2 in (51 × 51 mm)", w: 50.8, h: 50.8 },
  { id: "cn", label: "China — 33 × 48 mm", w: 33, h: 48 },
  { id: "ca", label: "Canada — 50 × 70 mm", w: 50, h: 70 },
  { id: "id", label: "ID / Visa — 25 × 35 mm", w: 25, h: 35 },
  { id: "custom", label: "Custom size", w: 35, h: 45 },
]

export const BACKGROUNDS = [
  { id: "white", label: "White", color: "#ffffff" },
  { id: "blue", label: "Blue", color: "#bcd4ef" },
  { id: "red", label: "Red", color: "#d93a3a" },
  { id: "grey", label: "Grey", color: "#e5e5e5" },
]

export type Format = "image/jpeg" | "image/png" | "image/webp"
export const FORMATS: { id: Format; label: string; ext: string }[] = [
  { id: "image/jpeg", label: "JPEG", ext: "jpg" },
  { id: "image/png", label: "PNG (lossless)", ext: "png" },
  { id: "image/webp", label: "WebP", ext: "webp" },
]

export const mmToPx = (mm: number, dpi: number) =>
  Math.max(1, Math.round((mm / 25.4) * dpi))

export type RenderParams = {
  img: CanvasImageSource & { width: number; height: number }
  width: number
  height: number
  zoom: number // 1 = cover the frame
  ox: number // horizontal offset, fraction of frame width
  oy: number // vertical offset, fraction of frame height
  angle: number // degrees
  bg: string
  brightness: number // 100 = unchanged
  contrast: number // 100 = unchanged
}

export function renderPhoto(
  canvas: HTMLCanvasElement,
  p: RenderParams,
  opts: { cropGuides?: boolean } = {}
) {
  canvas.width = p.width
  canvas.height = p.height
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.fillStyle = p.bg
  ctx.fillRect(0, 0, p.width, p.height)

  const rad = (p.angle * Math.PI) / 180
  const iw = p.img.width
  const ih = p.img.height
  // size of the rotated image's bounding box, used for "cover" scaling
  const bw = Math.abs(iw * Math.cos(rad)) + Math.abs(ih * Math.sin(rad))
  const bh = Math.abs(iw * Math.sin(rad)) + Math.abs(ih * Math.cos(rad))
  const base = Math.max(p.width / bw, p.height / bh)
  const scale = base * p.zoom

  ctx.save()
  if (p.brightness !== 100 || p.contrast !== 100) {
    ctx.filter = `brightness(${p.brightness}%) contrast(${p.contrast}%)`
  }
  ctx.translate(p.width / 2 + p.ox * p.width, p.height / 2 + p.oy * p.height)
  ctx.rotate(rad)
  ctx.scale(scale, scale)
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(p.img, -iw / 2, -ih / 2)
  ctx.restore()
  void opts
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: Format,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
      type,
      quality
    )
  )
}

/** Encode to the requested format; if maxBytes is set, search for the best quality that fits. */
export async function encode(
  canvas: HTMLCanvasElement,
  type: Format,
  quality: number,
  maxBytes: number | null
): Promise<{ blob: Blob; quality: number; fits: boolean }> {
  if (type === "image/png") {
    const blob = await canvasToBlob(canvas, type)
    return { blob, quality: 1, fits: maxBytes == null || blob.size <= maxBytes }
  }
  if (maxBytes == null) {
    return { blob: await canvasToBlob(canvas, type, quality), quality, fits: true }
  }
  let lo = 0.05
  let hi = 0.98
  let best: { blob: Blob; quality: number } | null = null
  for (let i = 0; i < 8; i++) {
    const q = (lo + hi) / 2
    const blob = await canvasToBlob(canvas, type, q)
    if (blob.size <= maxBytes) {
      best = { blob, quality: q }
      lo = q
    } else {
      hi = q
    }
  }
  if (best) return { ...best, fits: true }
  const blob = await canvasToBlob(canvas, type, 0.05)
  return { blob, quality: 0.05, fits: blob.size <= maxBytes }
}

/** Tile copies of a rendered photo on a 6x4 in (4R) sheet with cut guides. */
export function buildSheet(photo: HTMLCanvasElement, dpi: number): HTMLCanvasElement {
  const sheet = document.createElement("canvas")
  sheet.width = Math.round(6 * dpi)
  sheet.height = Math.round(4 * dpi)
  const ctx = sheet.getContext("2d")!
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, sheet.width, sheet.height)
  const gap = Math.round(dpi * 0.08)
  const margin = Math.round(dpi * 0.12)
  const cols = Math.max(1, Math.floor((sheet.width - 2 * margin + gap) / (photo.width + gap)))
  const rows = Math.max(1, Math.floor((sheet.height - 2 * margin + gap) / (photo.height + gap)))
  const totalW = cols * photo.width + (cols - 1) * gap
  const totalH = rows * photo.height + (rows - 1) * gap
  const x0 = Math.round((sheet.width - totalW) / 2)
  const y0 = Math.round((sheet.height - totalH) / 2)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (photo.width + gap)
      const y = y0 + r * (photo.height + gap)
      ctx.drawImage(photo, x, y)
      ctx.strokeStyle = "#cfcfcf"
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, photo.width - 1, photo.height - 1)
    }
  }
  return sheet
}

export const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`
