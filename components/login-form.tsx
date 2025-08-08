"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, LogIn, LightbulbIcon,Shield, User, Zap, TrendingUp } from 'lucide-react'
import { authService, type LoginCredentials } from "@/lib/auth"
import { APP_CONFIG } from "@/lib/constants"
import Image from "next/image"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await authService.login(credentials)

    if (result.success) {
      onLoginSuccess()
    } else {
      setError(result.error || "Login failed")
    }

    setIsLoading(false)
  }

  const fillDemoCredentials = (role: "admin" | "user") => {
    if (role === "admin") {
      setCredentials({
        email: "admin@yacht-gwp.com",
        password: "password123",
      })
    } else {
      setCredentials({
        email: "user@yacht-gwp.com",
        password: "password123",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-maven">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/pelagos-core-logo.svg"
                  alt="Pelagos Core"
                  width={200}
                  height={40}
                  className="h-8 w-auto"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 font-maven">
                  AI-powered Sustainability Tool for the Yachting Industry
                </h2>
                <p className="text-slate-600 text-base leading-relaxed font-maven">
                  Perform multi-indicator environmental assessments, automate material classification, ensure PCR compliance, and access tailored eco-design guidelines.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 py-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-maven font-medium">Automated Processing</h3>
                  <p className="text-sm text-slate-600 font-maven">
                    AI-powered material recognition from documentation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 py-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-maven font-medium">PCR &amp; Standards Compliance</h3>
                  <p className="text-sm text-slate-600 font-maven">Ensure conformity with maritime PCRs and other industry standards</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 py-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
                  <LightbulbIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-maven font-medium">Ecodesign Guidelines</h3>
                  <p className="text-sm text-slate-600 font-maven">Find sustainability strategies tailored to your projects</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 py-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-maven font-medium">Industry Benchmarks</h3>
                  <p className="text-sm text-slate-600 font-maven">Compare against maritime industry standards</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900 font-maven">Welcome Back</CardTitle>
                <CardDescription className="text-slate-600 font-maven">
                  Sign in to access your sustainability toolkit
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium font-maven">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="h-11 font-maven"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium font-maven">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="h-11 pr-10 font-maven"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription className="font-maven">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-maven font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="font-maven">Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        <span className="font-maven">Sign In</span>
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="pt-6 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-4 text-center font-maven">Demo Access</p>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      /*onClick={() => fillDemoCredentials("admin")}*/
                      className="w-full h-auto p-4 justify-start"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 font-maven">Administrator</span>
                            <Badge variant="default" className="text-xs font-maven">
                              Full Access
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-500 font-maven">administrator@yacht-gwp.com</div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => fillDemoCredentials("user")}
                      className="w-full h-auto p-4 justify-start"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 font-maven">Standard User</span>
                            <Badge variant="secondary" className="text-xs font-maven">
                              Limited Access

                            </Badge>
                          </div>
                          <div className="text-sm text-slate-500 font-maven">user@yacht-gwp.com</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-sm text-slate-500">
              <p className="font-maven">by Ludovico Ruggiero – PhD, Politecnico di Milano</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
