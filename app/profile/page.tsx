"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Save, User, Lock, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/login?redirect=/profile")
    return null
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, this would call an API to update the profile
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update profile in auth context
      updateProfile(userData)

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!passwordData.currentPassword) {
        throw new Error("Current password is required")
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters")
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // In a real app, this would call an API to change the password
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      })

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg?height=64&width=64" alt={user?.name || "User"} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{user?.name}</CardTitle>
                    <CardDescription>{user?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 py-2">
                  <Tabs defaultValue="account" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 h-auto">
                      <TabsTrigger value="account" className="justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Account Information
                      </TabsTrigger>
                      <TabsTrigger value="security" className="justify-start">
                        <Lock className="h-4 w-4 mr-2" />
                        Security
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/orders">My Orders</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/wishlist">My Wishlist</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="account">
              <TabsContent value="account" className="mt-0 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)} disabled={loading}>
                      {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={userData.name}
                              onChange={handleProfileChange}
                              disabled={!isEditing || loading}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={userData.email}
                              onChange={handleProfileChange}
                              disabled={true} // Email cannot be changed
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={userData.phone}
                              onChange={handleProfileChange}
                              disabled={!isEditing || loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={userData.address}
                            onChange={handleProfileChange}
                            disabled={!isEditing || loading}
                          />
                        </div>
                        {isEditing && (
                          <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>

                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Password must be at least 6 characters long.</AlertDescription>
                        </Alert>

                        <Button type="submit" disabled={loading}>
                          {loading ? "Changing Password..." : "Change Password"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

