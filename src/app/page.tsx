import { PhotoMaker } from "@/components/photo-maker"

const FAQ = [
  {
    q: "What is the size of a passport photo?",
    a: "It depends on the country. India, the UK and most of the EU use 35 × 45 mm. The USA uses 2 × 2 inches (51 × 51 mm). China uses 33 × 48 mm and Canada uses 50 × 70 mm. PassportSnap has presets for these and a custom size option.",
  },
  {
    q: "How do I make a passport size photo online for free?",
    a: "Upload a photo, pick the size for your country, drag and zoom until your face fits the guide, then download. No sign-up is needed.",
  },
  {
    q: "How can I compress a passport photo to a specific size in KB?",
    a: "Turn on 'Limit file size', enter the maximum in KB (for example 50 or 100) and download. PassportSnap picks the highest JPEG or WebP quality that fits under your limit.",
  },
  {
    q: "Is my photo uploaded to a server?",
    a: "No. All cropping, resizing and compression happens in your browser, so your photo never leaves your device.",
  },
  {
    q: "Can I print passport photos at home?",
    a: "Yes. Download the 6 × 4 inch print sheet, which tiles several copies with cut guides, and print it at 100% scale on photo paper or at a print shop.",
  },
  {
    q: "What background colour should a passport photo have?",
    a: "Most countries require a plain white or light background, and some visas use blue or red. You can choose white, blue, red, grey or any custom colour.",
  },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "PassportSnap",
      url: "https://passportsnapp.vercel.app/",
      description:
        "Free online passport photo maker to crop, resize and compress passport and ID photos in your browser.",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight">
          PassportSnap: Free Passport Photo Maker
        </h1>
        <p className="mt-1 text-muted-foreground">
          Upload a photo, crop it to passport size, compress it to the file size you need and
          download it, all in your browser.
        </p>
      </header>

      <PhotoMaker />

      <section className="mx-auto max-w-3xl px-4 pb-8 md:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">How to make a passport photo online</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>Upload a clear, front-facing photo with good lighting.</li>
          <li>Choose your country&apos;s size, such as 35×45 mm or 2×2 inch.</li>
          <li>Drag and zoom so your face fits the guide, and pick a background colour.</li>
          <li>Set the format and, if needed, a maximum file size in KB.</li>
          <li>Download the photo or a 6×4 inch print sheet.</li>
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-8 md:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">Passport photo sizes by country</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4">Country / use</th>
                <th className="py-2 pr-4">Size (mm)</th>
                <th className="py-2">Size (inch)</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b"><td className="py-2 pr-4">India, UK, EU</td><td className="pr-4">35 × 45</td><td>1.38 × 1.77</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">USA</td><td className="pr-4">51 × 51</td><td>2 × 2</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">China</td><td className="pr-4">33 × 48</td><td>1.30 × 1.89</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Canada</td><td className="pr-4">50 × 70</td><td>1.97 × 2.76</td></tr>
              <tr><td className="py-2 pr-4">ID / visa (small)</td><td className="pr-4">25 × 35</td><td>0.98 × 1.38</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Always check the latest rules from your country&apos;s passport office before submitting.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 md:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="mt-4 space-y-5">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-medium">{f.q}</h3>
              <p className="mt-1 text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
