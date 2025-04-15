"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export type NotificationType = "success" | "error" | "info" | "warning"

export interface NotificationProps {
  title: string
  message: string
  type?: NotificationType
  duration?: number
  onClose?: () => void
}

export function Notification({ title, message, type = "info", duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-green-800"
      case "error":
        return "bg-red-100 border-red-500 text-red-800"
      case "warning":
        return "bg-yellow-100 border-yellow-500 text-yellow-800"
      default:
        return "bg-blue-100 border-blue-500 text-blue-800"
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-md border ${getBgColor()} shadow-md max-w-md animate-in fade-in slide-in-from-top-5`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export function useNotification() {
  const [notifications, setNotifications] = useState<(NotificationProps & { id: string })[]>([])

  const showNotification = (props: NotificationProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { ...props, id }])
    return id
  }

  const closeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const NotificationsContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} onClose={() => closeNotification(notification.id)} />
      ))}
    </div>
  )

  return {
    showNotification,
    closeNotification,
    NotificationsContainer,
  }
}
