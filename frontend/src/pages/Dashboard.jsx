import React, { useEffect, useState } from 'react'
import { fetchPosts, searchPosts, filterPosts, translatePost, exportCSV } from '../api'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import PostCard from '../components/PostCard'

export default function Dashboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) { setError(err.message || 'Failed to load'); }
    setLoading(false);
  }

  useEffect(() => { load() }, [])

  const onSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = query ? await searchPosts(query) : await fetchPosts();
      setPosts(data);
    } catch (err) { setError(err.message) }
    setLoading(false);
  }

  const applyFilter = async (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
    try {
      const data = await filterPosts(newFilters);
      setPosts(data);
    } catch (err) { setError(err.message) }
    setLoading(false);
  }

  const onTranslate = async (id) => {
    try {
      const res = await translatePost(id, 'hi');
      setPosts(p => p.map(x => x._id === id ? { ...x, translatedText: res.translatedText } : x));
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar onFilter={applyFilter} onExport={() => exportCSV()} />
        <main className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <form onSubmit={onSearch} className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search posts..." className="px-3 py-2 rounded border" />
              <button className="px-3 py-2 bg-blue-600 text-white rounded">Search</button>
            </form>
            <div>
              <button onClick={load} className="px-3 py-2 border rounded">Refresh</button>
            </div>
          </div>

          {loading && <div className="text-center">Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <PostCard key={post._id} post={post} onTranslate={() => onTranslate(post._id)} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
