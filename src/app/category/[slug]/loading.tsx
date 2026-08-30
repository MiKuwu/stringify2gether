import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full text-slate-500">
      <Loader2 className="w-12 h-12 animate-spin text-teal-500 mb-4" />
      <p className="font-bold text-lg animate-pulse">Loading...</p>
    </div>
  );
}