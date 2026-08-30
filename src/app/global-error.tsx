"use client"
import MaintenanceScreen from "@/components/MaintenanceScreen"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // We can render the maintenance screen automatically when the app crashes globally
  return (
    <html lang="en">
      <body>
        <MaintenanceScreen />
      </body>
    </html>
  )
}
