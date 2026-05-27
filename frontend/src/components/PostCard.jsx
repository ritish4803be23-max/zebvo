import React from 'react'

function Badge({ children, color='gray' }) {
  const bg = color === 'green' ? 'bg-green-100 text-green-800' : color === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
  return <span className={`${bg} px-2 py-1 rounded text-xs`}>{children}</span>
}

export default function PostCard({ post, onTranslate }) {
  return (
    <article className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">{post.platform} • @{post.username}</div>
        <div className="flex gap-2">
          <Badge color={post.sentiment === 'positive' ? 'green' : post.sentiment === 'negative' ? 'red' : 'gray'}>{post.sentiment}</Badge>
          <Badge>{post.category}</Badge>
        </div>
      </div>
      <h4 className="font-semibold mb-1">{post.title || ''}</h4>
      <p className="text-sm mb-2">{post.content}</p>
      {post.translatedText && <p className="text-sm italic text-gray-500 mb-2">{post.translatedText}</p>}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>Engagement: {post.engagement || 0}</div>
        <div className="flex gap-2">
          <button onClick={onTranslate} className="px-2 py-1 border rounded text-xs">Translate (HI)</button>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">Summary: {post.summary}</div>
    </article>
  )
}
