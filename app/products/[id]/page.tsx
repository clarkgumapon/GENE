"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProductById, getProducts } from "@/lib/data"
import { useCart } from "@/lib/cart-provider"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus } from "lucide-react"
import ProductCard from "@/components/product-card"
import ReviewForm from "@/components/review-form"
import ProductImageGallery from "@/components/product-image-gallery"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart, buyNow } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const productId = params.id as string

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const productData = await getProductById(productId)
        
        if (productData) {
          setProduct(productData)
          
          const allProducts = await getProducts()
          
          // Set related products
          const related = allProducts
            .filter((p) => p.category === productData.category && p.id !== productData.id)
            .slice(0, 4)
          setRelatedProducts(related)
          
          // Set top selling products
          const topSelling = allProducts
            .filter((p) => p.category === productData.category)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5)
          setTopSellingProducts(topSelling)
        }
      } catch (error) {
        console.error("Error loading product data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [productId])

  if (loading) {
    return (
      <div className="container px-4 py-16 mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container px-4 py-16 mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to continue with your purchase.",
        variant: "destructive",
      })
      router.push(`/login?redirect=/products/${product.id}`)
      return
    }

    buyNow(product, quantity)
    router.push("/checkout")
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/products?category=${product.category.toLowerCase()}`} className="hover:text-foreground">
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <ProductImageGallery product={product} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              {product.isNew && <Badge className="bg-blue-600 hover:bg-blue-700">New Arrival</Badge>}

              <h1 className="text-3xl font-bold">{product.name}</h1>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300",
                        )}
                      />
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.reviews.length} reviews</span>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold">₱{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₱{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground">{product.description}</p>

              <div className="flex items-center gap-4">
                <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
                <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center">
                  <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={product.stock === 0}>
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="ghost" size="icon" className="h-12 w-12">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-muted-foreground">For orders over ₱5,000</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">1 Year Warranty</p>
                  <p className="text-muted-foreground">Official warranty</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">30 Days Return</p>
                  <p className="text-muted-foreground">Hassle-free returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="description" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-4">
            <div className="prose dark:prose-invert max-w-none">
              <p>{product.fullDescription || product.description}</p>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium w-1/3">{key}:</span>
                  <span className="w-2/3">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-4">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Reviews</CardTitle>
                      <CardDescription>{product.reviews.length} reviews for this product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-5 h-5",
                                    i < product.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 fill-gray-300",
                                  )}
                                />
                              ))}
                          </div>
                          <span className="font-medium">{product.rating.toFixed(1)} out of 5</span>
                        </div>

                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = product.reviews.filter((r) => r.rating === rating).length
                            const percentage = product.reviews.length
                              ? Math.round((count / product.reviews.length) * 100)
                              : 0

                            return (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-6">{rating}</span>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div
                                    className="bg-yellow-400 h-2.5 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm w-8">{percentage}%</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:w-2/3 space-y-6">
                  {product.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {product.reviews.map((review, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{review.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(review.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex">
                                {Array(5)
                                  .fill(0)
                                  .map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-4 h-4",
                                        i < review.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300 fill-gray-300",
                                      )}
                                    />
                                  ))}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p>{review.comment}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}

                  <ReviewForm productId={product.id} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Top Selling Products */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Top Selling in {product.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topSellingProducts.map((product, index) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <div className="flex items-center gap-4 p-4 rounded-lg border group-hover:border-primary transition-colors">
                  <div className="font-bold text-2xl text-muted-foreground">#{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">₱{product.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

