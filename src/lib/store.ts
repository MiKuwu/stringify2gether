import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  isUploading: boolean
  uploadProgress: number
  setUploadState: (isUploading: boolean, progress?: number) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  isUploading: false,
  uploadProgress: 0,
  setUploadState: (isUploading, progress = 0) => set({ isUploading, uploadProgress: progress }),
}))

interface AuthPromptState {
  isOpen: boolean
  message: string
  openPrompt: (message?: string) => void
  closePrompt: () => void
}

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  isOpen: false,
  message: "Vui lòng đăng nhập để tiếp tục",
  openPrompt: (message = "Vui lòng đăng nhập để tiếp tục") => set({ isOpen: true, message }),
  closePrompt: () => set({ isOpen: false })
}))
