"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"

interface GCashPaymentModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  amount: number
}

export default function GCashPaymentModal({ open, onClose, onComplete, amount }: GCashPaymentModalProps) {
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (open) {
      setStep(1)
      setPhoneNumber("")
      setOtp("")
      setLoading(false)
      setCountdown(0)
    }
  }, [open])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }

    return () => clearTimeout(timer)
  }, [countdown])

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid GCash phone number.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setStep(2)
      setLoading(false)
      setCountdown(60)
    }, 1500)
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim() || otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setStep(3)
      setLoading(false)

      // Simulate payment completion
      setTimeout(() => {
        onComplete()
      }, 2000)
    }, 1500)
  }

  const handleResendOtp = () => {
    setCountdown(60)
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your phone.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>GCash Payment</DialogTitle>
          <DialogDescription>Complete your payment of ₱{amount.toLocaleString()} using GCash.</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">GCash Phone Number</Label>
              <Input
                id="phone"
                placeholder="09XX XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={11}
                required
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground">A one-time password has been sent to {phoneNumber}</p>
            </div>

            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">Resend OTP in {countdown} seconds</p>
            ) : (
              <Button type="button" variant="link" className="p-0 h-auto" onClick={handleResendOtp}>
                Resend OTP
              </Button>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 3 && (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Your payment of ₱{amount.toLocaleString()} has been processed successfully.
            </p>
            <p className="text-sm text-muted-foreground">Processing your order...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

