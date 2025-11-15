import * as React from "react"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose?: () => void
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [onClose])

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  )
}


