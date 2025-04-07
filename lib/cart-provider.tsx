"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem, Product } from "@/lib/types"
import { cartApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"

interface Cart {
  items: CartItem[]
}

interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  calculateTotal: () => number
  buyNow: (product: Product, quantity: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] })
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  // Fetch cart from API if user is authenticated
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          const cartData = await cartApi.getCart()
          setCart({
            items: cartData.items.map((item: any) => ({
              id: item.id, // Store the cart item ID
              product: {
                id: item.product.id.toString(),
                name: item.product.name,
                description: '',
                price: item.product.price,
                originalPrice: item.product.originalPrice,
                discount: item.product.discount || 0,
                rating: item.product.rating || 0,
                stock: item.product.stock || 0,
                sold: 0,
                category: item.product.category || '',
                brand: '',
                sku: '',
                images: item.product.images || [],
                features: [],
                specifications: {},
                reviews: [],
                isNew: item.product.isNew || false,
                featured: false,
                trending: item.product.trending || false,
                createdAt: new Date().toISOString(),
              },
              quantity: item.quantity
            }))
          })
        } catch (error) {
          console.error("Failed to fetch cart:", error)
          // If API fails, try to load from localStorage as fallback
          loadFromLocalStorage()
        }
      } else {
        // Not authenticated, use localStorage
        loadFromLocalStorage()
      }
      setLoading(false)
    }

    fetchCart()
  }, [isAuthenticated])

  // Load cart from localStorage
  const loadFromLocalStorage = () => {
    const storedCart = localStorage.getItem("egadget_cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error("Failed to parse stored cart:", error)
        localStorage.removeItem("egadget_cart")
      }
    }
  }

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("egadget_cart", JSON.stringify(cart))
    }
  }, [cart, loading])

  const addToCart = async (product: Product, quantity: number) => {
    if (isAuthenticated) {
      try {
        const result = await cartApi.addToCart(product.id, quantity)
        setCart({
          items: result.items.map((item: any) => ({
            id: item.id,
            product: {
              id: item.product.id.toString(),
              name: item.product.name,
              description: '',
              price: item.product.price,
              originalPrice: item.product.originalPrice,
              discount: item.product.discount || 0,
              rating: item.product.rating || 0,
              stock: item.product.stock || 0,
              sold: 0,
              category: item.product.category || '',
              brand: '',
              sku: '',
              images: item.product.images || [],
              features: [],
              specifications: {},
              reviews: [],
              isNew: item.product.isNew || false,
              featured: false,
              trending: item.product.trending || false,
              createdAt: new Date().toISOString(),
            },
            quantity: item.quantity
          }))
        })
      } catch (error) {
        console.error("Failed to add to cart:", error)
        // Fall back to local cart handling
        updateLocalCart(product, quantity)
      }
    } else {
      // Not authenticated, use local cart
      updateLocalCart(product, quantity)
    }
  }

  const updateLocalCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((item) => item.product.id === product.id)

      if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevCart.items]
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity

        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: Math.min(newQuantity, product.stock), // Ensure quantity doesn't exceed stock
        }

        return { ...prevCart, items: updatedItems }
      } else {
        // Add new item
        return {
          ...prevCart,
          items: [...prevCart.items, { product, quantity: Math.min(quantity, product.stock) }],
        }
      }
    })
  }

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        // Find the cart item ID that corresponds to the product ID
        const itemToRemove = cart.items.find(item => item.product.id === productId)
        if (itemToRemove) {
          // Use the actual cart item ID when available (it should be provided by the API)
          const itemId = (itemToRemove as any).id || itemToRemove.product.id
          const result = await cartApi.removeFromCart(itemId)
          setCart({
            items: result.items.map((item: any) => ({
              id: item.id, // Keep the cart item ID
              product: {
                id: item.product.id.toString(),
                name: item.product.name,
                description: '',
                price: item.product.price,
                originalPrice: item.product.originalPrice,
                discount: item.product.discount || 0,
                rating: item.product.rating || 0,
                stock: item.product.stock || 0,
                sold: 0,
                category: item.product.category || '',
                brand: '',
                sku: '',
                images: item.product.images || [],
                features: [],
                specifications: {},
                reviews: [],
                isNew: item.product.isNew || false,
                featured: false,
                trending: item.product.trending || false,
                createdAt: new Date().toISOString(),
              },
              quantity: item.quantity
            }))
          })
        }
      } catch (error) {
        console.error("Failed to remove from cart:", error)
        // Fall back to local cart handling
        removeFromLocalCart(productId)
      }
    } else {
      // Not authenticated, use local cart
      removeFromLocalCart(productId)
    }
  }

  const removeFromLocalCart = (productId: string) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.filter((item) => item.product.id !== productId),
    }))
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      try {
        // Find the cart item ID that corresponds to the product ID
        const itemToUpdate = cart.items.find(item => item.product.id === productId)
        if (itemToUpdate) {
          // Use the actual cart item ID when available
          const itemId = (itemToUpdate as any).id || itemToUpdate.product.id
          const result = await cartApi.updateCartItem(itemId, quantity)
          setCart({
            items: result.items.map((item: any) => ({
              id: item.id,
              product: {
                id: item.product.id.toString(),
                name: item.product.name,
                description: '',
                price: item.product.price,
                originalPrice: item.product.originalPrice,
                discount: item.product.discount || 0,
                rating: item.product.rating || 0,
                stock: item.product.stock || 0,
                sold: 0,
                category: item.product.category || '',
                brand: '',
                sku: '',
                images: item.product.images || [],
                features: [],
                specifications: {},
                reviews: [],
                isNew: item.product.isNew || false,
                featured: false,
                trending: item.product.trending || false,
                createdAt: new Date().toISOString(),
              },
              quantity: item.quantity
            }))
          })
        }
      } catch (error) {
        console.error("Failed to update quantity:", error)
        // Fall back to local cart handling
        updateLocalQuantity(productId, quantity)
      }
    } else {
      // Not authenticated, use local cart
      updateLocalQuantity(productId, quantity)
    }
  }

  const updateLocalQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    }))
  }

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart()
        setCart({ items: [] })
      } catch (error) {
        console.error("Failed to clear cart:", error)
        // Fall back to local cart handling
        setCart({ items: [] })
      }
    } else {
      // Not authenticated, use local cart
      setCart({ items: [] })
    }
  }

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const buyNow = (product: Product, quantity: number) => {
    // Clear cart and add only this product
    setCart({
      items: [{ product, quantity: Math.min(quantity, product.stock) }],
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        calculateTotal,
        buyNow,
      }}
    >
      {loading ? null : children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

