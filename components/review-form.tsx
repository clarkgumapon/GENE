"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { Star } from "lucide-react"

interface ReviewFormProps {
  productId: string
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review.",
        variant: "destructive",
      })

      return
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating for your review.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setRating(0)
      setComment("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= value
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 fill-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `You rated this ${rating} out of 5` : "Select a rating"}
              </span>
            </div>
          </div>

          <Textarea
            placeholder="Share your thoughts about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-muted rounded-md text-center">
          <p className="mb-2">Please login to write a review.</p>
          <Button asChild>
            <Link href={`/login?redirect=/products/${productId}`}>Login</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

