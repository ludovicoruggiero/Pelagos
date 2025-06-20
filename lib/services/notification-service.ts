type NotificationType = "success" | "error" | "warning" | "info"

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  show(type: NotificationType, message: string, duration = 5000): string {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = { id, type, message, duration }

    this.notifications.push(notification)
    this.notifyListeners()

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration)
    }

    return id
  }

  success(message: string, duration?: number): string {
    return this.show("success", message, duration)
  }

  error(message: string, duration?: number): string {
    return this.show("error", message, duration)
  }

  warning(message: string, duration?: number): string {
    return this.show("warning", message, duration)
  }

  info(message: string, duration?: number): string {
    return this.show("info", message, duration)
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notifyListeners()
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.notifications]))
  }
}

export const notificationService = NotificationService.getInstance()
