"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Zap } from "lucide-react"
import { useCart } from "@/lib/cart-provider"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, buyNow } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to continue with your purchase.",
        variant: "destructive",
      })
      router.push(`/login?redirect=/products/${product.id}`)
      return
    }

    buyNow(product, 1)
    router.push("/checkout")
  }

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-square">
          {product.isNew && <Badge className="absolute top-2 left-2 z-10 bg-blue-600 hover:bg-blue-700">New</Badge>}
          {product.discount > 0 && (
            <Badge className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700">{product.discount}% OFF</Badge>
          )}
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            {product.images[0] ? (
              <img
                src={
                  product.images[0] || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name)}`
                }
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name)}`
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm p-4 text-center">
                {product.name}
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-1 mb-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300",
                  )}
                />
              ))}
            <span className="text-xs text-muted-foreground ml-1">({product.reviews.length})</span>
          </div>
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-bold">₱{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₱{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
          <Button size="sm" onClick={handleBuyNow} disabled={product.stock === 0}>
            <Zap className="h-4 w-4 mr-2" />
            Buy
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}

