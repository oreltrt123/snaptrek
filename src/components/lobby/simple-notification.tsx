"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface NotificationProps {
  message: string
  type: "success" | "error" | "info" | "warning"
  onClose: () => void
  duration?: number
}

export function SimpleNotification({ message, type, onClose, duration = 3000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor =
    type === "success"
      ? "bg-green-900/80 border-green-500"
      : type === "error"
        ? "bg-red-900/80 border-red-500"
        : type === "warning"
          ? "bg-yellow-900/80 border-yellow-500"
          : "bg-purple-900/80 border-purple-500"

  return (
    <div className={`p-4 rounded-md shadow-lg border ${bgColor} text-white mb-2`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold mb-1">
            {type === "success"
              ? "Success"
              : type === "error"
                ? "Error"
                : type === "warning"
                  ? "Warning"
                  : "Information"}
          </h4>
          <p>{message}</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
