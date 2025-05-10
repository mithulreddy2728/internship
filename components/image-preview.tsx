"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

interface ImagePreviewProps {
  base64String: string | null
  alt: string
  width?: number
  height?: number
  className?: string
}

export function ImagePreview({ base64String, alt, width = 200, height = 150, className = "" }: ImagePreviewProps) {
  const [error, setError] = useState(false)

  if (!base64String) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md ${className}`}
        style={{ width, height }}
      >
        <AlertCircle className="h-6 w-6 text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">No image</span>
      </div>
    )
  }

  // Check if the base64 string is valid
  const isValidBase64 = () => {
    try {
      // Try to validate the base64 string format
      return /^data:image\/[a-z]+;base64,/.test(base64String) || /^[A-Za-z0-9+/=]+$/.test(base64String)
    } catch (e) {
      return false
    }
  }

  if (!isValidBase64() || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md ${className}`}
        style={{ width, height }}
      >
        <AlertCircle className="h-6 w-6 text-red-400" />
        <span className="ml-2 text-sm text-red-500">Invalid image</span>
      </div>
    )
  }

  // Ensure the base64 string has the proper prefix
  const imgSrc = base64String.startsWith("data:image") ? base64String : `data:image/jpeg;base64,${base64String}`

  return (
    <img
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-md object-cover ${className}`}
      onError={() => setError(true)}
    />
  )
}
