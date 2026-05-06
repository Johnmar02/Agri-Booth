import * as signalR from '@microsoft/signalr';

/**
 * SERVICE: signalrService.js
 * 
 * This service manages the real-time connection to the .NET SignalR Hubs.
 * It ensures that credentials (cookies) are sent with the connection request.
 */

/**
 * SERVICE: signalrService.js
 * 
 * This service manages the real-time connection to the .NET SignalR Hubs.
 * It ensures that credentials (cookies) are sent with the connection request.
 */

// If using Vite proxy, hub paths should start from root /hubs
const HUB_BASE = '/hubs';

class SignalRService {
  constructor() {
    this.connection = null;
    this.listeners = new Map();
  }

  /**
   * Initializes the connection to a specific hub.
   * @param {string} hubPath - The path to the hub (e.g., '/notifications')
   */
  async startConnection(hubPath = '/notifications') {
    if (this.connection) {
      await this.connection.stop();
    }

    // Ensure path starts with / and doesn't duplicate hubs
    const cleanPath = hubPath.startsWith('/') ? hubPath : `/${hubPath}`;
    const url = cleanPath.startsWith('/hubs') ? cleanPath : `/hubs${cleanPath}`;
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        withCredentials: true, // CRITICAL: Sends Auth cookies!
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log(`SignalR Connected to ${url}`);
      
      // Re-attach all listeners if reconnecting
      this.listeners.forEach((callbacks, eventName) => {
        callbacks.forEach(callback => {
          this.connection.on(eventName, callback);
        });
      });
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      // Retry in 5 seconds
      setTimeout(() => this.startConnection(hubPath), 5000);
    }
  }

  /**
   * Registers a callback for a specific server-side event.
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);

    if (this.connection) {
      this.connection.on(eventName, callback);
    }
  }

  /**
   * Removes a callback for a specific event.
   */
  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.connection) {
      this.connection.off(eventName, callback);
    }
  }

  /**
   * Invokes a server-side method.
   */
  async invoke(methodName, ...args) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return await this.connection.invoke(methodName, ...args);
    }
    throw new Error('SignalR not connected');
  }

  /**
   * Stops the connection.
   */
  async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalrService = new SignalRService();
