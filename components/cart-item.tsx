"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
}

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const handleIncrement = () => {
    if (item.quantity < item.product.stock) {
      onUpdateQuantity(item.quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1)
    }
  }

  return (
    <div className="flex gap-4 p-4">
      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
        <img
          src={
            item.product.images[0] ||
            `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(item.product.name)}`
          }
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground">₱{item.product.price.toLocaleString()} each</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
            disabled={item.quantity >= item.product.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-medium">₱{(item.product.price * item.quantity).toLocaleString()}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}

