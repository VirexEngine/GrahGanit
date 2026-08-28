import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer, FloatingActions } from '@/components/site/Sections'

export const Route = createFileRoute('/free-tools/basic-kundali')({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: 'Free Kundli Generator | GrahGanit' },
    ],
  }),
})

function RouteComponent() {
  return (
    <div className="relative min-h-screen bg-cosmos text-foreground overflow-x-hidden">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 mx-auto max-w-7xl min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-display text-gradient-gold mb-6">Free Kundli Calculator</h1>
        <p className="text-lg text-foreground/70 max-w-2xl mb-8">Generate your authentic Vedic birth chart with Swiss Ephemeris mathematical precision on GrahGanit.</p>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  )
}
