"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-provider"
import {
  ChevronRight,
  Package,
  Search,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageX,
} from "lucide-react"

// Mock orders for the demo
const mockOrders = [
  {
    id: "ORD123456",
    date: "November 15, 2023",
    status: "processing",
    items: [
      {
        id: "item1",
        name: "TechPro UltraBook X5",
        price: 65999,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=TechPro",
      },
      {
        id: "item2",
        name: "SoundWave Pro Wireless Earbuds",
        price: 8999,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=SoundWave",
      },
    ],
    total: 83998,
  },
  {
    id: "ORD789012",
    date: "November 10, 2023",
    status: "shipped",
    items: [
      {
        id: "item3",
        name: "PixelMax Pro 5G",
        price: 54999,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=PixelMax",
      },
    ],
    total: 61749,
  },
  {
    id: "ORD345678",
    date: "November 5, 2023",
    status: "delivered",
    items: [
      {
        id: "item4",
        name: "SmartWatch Pro 5",
        price: 12999,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=SmartWatch",
      },
      {
        id: "item5",
        name: "PowerBank Ultra 26800mAh",
        price: 3499,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80&text=PowerBank",
      },
    ],
    total: 22397,
  },
  {
    id: "ORD901234",
    date: "October 25, 2023",
    status: "delivered",
    items: [
      {
        id: "item6",
        name: "EchoSphere Smart Speaker",
        price: 7999,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=EchoSphere",
      },
    ],
    total: 8959,
  },
  {
    id: "ORD567890",
    date: "October 15, 2023",
    status: "cancelled",
    items: [
      {
        id: "item7",
        name: "FitTrack Smart Scale",
        price: 3499,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=FitTrack",
      },
    ],
    total: 3919,
  },
]

export default function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/login?redirect=/orders")
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
            <PackageX className="h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Unknown
          </Badge>
        )
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Package className="h-8 w-8 text-blue-500" />
      case "shipped":
        return <Truck className="h-8 w-8 text-orange-500" />
      case "delivered":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />
      case "cancelled":
        return <PackageX className="h-8 w-8 text-red-500" />
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />
    }
  }

  // Filter orders based on selected tab and search query
  const filteredOrders = mockOrders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">View and track your orders</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-auto flex-1 sm:max-w-sm">
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                prefix={<Search className="h-4 w-4 mr-2 text-muted-foreground" />}
              />
            </div>

            <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredOrders.length === 0 ? (
            <Card className="w-full">
              <CardHeader className="text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>No orders found</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No orders match your search criteria." : "You don't have any orders yet."}
                </p>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b bg-muted/40">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">Order #{order.id}</CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">₱{order.total.toLocaleString()}</p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:block">{getStatusIcon(order.status)}</div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                              <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                <p className="text-sm">₱{item.price.toLocaleString()} each</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

