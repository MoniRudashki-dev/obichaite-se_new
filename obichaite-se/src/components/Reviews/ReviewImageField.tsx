'use client'

import { useState, useRef, ChangeEvent } from 'react'

type ReviewImageFieldProps = {
  name?: string
  label?: string
  onFileChange?: (file: File | null) => void
}

export function ReviewImageField({
  name = 'image',
  label = 'Снимка за отзива',
  onFileChange,
}: ReviewImageFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    onFileChange?.(file)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onFileChange?.(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-brown" htmlFor={name}>
        {label}
      </label>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm"
      />

      {previewUrl && (
        <div className="mt-2 flex items-center gap-3">
          <img
            src={previewUrl}
            alt="Selected review image"
            className="h-24 w-24 rounded object-cover"
          />
          <button type="button" onClick={handleClear} className="text-xs underline">
            Откажи
          </button>
        </div>
      )}
    </div>
  )
}
