"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { getProducts } from "@/lib/data"
import ProductCard from "@/components/product-card"
import type { Product } from "@/lib/types"
import { Filter, SlidersHorizontal, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""
  const initialSort = searchParams.get("sort") || "featured"

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: initialCategory,
    priceRange: [0, 100000],
    rating: 0,
    brands: [] as string[],
    search: "",
  })
  const [sort, setSort] = useState(initialSort)
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(100000)

  // Load products data
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const allProducts = await getProducts()
        setProducts(allProducts)
        
        // Extract categories and brands
        const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean)
        setCategories(uniqueCategories.length ? uniqueCategories : ["Laptops", "Phones", "Accessories", "Tablets", "Smart Gadgets"])
        
        const uniqueBrands = Array.from(new Set(allProducts.map(p => p.brand))).filter(Boolean)
        setBrands(uniqueBrands)
        
        // Set max price
        const highestPrice = Math.max(...allProducts.map(p => p.price))
        setMaxPrice(highestPrice || 100000)
        
        // Update price filter range if needed
        setFilters(prev => ({
          ...prev,
          priceRange: [prev.priceRange[0], Math.max(prev.priceRange[1], highestPrice)]
        }))
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  // Apply filters
  useEffect(() => {
    if (!products.length) return
    
    let result = [...products]

    // Apply category filter
    if (filters.category) {
      result = result.filter((p) => p.category.toLowerCase() === filters.category.toLowerCase())
    }

    // Apply price range filter
    result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1])

    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter((p) => p.rating >= filters.rating)
    }

    // Apply brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand))
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm),
      )
    }

    // Apply sorting
    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default: // featured
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    setFilteredProducts(result)
  }, [products, filters, sort])

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category }))
  }

  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({ ...prev, priceRange: value }))
  }

  const handleRatingChange = (rating: number) => {
    setFilters((prev) => ({ ...prev, rating }))
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      brands: checked ? [...prev.brands, brand] : prev.brands.filter((b) => b !== brand),
    }))
  }

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const handleSortChange = (value: string) => {
    setSort(value)
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, maxPrice],
      rating: 0,
      brands: [],
      search: "",
    })
    setSort("featured")
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
          Clear All
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Categories</h4>
        <div className="grid grid-cols-1 gap-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.category.toLowerCase() === category.toLowerCase()}
                onCheckedChange={() =>
                  handleCategoryChange(filters.category.toLowerCase() === category.toLowerCase() ? "" : category)
                }
              />
              <Label htmlFor={`category-${category}`}>{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Price Range</h4>
        <div className="px-2">
          <Slider
            defaultValue={[0, maxPrice]}
            value={filters.priceRange}
            max={maxPrice}
            step={1000}
            onValueChange={handlePriceChange}
          />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span>₱{filters.priceRange[0].toLocaleString()}</span>
            <span>₱{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Rating</h4>
        <div className="grid grid-cols-1 gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => handleRatingChange(checked ? rating : 0)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center">
                {Array(rating)
                  .fill(0)
                  .map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                {Array(5 - rating)
                  .fill(0)
                  .map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                <span className="ml-1">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Brands</h4>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked === true)}
              />
              <Label htmlFor={`brand-${brand}`}>{brand}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Browse our collection of the latest tech products</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-auto flex-1 sm:max-w-sm">
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <FiltersContent />
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="hidden lg:block w-[250px] shrink-0">
              <FiltersContent />
            </div>

            <div className="flex-1">
              {filters.category && (
                <div className="mb-4 flex items-center gap-2">
                  <span>Filtered by:</span>
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm">
                    {filters.category}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() => handleCategoryChange("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No products found</h3>
                  <p className="text-muted-foreground mt-1">Try adjusting your filters or search term</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

