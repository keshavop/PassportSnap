import { PhotoMaker } from "@/components/photo-maker"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight">PassportSnap</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a photo, crop it to passport size, compress it and download — all in your browser.
        </p>
      </header>
      <PhotoMaker />
    </main>
  )
}
