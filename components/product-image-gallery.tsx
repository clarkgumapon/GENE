"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

interface ProductImageGalleryProps {
  product: Product
}

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
  }

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-muted"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <div
          className={`w-full h-full transition-transform duration-200 ${isZoomed ? "scale-150" : "scale-100"}`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  cursor: "zoom-out",
                }
              : { cursor: "zoom-in" }
          }
          onClick={handleZoomToggle}
        >
          <img
            src={product.images[activeIndex] || "/placeholder.svg"}
            alt={`${product.name} - Image ${activeIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 opacity-80 hover:opacity-100"
          onClick={handleZoomToggle}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
          <Button
            variant="secondary"
            size="icon"
            className="ml-2 opacity-80 hover:opacity-100 pointer-events-auto"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="mr-2 opacity-80 hover:opacity-100 pointer-events-auto"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
        {product.images.map((image, index) => (
          <button
            key={index}
            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden snap-start ${
              activeIndex === index ? "ring-2 ring-primary" : "opacity-70"
            }`}
            onClick={() => handleThumbnailClick(index)}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`${product.name} - Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

