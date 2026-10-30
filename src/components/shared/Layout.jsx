export default function Layout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </header>
      <main className="max-w-lg mx-auto">
        {children}
      </main>
    </div>
  )
}
