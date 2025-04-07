"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/lib/cart-provider"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { getPhilippineLocations } from "@/lib/data"
import { CreditCard, Wallet, Truck } from "lucide-react"
import GCashPaymentModal from "@/components/gcash-payment-modal"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, calculateTotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [paymentMethod, setPaymentMethod] = useState("gcash")
  const [showGCashModal, setShowGCashModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
    islandGroup: "",
    region: "",
    province: "",
    municipality: "",
    barangay: "",
    street: "",
    postalCode: "",
  })

  const locations = getPhilippineLocations()

  const subtotal = calculateTotal()
  const tax = subtotal * 0.12 // 12% VAT
  const shippingFee = subtotal > 5000 ? 0 : 150
  const total = subtotal + tax + shippingFee

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
    }
  }, [isAuthenticated, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart")
    }
  }, [cart.items.length, router])

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const getRegions = () => {
    if (!address.islandGroup) return []
    return locations.filter((loc) => loc.islandGroup === address.islandGroup)
  }

  const getProvinces = () => {
    if (!address.region) return []
    const region = getRegions().find((r) => r.name === address.region)
    return region?.provinces || []
  }

  const getMunicipalities = () => {
    if (!address.province) return []
    const province = getProvinces().find((p) => p.name === address.province)
    return province?.municipalities || []
  }

  const getBarangays = () => {
    if (!address.municipality) return []
    const municipality = getMunicipalities().find((m) => m.name === address.municipality)
    return municipality?.barangays || []
  }

  const handlePlaceOrder = () => {
    // Validate form
    if (
      !address.fullName ||
      !address.phone ||
      !address.email ||
      !address.islandGroup ||
      !address.region ||
      !address.province ||
      !address.municipality ||
      !address.barangay ||
      !address.street
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "gcash") {
      setShowGCashModal(true)
    } else if (paymentMethod === "cod") {
      processOrder()
    } else if (paymentMethod === "card") {
      // In a real app, this would integrate with a payment gateway
      processOrder()
    }
  }

  const processOrder = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const orderId = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")

      // Clear cart and redirect to order summary
      clearCart()
      router.push(`/orders/${orderId}`)

      setLoading(false)
    }, 1500)
  }

  const handleGCashPaymentComplete = () => {
    setShowGCashModal(false)
    processOrder()
  }

  if (!isAuthenticated || cart.items.length === 0) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your order by providing your shipping and payment details</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your shipping details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={address.fullName}
                      onChange={(e) => handleAddressChange("fullName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={address.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={address.email}
                    onChange={(e) => handleAddressChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="islandGroup">Island Group</Label>
                  <Select
                    value={address.islandGroup}
                    onValueChange={(value) => {
                      handleAddressChange("islandGroup", value)
                      handleAddressChange("region", "")
                      handleAddressChange("province", "")
                      handleAddressChange("municipality", "")
                      handleAddressChange("barangay", "")
                    }}
                  >
                    <SelectTrigger id="islandGroup">
                      <SelectValue placeholder="Select Island Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Luzon">Luzon</SelectItem>
                      <SelectItem value="Visayas">Visayas</SelectItem>
                      <SelectItem value="Mindanao">Mindanao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={address.region}
                    onValueChange={(value) => {
                      handleAddressChange("region", value)
                      handleAddressChange("province", "")
                      handleAddressChange("municipality", "")
                      handleAddressChange("barangay", "")
                    }}
                    disabled={!address.islandGroup}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRegions().map((region) => (
                        <SelectItem key={region.name} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select
                    value={address.province}
                    onValueChange={(value) => {
                      handleAddressChange("province", value)
                      handleAddressChange("municipality", "")
                      handleAddressChange("barangay", "")
                    }}
                    disabled={!address.region}
                  >
                    <SelectTrigger id="province">
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                      {getProvinces().map((province) => (
                        <SelectItem key={province.name} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">City/Municipality</Label>
                  <Select
                    value={address.municipality}
                    onValueChange={(value) => {
                      handleAddressChange("municipality", value)
                      handleAddressChange("barangay", "")
                    }}
                    disabled={!address.province}
                  >
                    <SelectTrigger id="municipality">
                      <SelectValue placeholder="Select City/Municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMunicipalities().map((municipality) => (
                        <SelectItem key={municipality.name} value={municipality.name}>
                          {municipality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Select
                    value={address.barangay}
                    onValueChange={(value) => handleAddressChange("barangay", value)}
                    disabled={!address.municipality}
                  >
                    <SelectTrigger id="barangay">
                      <SelectValue placeholder="Select Barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBarangays().map((barangay) => (
                        <SelectItem key={barangay} value={barangay}>
                          {barangay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={address.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="gcash" id="gcash" />
                    <Label htmlFor="gcash" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">GCash</div>
                        <div className="text-sm text-muted-foreground">Pay using your GCash account</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">Pay using Visa, Mastercard, etc.</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible defaultValue="items">
                  <AccordionItem value="items">
                    <AccordionTrigger>Items ({cart.items.length})</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {cart.items.map((item) => (
                          <div key={item.product.id} className="flex gap-4">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                              <img
                                src={
                                  item.product.images[0] ||
                                  `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.product.name)}`
                                }
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              <p className="text-sm">₱{(item.product.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (12% VAT)</span>
                    <span>₱{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingFee > 0 ? `₱${shippingFee.toLocaleString()}` : "Free"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₱{total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <GCashPaymentModal
        open={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        onComplete={handleGCashPaymentComplete}
        amount={total}
      />
    </div>
  )
}

