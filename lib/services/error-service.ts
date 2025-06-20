class ErrorService {
  /**
   * Logs an error message to the console.
   * @param message The error message to log.
   */
  logError(message: string): void {
    console.error(`Error: ${message}`)
  }

  /**
   * Throws an error with the specified message.
   * @param message The error message.
   * @throws Error
   */
  throwError(message: string): void {
    throw new Error(message)
  }

  /**
   * Handles an error by logging it and potentially taking other actions.
   * @param error The error object.
   */
  handleError(error: any): void {
    this.logError(error.message || "An unknown error occurred.") // Replaced Italian with English
    // Additional error handling logic can be added here, such as reporting to a monitoring service.
  }
}

export default ErrorService
