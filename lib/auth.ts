import { supabase } from "./supabase"

export interface User {
  id: string
  email: string
  role: "admin" | "user"
  fullName: string
  lastLogin?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export class AuthService {
  private currentUser: User | null = null
  private readonly SESSION_KEY = "yacht-gwp-user"

  constructor() {
    // Carica l'utente dalla sessione se presente
    this.loadUserFromSession()
  }

  private loadUserFromSession(): void {
    try {
      const userData = sessionStorage.getItem(this.SESSION_KEY)
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    } catch (error) {
      console.error("Error loading user from session:", error)
      this.logout()
    }
  }

  private saveUserToSession(user: User): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user))
    } catch (error) {
      console.error("Error saving user to session:", error)
    }
  }

  private clearUserFromSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.error("Error clearing user from session:", error)
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Per semplicità, usiamo password in chiaro per il demo
      // In produzione, dovresti usare bcrypt o simili
      const { data, error } = await supabase.from("users").select("*").eq("email", credentials.email).single()

      if (error || !data) {
        return { success: false, error: "Invalid email or password" }
      }

      // Verifica password (demo - in produzione usa bcrypt)
      const isValidPassword = credentials.password === "password123"

      if (!isValidPassword) {
        return { success: false, error: "Invalid email or password" }
      }

      // Aggiorna last_login
      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", data.id)

      const user: User = {
        id: data.id,
        email: data.email,
        role: data.role as "admin" | "user",
        fullName: data.full_name || data.email,
        lastLogin: new Date().toISOString(),
      }

      this.currentUser = user
      this.saveUserToSession(user)

      return { success: true, user }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  logout(): void {
    this.currentUser = null
    this.clearUserFromSession()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  isAdmin(): boolean {
    return this.currentUser?.role === "admin"
  }

  isUser(): boolean {
    return this.currentUser?.role === "user"
  }

  hasAccess(requiredRole: "admin" | "user"): boolean {
    if (!this.isAuthenticated()) return false

    if (requiredRole === "user") {
      return this.currentUser?.role === "user" || this.currentUser?.role === "admin"
    }

    if (requiredRole === "admin") {
      return this.currentUser?.role === "admin"
    }

    return false
  }
}

// Singleton instance
export const authService = new AuthService()
