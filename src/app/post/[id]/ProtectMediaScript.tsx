"use client"
import { useEffect } from "react"

export default function ProtectMediaScript() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S, Ctrl+C, Ctrl+P
      if ((e.ctrlKey || e.metaKey) && ['s', 'c', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
      
      // Try to disable PrintScreen
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("Bản quyền hình ảnh đã được bảo vệ.")
      }
    }
    
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      e.clipboardData?.setData("text/plain", "Nội dung này đã được bảo vệ.")
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("copy", handleCopy)
    
    // Disable selection
    document.body.style.userSelect = "none"
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("copy", handleCopy)
      document.body.style.userSelect = "auto"
    }
  }, [])
  
  return null
}
