"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Shield } from "lucide-react"
import { authService, type User as UserType } from "@/lib/auth"

interface UserHeaderProps {
  user: UserType
  onLogout: () => void
}

export default function UserHeader({ user, onLogout }: UserHeaderProps) {
  const handleLogout = () => {
    authService.logout()
    onLogout()
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="flex items-center gap-1">
          {user.role === "admin" && <Shield className="h-3 w-3" />}
          {user.role.toUpperCase()}
        </Badge>
        <span className="text-sm text-gray-600">Welcome, {user.fullName}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
