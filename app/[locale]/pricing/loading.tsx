import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <PublicOrDashboardHeader />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="h-10 bg-stone-200 rounded-lg w-2/3 mx-auto" />
        <div className="h-5 bg-stone-100 rounded w-1/2 mx-auto" />
        <div className="h-24 bg-stone-100 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-stone-100 rounded-2xl" />
          <div className="h-64 bg-stone-100 rounded-2xl" />
        </div>
      </main>
    </div>
  )
}
