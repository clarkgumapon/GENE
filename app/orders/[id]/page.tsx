"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Truck, Package, ShoppingBag, AlertTriangle, Wallet, CreditCard } from "lucide-react"
import { getOrderById } from "@/lib/data"

export default function OrderSummaryPage() {
  const params = useParams()
  const { toast } = useToast()
  const orderId = params.id as string

  const [orderStatus, setOrderStatus] = useState("processing")
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundReason, setRefundReason] = useState("")

  const order = getOrderById(orderId)

  if (!order) {
    return (
      <div className="container px-4 py-16 mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="mb-6">The order you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const handleConfirmReceipt = () => {
    setOrderStatus("delivered")
    toast({
      title: "Order Confirmed",
      description: "You have confirmed receipt of your order.",
    })
  }

  const handleSubmitRefund = () => {
    if (!refundReason.trim()) {
      toast({
        title: "Refund reason required",
        description: "Please provide a reason for your refund request.",
        variant: "destructive",
      })
      return
    }

    setOrderStatus("refund_requested")
    setShowRefundDialog(false)
    toast({
      title: "Refund Requested",
      description: "Your refund request has been submitted successfully.",
    })
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Order Summary</h1>
          <p className="text-muted-foreground">
            Order #{orderId} • Placed on {order.date}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orderStatus !== "cancelled"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <span className="text-sm mt-1">Ordered</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          ["processing", "shipped", "delivered", "refund_requested"].includes(orderStatus)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Package className="h-5 w-5" />
                      </div>
                      <span className="text-sm mt-1">Processing</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          ["shipped", "delivered", "refund_requested"].includes(orderStatus)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Truck className="h-5 w-5" />
                      </div>
                      <span className="text-sm mt-1">Shipped</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          ["delivered"].includes(orderStatus)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span className="text-sm mt-1">Delivered</span>
                    </div>
                  </div>
                  <div className="absolute top-5 left-[calc(10%-5px)] right-[calc(10%-5px)] h-1 bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width:
                          orderStatus === "processing"
                            ? "33%"
                            : orderStatus === "shipped"
                              ? "66%"
                              : orderStatus === "delivered"
                                ? "100%"
                                : orderStatus === "refund_requested"
                                  ? "66%"
                                  : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <Badge
                      className={
                        orderStatus === "processing"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : orderStatus === "shipped"
                            ? "bg-orange-500 hover:bg-orange-600"
                            : orderStatus === "delivered"
                              ? "bg-green-500 hover:bg-green-600"
                              : orderStatus === "refund_requested"
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {orderStatus === "processing"
                        ? "Processing"
                        : orderStatus === "shipped"
                          ? "Shipped"
                          : orderStatus === "delivered"
                            ? "Delivered"
                            : orderStatus === "refund_requested"
                              ? "Refund Requested"
                              : "Cancelled"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {orderStatus === "processing"
                        ? "Your order is being processed"
                        : orderStatus === "shipped"
                          ? "Your order is on the way"
                          : orderStatus === "delivered"
                            ? "Your order has been delivered"
                            : orderStatus === "refund_requested"
                              ? "Your refund request is being processed"
                              : "Your order has been cancelled"}
                    </p>
                  </div>

                  {orderStatus === "shipped" && <Button onClick={handleConfirmReceipt}>Confirm Receipt</Button>}

                  {orderStatus === "delivered" && (
                    <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Request Refund</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request a Refund</DialogTitle>
                          <DialogDescription>Please provide a reason for your refund request.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Textarea
                            placeholder="Reason for refund..."
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <p className="text-muted-foreground">
                              Refund requests are subject to review and approval. You will be notified once your request
                              has been processed.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSubmitRefund}>Submit Request</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                        <img
                          src={
                            item.image || `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(item.name)}`
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm">₱{item.price.toLocaleString()} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₱{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (12% VAT)</span>
                    <span>₱{order.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{order.shipping > 0 ? `₱${order.shipping.toLocaleString()}` : "Free"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₱{order.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <div className="flex items-center gap-2">
                    {order.paymentMethod === "gcash" ? (
                      <Wallet className="h-4 w-4 text-blue-500" />
                    ) : order.paymentMethod === "card" ? (
                      <CreditCard className="h-4 w-4 text-purple-500" />
                    ) : (
                      <Truck className="h-4 w-4 text-green-500" />
                    )}
                    <span>
                      {order.paymentMethod === "gcash"
                        ? "GCash"
                        : order.paymentMethod === "card"
                          ? "Credit/Debit Card"
                          : "Cash on Delivery"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Delivery Address</h4>
                  <p>{order.address.fullName}</p>
                  <p>{order.address.street}</p>
                  <p>
                    {order.address.barangay}, {order.address.municipality}
                  </p>
                  <p>
                    {order.address.province}, {order.address.region}
                  </p>
                  <p>{order.address.postalCode}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Contact Information</h4>
                  <p>{order.address.phone}</p>
                  <p>{order.address.email}</p>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

