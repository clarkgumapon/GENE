"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-provider"
import { useCart } from "@/lib/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { getProducts } from "@/lib/data"
import { ShoppingCart, Trash2, HeartOff, Zap } from "lucide-react"
import type { Product } from "@/lib/types"

// Mock wishlist data - in a real app would come from a provider or API
const initialWishlistItems = ["laptop-1", "phone-1", "smart-1", "accessory-1"]

export default function WishlistPage() {
  const { isAuthenticated } = useAuth()
  const { addToCart, buyNow } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [wishlistItemIds, setWishlistItemIds] = useState<string[]>(initialWishlistItems)

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/login?redirect=/wishlist")
    return null
  }

  // Get product details for wishlist items
  const allProducts = getProducts()
  const wishlistItems = allProducts.filter((product) => wishlistItemIds.includes(product.id))

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItemIds(wishlistItemIds.filter((id) => id !== productId))
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    })
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleBuyNow = (product: Product) => {
    buyNow(product, 1)
    router.push("/checkout")
  }

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((product) => {
      addToCart(product, 1)
    })

    toast({
      title: "Added to cart",
      description: "All wishlist items have been added to your cart.",
    })
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">Save items for later</p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="w-full">
            <CardHeader className="text-center">
              <HeartOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Your wishlist is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Add items to your wishlist to save them for later.</p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{wishlistItems.length} items in your wishlist</p>
              <Button onClick={handleMoveAllToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <Card key={product.id} className="flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-1">
                    <h3 className="font-medium line-clamp-2 mb-1">{product.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold">₱{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₱{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.stock > 0 ? (
                      <span className="text-sm text-green-600">In Stock</span>
                    ) : (
                      <span className="text-sm text-red-600">Out of Stock</span>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                    <Button onClick={() => handleBuyNow(product)} disabled={product.stock === 0}>
                      <Zap className="h-4 w-4 mr-2" />
                      Buy
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

