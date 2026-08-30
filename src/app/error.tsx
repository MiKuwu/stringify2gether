"use client"
import MaintenanceScreen from "@/components/MaintenanceScreen"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <MaintenanceScreen />
}
