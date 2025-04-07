import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getProducts } from "@/lib/data"

export default async function Home() {
  const products = await getProducts()
  
  const featuredProducts = products.slice(0, 4)
  const newArrivals = products
    .filter((p) => p.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
  const bestSellers = products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
  const trendingProducts = products
    .filter((p) => p.trending)
    .slice(0, 4)

  // Update the category and banner images to use Pexels images which are more reliable
  const categoryImages = {
    Laptops: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2",
    Phones:
      "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2",
    Accessories:
      "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2",
    Tablets:
      "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2",
    "Smart Gadgets":
      "https://images.pexels.com/photos/4790255/pexels-photo-4790255.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2",
  }

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900">
          <div className="container px-4 py-16 md:py-24 mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6">
              <Badge className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700">New Launch</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Next-Gen Tech <br />
                <span className="text-blue-500">At Your Fingertips</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl">
                Discover the latest in technology with Egadget. From powerful laptops to smart gadgets, we have
                everything you need.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                  <Link href="/products?category=new-arrivals">New Arrivals</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl"></div>
                <img
                  src="https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Latest tech gadgets"
                  className="w-full h-full object-cover object-center rounded-xl mix-blend-overlay"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products" className="flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {["Laptops", "Phones", "Accessories", "Tablets", "Smart Gadgets"].map((category) => (
              <Link key={category} href={`/products?category=${category.toLowerCase()}`}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                      <img
                        src={categoryImages[category] || "/placeholder.svg"}
                        alt={category}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-medium">{category}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Tabs Section */}
      <section className="container px-4 mx-auto">
        <Tabs defaultValue="best-sellers" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Our Products</h2>
            <TabsList>
              <TabsTrigger value="best-sellers">Best Sellers</TabsTrigger>
              <TabsTrigger value="new-arrivals">New Arrivals</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="best-sellers" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/products?sort=rating">View All Best Sellers</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="new-arrivals" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/products?category=new-arrivals">View All New Arrivals</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/products?category=trending">View All Trending Products</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Featured Products */}
      <section className="container px-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products?featured=true" className="flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="container px-4 mx-auto">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 p-8 lg:p-12">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white">Summer Tech Sale</h3>
              <p className="text-blue-100 max-w-md">Get up to 40% off on selected items. Limited time offer.</p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products?sale=true">Shop the Sale</Link>
              </Button>
            </div>
            <div className="w-full max-w-sm">
              <img
                src="https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Summer Sale"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

