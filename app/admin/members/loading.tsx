export default function AdminMembersLoading() {
  return (
    <div className="min-h-screen bg-stone-50 animate-pulse">
      <header className="sticky top-0 z-40 border-b border-palette-forest-dark bg-stone-50/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="h-4 w-44 bg-stone-200 rounded" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-56 bg-stone-200 rounded" />
        <div className="mt-1 h-4 w-80 bg-stone-200 rounded" />

        {/* Tableau membres */}
        <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="px-4 py-3 text-left">
                    <div className="h-3 w-12 bg-stone-200 rounded" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="h-3 w-10 bg-stone-200 rounded" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="h-3 w-14 bg-stone-200 rounded" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="h-4 w-48 bg-stone-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-6 w-20 bg-stone-200 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-9 w-24 bg-stone-200 rounded-lg" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
