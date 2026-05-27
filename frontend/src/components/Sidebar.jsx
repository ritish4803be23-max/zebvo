import React, { useState } from 'react'

export default function Sidebar({ onFilter, onExport }) {
  const [platform, setPlatform] = useState('')
  const [category, setCategory] = useState('')
  const [sentiment, setSentiment] = useState('')

  const apply = () => onFilter({ platform, category, sentiment })

  return (
    <aside className="w-64 p-4 bg-white dark:bg-gray-800 border-r">
      <h3 className="font-semibold mb-2">Filters</h3>
      <div className="mb-2">
        <label className="block text-sm">Platform</label>
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full border rounded px-2 py-1">
          <option value="">All</option>
          <option value="reddit">Reddit</option>
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded px-2 py-1">
          <option value="">All</option>
          <option value="renewal">Renewal</option>
          <option value="Visa">Visa</option>
          <option value="tatkal">Tatkal</option>
          <option value="Travel Issues">Travel Issues</option>
          <option value="Scam/Fraud">Scam/Fraud</option>
          <option value="News">News</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm">Sentiment</label>
        <select value={sentiment} onChange={e => setSentiment(e.target.value)} className="w-full border rounded px-2 py-1">
          <option value="">All</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={apply} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded">Apply</button>
        <button onClick={onExport} className="px-3 py-2 border rounded">CSV</button>
      </div>
    </aside>
  )
}
