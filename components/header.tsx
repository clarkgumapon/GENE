"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-provider"
import { useCart } from "@/lib/cart-provider"
import { Menu, Search, ShoppingCart, User, Sun, Moon, Laptop, LogOut, ChevronDown, X } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { cart } = useCart()

  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const cartItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    {
      name: "Categories",
      href: "#",
      children: [
        { name: "Laptops", href: "/products?category=laptops" },
        { name: "Phones", href: "/products?category=phones" },
        { name: "Accessories", href: "/products?category=accessories" },
        { name: "Tablets", href: "/products?category=tablets" },
        { name: "Smart Gadgets", href: "/products?category=smart-gadgets" },
      ],
    },
    { name: "New Arrivals", href: "/products?category=new-arrivals" },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-background"
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="mb-4">
                  <SheetTitle>Egadget</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {navLinks.map((link) => (
                    <div key={link.name}>
                      {link.children ? (
                        <div className="space-y-3">
                          <div className="font-medium">{link.name}</div>
                          <div className="grid gap-2 pl-4">
                            {link.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          className={`text-lg ${pathname === link.href ? "font-medium" : "text-muted-foreground"}`}
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">Egadget</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.children ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-1">
                          {link.name}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {link.children.map((child) => (
                          <DropdownMenuItem key={child.name} asChild>
                            <Link href={child.href}>{child.name}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      href={link.href}
                      className={`text-sm font-medium ${
                        pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {showSearch ? (
              <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Laptop className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="h-4 w-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {cartItemsCount}
                </Badge>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.name || "My Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login?tab=register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

