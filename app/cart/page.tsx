"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-provider"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Trash2, AlertCircle } from "lucide-react"
import CartItem from "@/components/cart-item"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, calculateTotal } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const subtotal = calculateTotal()
  const tax = subtotal * 0.12 // 12% VAT
  const total = subtotal + tax

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to continue with your purchase.",
        variant: "destructive",
      })
      router.push("/login?redirect=/checkout")
      return
    }

    router.push("/checkout")
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="text-muted-foreground">Review and modify your items before checkout</p>
        </div>

        {cart.items.length === 0 ? (
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle>Your cart is empty</CardTitle>
              <CardDescription>Looks like you haven&apos;t added any products to your cart yet.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cart.items.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {cart.items.map((item) => (
                      <CartItem
                        key={item.product.id}
                        item={item}
                        onRemove={() => removeFromCart(item.product.id)}
                        onUpdateQuantity={(quantity) => updateQuantity(item.product.id, quantity)}
                      />
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (12% VAT)</span>
                    <span>₱{tax.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₱{total.toLocaleString()}</span>
                  </div>

                  {!isAuthenticated && (
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-md text-sm">
                      <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <p>You need to be logged in to proceed with checkout.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={handleCheckout} disabled={cart.items.length === 0}>
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

