"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  DownloadIcon,
  ImagePlusIcon,
  LayoutGridIcon,
  RotateCwIcon,
  RefreshCwIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BACKGROUNDS,
  FORMATS,
  PRESETS,
  buildSheet,
  canvasToBlob,
  encode,
  formatBytes,
  mmToPx,
  renderPhoto,
  type Format,
  type RenderParams,
} from "@/lib/photo"

const num = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : (v as number))

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function PhotoMaker() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState("photo")
  const [origSize, setOrigSize] = useState(0)

  const [presetId, setPresetId] = useState("in-uk-eu")
  const [customW, setCustomW] = useState(35)
  const [customH, setCustomH] = useState(45)
  const [dpi, setDpi] = useState(300)

  const [zoom, setZoom] = useState(1)
  const [ox, setOx] = useState(0)
  const [oy, setOy] = useState(0)
  const [angle, setAngle] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [bg, setBg] = useState("#ffffff")
  const [guides, setGuides] = useState(true)

  const [format, setFormat] = useState<Format>("image/jpeg")
  const [quality, setQuality] = useState(90)
  const [limitOn, setLimitOn] = useState(false)
  const [maxKb, setMaxKb] = useState(100)

  const [result, setResult] = useState<{ size: number; fits: boolean; q: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const previewRef = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preset = PRESETS.find((p) => p.id === presetId)!
  const mmW = presetId === "custom" ? customW : preset.w
  const mmH = presetId === "custom" ? customH : preset.h
  const validSize = mmW >= 10 && mmH >= 10 && mmW <= 200 && mmH <= 200
  const pxW = Math.min(4000, mmToPx(mmW || 35, dpi))
  const pxH = Math.min(4000, mmToPx(mmH || 45, dpi))

  const params = useCallback(
    (w: number, h: number): RenderParams | null =>
      img ? { img, width: w, height: h, zoom, ox, oy, angle, bg, brightness, contrast } : null,
    [img, zoom, ox, oy, angle, bg, brightness, contrast]
  )

  // Live preview
  useEffect(() => {
    const c = previewRef.current
    const w = 360
    const h = Math.round((w * pxH) / pxW)
    const p = params(w, h)
    if (c && p && validSize) renderPhoto(c, p)
  }, [params, pxW, pxH, validSize])

  // Final output size (debounced)
  useEffect(() => {
    if (!img || !validSize) return
    let cancelled = false
    const t = setTimeout(async () => {
      const c = document.createElement("canvas")
      renderPhoto(c, params(pxW, pxH)!)
      const r = await encode(c, format, quality / 100, limitOn ? maxKb * 1024 : null)
      if (!cancelled) setResult({ size: r.blob.size, fits: r.fits, q: r.quality })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [img, params, pxW, pxH, format, quality, limitOn, maxKb, validSize])

  const loadFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file")
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => {
      setImg(im)
      setFileName(file.name.replace(/\.[^.]+$/, ""))
      setOrigSize(file.size)
      resetAdjust()
      URL.revokeObjectURL(url)
    }
    im.onerror = () => {
      toast.error("Could not read that image")
      URL.revokeObjectURL(url)
    }
    im.src = url
  }

  const resetAdjust = () => {
    setZoom(1)
    setOx(0)
    setOy(0)
    setAngle(0)
    setBrightness(100)
    setContrast(100)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!img) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    setOx((v) => v + (e.clientX - drag.current!.x) / rect.width)
    setOy((v) => v + (e.clientY - drag.current!.y) / rect.height)
    drag.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = () => (drag.current = null)

  const buildFinal = async () => {
    const c = document.createElement("canvas")
    renderPhoto(c, params(pxW, pxH)!)
    return c
  }

  const handleDownload = async () => {
    if (!img || !validSize) return
    const c = await buildFinal()
    const r = await encode(c, format, quality / 100, limitOn ? maxKb * 1024 : null)
    const ext = FORMATS.find((f) => f.id === format)!.ext
    download(r.blob, `${fileName}-passport.${ext}`)
    if (limitOn && !r.fits) toast.warning(`Couldn't get under ${maxKb} KB — try a lower DPI or JPEG/WebP`)
    else toast.success(`Saved ${formatBytes(r.blob.size)}`)
  }

  const handleSheet = async () => {
    if (!img || !validSize) return
    const c = await buildFinal()
    const sheet = buildSheet(c, dpi)
    const blob = await canvasToBlob(sheet, "image/jpeg", 0.92)
    download(blob, `${fileName}-print-sheet-4x6.jpg`)
    toast.success("Print sheet (6 × 4 in) saved")
  }

  const saved = img && result && origSize ? Math.round((1 - result.size / origSize) * 100) : null

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 md:grid-cols-[minmax(0,380px)_1fr] md:p-8">
      {/* Preview */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {img ? (
              <div className="relative mx-auto w-full max-w-[360px] touch-none overflow-hidden rounded-md border bg-muted">
                <canvas
                  ref={previewRef}
                  className="block h-auto w-full cursor-grab active:cursor-grabbing"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />
                {guides && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-[12%] h-[62%] w-[56%] -translate-x-1/2 rounded-[50%] border-2 border-dashed border-sky-500/80" />
                    <div className="absolute left-0 right-0 top-[40%] border-t border-dashed border-sky-500/50" />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  loadFile(e.dataTransfer.files[0])
                }}
                className={`flex aspect-[7/9] w-full max-w-[360px] flex-col items-center justify-center gap-3 self-center rounded-md border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-muted ${
                  dragOver ? "border-primary bg-muted" : ""
                }`}
              >
                <ImagePlusIcon className="size-10" />
                <span>
                  <strong className="text-foreground">Click to upload</strong> or drag a photo here
                </span>
                <span className="text-xs">JPG, PNG, WebP · processed locally, never uploaded</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                loadFile(e.target.files?.[0])
                e.target.value = ""
              }}
            />
            {img && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Drag the photo to reposition</span>
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                  Change photo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Output" value={`${pxW} × ${pxH} px`} />
            <Stat label="Print size" value={`${mmW} × ${mmH} mm`} />
            <Stat label="Original" value={origSize ? formatBytes(origSize) : "—"} />
            <Stat
              label="Compressed"
              value={result ? formatBytes(result.size) : "—"}
              hint={saved != null && saved > 0 ? `${saved}% smaller` : undefined}
            />
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Size</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label>Photo size</Label>
              <Select
                value={presetId}
                items={PRESETS.map((p) => ({ value: p.id, label: p.label }))}
                onValueChange={(v) => v && setPresetId(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {presetId === "custom" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="cw">Width (mm)</Label>
                  <Input id="cw" type="number" min={10} max={200} value={customW}
                    onChange={(e) => setCustomW(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ch">Height (mm)</Label>
                  <Input id="ch" type="number" min={10} max={200} value={customH}
                    onChange={(e) => setCustomH(Number(e.target.value))} />
                </div>
                {!validSize && (
                  <p className="text-xs text-destructive sm:col-span-2">Use 10–200 mm for width and height.</p>
                )}
              </>
            )}
            <div className="grid gap-2 sm:col-span-2">
              <Label>Resolution: {dpi} DPI</Label>
              <Slider min={72} max={600} step={1} value={[dpi]} onValueChange={(v) => setDpi(num(v))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjust</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Zoom: {zoom.toFixed(2)}×</Label>
              <Slider min={1} max={4} step={0.01} value={[zoom]} disabled={!img} onValueChange={(v) => setZoom(num(v))} />
            </div>
            <div className="grid gap-2">
              <Label>Straighten: {angle}°</Label>
              <Slider min={-180} max={180} step={1} value={[angle]} disabled={!img} onValueChange={(v) => setAngle(num(v))} />
            </div>
            <div className="grid gap-2">
              <Label>Brightness: {brightness}%</Label>
              <Slider min={50} max={150} step={1} value={[brightness]} disabled={!img} onValueChange={(v) => setBrightness(num(v))} />
            </div>
            <div className="grid gap-2">
              <Label>Contrast: {contrast}%</Label>
              <Slider min={50} max={150} step={1} value={[contrast]} disabled={!img} onValueChange={(v) => setContrast(num(v))} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Background (shows where the photo doesn&apos;t cover)</Label>
              <div className="flex flex-wrap items-center gap-2">
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    title={b.label}
                    aria-label={b.label}
                    onClick={() => setBg(b.color)}
                    style={{ background: b.color }}
                    className={`size-8 rounded-full border ${bg === b.color ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  />
                ))}
                <input
                  type="color"
                  aria-label="Custom background"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="size-8 cursor-pointer rounded-full border bg-transparent p-0"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Switch checked={guides} onCheckedChange={setGuides} id="guides" />
                <Label htmlFor="guides">Face guide</Label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={!img}
                  onClick={() => setAngle((a) => (a + 90 > 180 ? a - 270 : a + 90))}>
                  <RotateCwIcon /> 90°
                </Button>
                <Button size="sm" variant="outline" disabled={!img} onClick={resetAdjust}>
                  <RefreshCwIcon /> Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Save &amp; compress</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Format</Label>
              <Select
                value={format}
                items={FORMATS.map((f) => ({ value: f.id, label: f.label }))}
                onValueChange={(v) => v && setFormat(v as Format)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quality: {limitOn ? `auto (${Math.round((result?.q ?? 0.9) * 100)})` : quality}</Label>
              <Slider min={10} max={100} step={1} value={[quality]}
                disabled={format === "image/png" || limitOn}
                onValueChange={(v) => setQuality(num(v))} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch checked={limitOn} onCheckedChange={setLimitOn} id="limit" />
              <Label htmlFor="limit">Limit file size to</Label>
              <Input type="number" min={5} max={5000} value={maxKb} disabled={!limitOn}
                onChange={(e) => setMaxKb(Math.max(5, Number(e.target.value)))} className="w-24" />
              <span className="text-sm text-muted-foreground">KB</span>
            </div>
            {limitOn && result && !result.fits && (
              <p className="text-xs text-destructive sm:col-span-2">
                Can&apos;t reach {maxKb} KB at this size — lower the DPI or use JPEG/WebP.
              </p>
            )}
            <Separator className="sm:col-span-2" />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button disabled={!img || !validSize} onClick={handleDownload}>
                <DownloadIcon /> Download photo
              </Button>
              <Button variant="outline" disabled={!img || !validSize} onClick={handleSheet}>
                <LayoutGridIcon /> Print sheet (6×4 in)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
      {hint && <div className="text-xs text-green-600">{hint}</div>}
    </div>
  )
}
