"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { authApi } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (userData: { name: string; email: string; phone?: string; address?: string }) => void
}

// Demo users for testing without backend
const DEMO_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "user@example.com",
    password: "password123",
    phone: "09123456789",
    address: "123 Main St, Manila",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    phone: "09876543210",
    address: "456 Admin St, Makati",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize local storage for demo users if not exists
  useEffect(() => {
    const storedUsers = localStorage.getItem("egadget_users");
    if (!storedUsers) {
      localStorage.setItem("egadget_users", JSON.stringify(DEMO_USERS));
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in from API token or localStorage
    const checkAuth = async () => {
      try {
        // Try to get authentication from API first
        const auth = await authApi.checkAuth();
        if (auth.authenticated && auth.user) {
          setUser({
            id: auth.user.id.toString(),
            name: auth.user.name,
            email: auth.user.email,
            // Optional fields
            phone: auth.user.phone || '',
            address: auth.user.address || '',
          });
          setIsAuthenticated(true);
        } else {
          // If API auth fails, check localStorage
          const storedUser = localStorage.getItem("egadget_user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // If API fails, check localStorage
        const storedUser = localStorage.getItem("egadget_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Clear any stale data
          localStorage.removeItem("egadget_user");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      // Try API login first
      try {
        // Call the API for authentication
        const userData = await authApi.login(email, password);
        
        // Create a user object from the response
        const newUser = {
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
        };

        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem("egadget_user", JSON.stringify(newUser));
        return;
      } catch (apiError) {
        console.error("API login failed, trying local:", apiError);
        // Fall back to localStorage login
      }

      // Get users from localStorage
      const storedUsers = localStorage.getItem("egadget_users");
      const users = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
      
      // Find user with matching credentials
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }
      
      // Create a user object from the found user
      const newUser = {
        id: foundUser.id.toString(),
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone || '',
        address: foundUser.address || '',
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("egadget_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    try {
      // Try API registration first
      try {
        // Call the API for registration
        const userData = await authApi.register(name, email, password);
        
        // Create a user object from the response
        const newUser = {
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
        };

        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem("egadget_user", JSON.stringify(newUser));
        return;
      } catch (apiError) {
        console.error("API registration failed, trying local:", apiError);
        // Fall back to localStorage registration
      }

      // Get existing users
      const storedUsers = localStorage.getItem("egadget_users");
      const users = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
      
      // Check if email already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      // Create new user
      const newUserId = (users.length + 1).toString();
      const newUser = {
        id: newUserId,
        name,
        email,
        password,
        phone: '',
        address: '',
      };
      
      // Add to users array and save
      users.push(newUser);
      localStorage.setItem("egadget_users", JSON.stringify(users));
      
      // Log user in
      const userForState = {
        id: newUserId,
        name,
        email,
        phone: '',
        address: '',
      };
      
      setUser(userForState);
      setIsAuthenticated(true);
      localStorage.setItem("egadget_user", JSON.stringify(userForState));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      // Try API logout first
      authApi.logout();
    } catch (error) {
      console.error("API logout failed:", error);
    }
    
    // Always clean up local state
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("egadget_user");
  };

  const updateProfile = (userData: { name: string; email: string; phone?: string; address?: string }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      address: userData.address || '',
    };

    setUser(updatedUser);
    localStorage.setItem("egadget_user", JSON.stringify(updatedUser));
    
    // Also update in users array
    const storedUsers = localStorage.getItem("egadget_users");
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex >= 0) {
        users[userIndex] = {
          ...users[userIndex],
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
        };
        localStorage.setItem("egadget_users", JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

