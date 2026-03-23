'use client'

import { useState } from 'react'

export default function ExportProductsButton() {
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/export-products')
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'productsExport.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          minWidth: '160px',
          padding: '8px 12px',
          background: loading ? '#555' : hovered ? '#333' : '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          transition: 'background 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'inline-block', minWidth: '130px', textAlign: 'center' }}>
          {loading ? 'Exporting...' : 'Export Products CSV'}
        </span>
      </button>
    </div>
  )
}
