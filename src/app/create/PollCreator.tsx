"use client"
import { useState, useRef } from "react"
import { PlusCircle, Trash2, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react"
import toast from "react-hot-toast"

export type PollOptionDraft = {
  id: string
  text: string
  imageUrl: string
  imageMode: "url" | "upload"
  uploading?: boolean
}

export type PollDraft = {
  question: string
  allowMultiple: boolean
  hideResults: boolean
  anonymous: boolean
  hasExpiry: boolean
  expiresAt: string
  options: PollOptionDraft[]
}

const newOption = (): PollOptionDraft => ({
  id: Math.random().toString(36).slice(2),
  text: "",
  imageUrl: "",
  imageMode: "url"
})

export const defaultPoll = (): PollDraft => ({
  question: "",
  allowMultiple: false,
  hideResults: false,
  anonymous: true,
  hasExpiry: false,
  expiresAt: "",
  options: [newOption(), newOption()]
})

export default function PollCreator({
  value,
  onChange,
  onRemove
}: {
  value: PollDraft
  onChange: (poll: PollDraft) => void
  onRemove: () => void
}) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const update = (partial: Partial<PollDraft>) => onChange({ ...value, ...partial })

  const updateOption = (id: string, partial: Partial<PollOptionDraft>) =>
    onChange({ ...value, options: value.options.map(o => o.id === id ? { ...o, ...partial } : o) })

  const addOption = () => {
    if (value.options.length >= 10) { toast.error("Tối đa 10 đáp án"); return }
    update({ options: [...value.options, newOption()] })
  }

  const removeOption = (id: string) => {
    if (value.options.length <= 2) { toast.error("Cần ít nhất 2 đáp án"); return }
    update({ options: value.options.filter(o => o.id !== id) })
  }

  const handleUpload = async (optionId: string, file: File) => {
    updateOption(optionId, { uploading: true })
    try {
      const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
      const results = await uploadFilesDirectly([file])
      if (results && results[0] && results[0].url) {
        updateOption(optionId, { imageUrl: results[0].url, uploading: false })
        toast.success("Đã tải ảnh lên!")
      } else {
        throw new Error()
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi tải ảnh lên")
      updateOption(optionId, { uploading: false })
    }
  }

  return (
    <div className="bg-slate-800/50 border border-teal-500/30 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-teal-400">Bình chọn (Poll)</h3>
        <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm mb-1 text-slate-300">Câu hỏi / Tiêu đề bình chọn *</label>
        <input
          type="text"
          value={value.question}
          onChange={e => update({ question: e.target.value })}
          placeholder="Nhập câu hỏi hoặc chủ đề bình chọn..."
          className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg focus:border-teal-500 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-slate-300">Đáp án (2-10)</label>
        {value.options.map((opt, idx) => (
          <div key={opt.id} className="bg-slate-900 rounded-lg p-3 space-y-2 border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-5 shrink-0">{idx + 1}.</span>
              <input
                type="text"
                value={opt.text}
                onChange={e => updateOption(opt.id, { text: e.target.value })}
                placeholder={`Đáp án ${idx + 1}`}
                className="flex-1 bg-transparent border-b border-slate-700 text-white py-1 focus:border-teal-500 focus:outline-none text-sm"
              />
              <button type="button" onClick={() => removeOption(opt.id)} className="text-slate-500 hover:text-red-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 ml-7">
              <button
                type="button"
                onClick={() => updateOption(opt.id, { imageMode: opt.imageMode === "url" ? "upload" : "url", imageUrl: "" })}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-teal-400 transition-colors shrink-0"
              >
                {opt.imageMode === "url" ? <><LinkIcon className="w-3 h-3" />URL ảnh</> : <><ImageIcon className="w-3 h-3" />Tải ảnh lên</>}
              </button>

              {opt.imageMode === "url" ? (
                <input
                  type="text"
                  value={opt.imageUrl}
                  onChange={e => updateOption(opt.id, { imageUrl: e.target.value })}
                  placeholder="https://... (Tùy chọn)"
                  className="flex-1 bg-transparent border-b border-slate-700 text-white py-1 focus:border-teal-500 focus:outline-none text-xs"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={el => { fileRefs.current[opt.id] = el }}
                    onChange={e => { if (e.target.files?.[0]) handleUpload(opt.id, e.target.files[0]) }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[opt.id]?.click()}
                    disabled={opt.uploading}
                    className="text-xs text-teal-400 hover:underline disabled:opacity-50"
                  >
                    {opt.uploading ? "Đang tải..." : opt.imageUrl ? "Đổi ảnh" : "Chọn ảnh từ thiết bị"}
                  </button>
                  {opt.imageUrl && <span className="text-xs text-green-400">Đã tải lên</span>}
                </div>
              )}
            </div>

            {opt.imageUrl && (
              <div className="ml-7">
                <img src={opt.imageUrl} alt="Preview" className="w-24 h-16 object-cover rounded border border-slate-600" />
              </div>
            )}
          </div>
        ))}

        {value.options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Thêm đáp án
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-700">
        {[
          { key: "allowMultiple", label: "Cho phép chọn nhiều đáp án" },
          { key: "hideResults", label: "Ẩn kết quả đến khi kết thúc" },
          { key: "anonymous", label: "Ẩn danh người bình chọn" },
          { key: "hasExpiry", label: "Có thời hạn kết thúc" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value[key as keyof PollDraft] as boolean}
              onChange={e => update({ [key]: e.target.checked })}
              className="w-4 h-4 accent-teal-500"
            />
            <span className="text-sm text-slate-300">{label}</span>
          </label>
        ))}
      </div>

      {value.hasExpiry && (
        <div>
          <label className="block text-sm mb-1 text-slate-300">Ngày giờ kết thúc</label>
          <input
            type="datetime-local"
            value={value.expiresAt}
            onChange={e => update({ expiresAt: e.target.value })}
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            className="bg-slate-900 border border-slate-600 text-white p-2 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
          />
        </div>
      )}
    </div>
  )
}