"use client"
import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Trash2, GripVertical } from "lucide-react"
import { deleteCategory, updateCategory, reorderCategories } from "./actions"
import toast from "react-hot-toast"

type Category = {
  id: string
  name: string
  slug: string
  bannerUrl: string | null
  hoverImageUrl: string | null
  orderIndex: number
  protectMedia: boolean
}

export default function CategoryListClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [isSaving, setIsSaving] = useState(false)
  
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(categories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setCategories(items)

    const orderedIds = items.map(item => item.id)
    setIsSaving(true)
    try {
      await reorderCategories(orderedIds)
      toast.success("Đã cập nhật thứ tự!")
    } catch (err) {
      toast.error("Lỗi cập nhật thứ tự")
      setCategories(initialCategories)
    }
    setIsSaving(false)
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded overflow-hidden p-4 space-y-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-4"
            >
              {categories.map((cat, index) => (
                <Draggable key={cat.id} draggableId={cat.id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white dark:bg-slate-900 p-4 rounded border ${snapshot.isDragging ? 'border-teal-500 shadow-xl z-50' : 'border-slate-300 dark:border-slate-700'} flex flex-col md:flex-row gap-4 items-center`}
                      style={provided.draggableProps.style}
                    >
                      <div 
                        {...provided.dragHandleProps} 
                        className="cursor-grab hover:text-teal-400 p-2 text-slate-500"
                        title="Kéo thả để sắp xếp"
                      >
                        <GripVertical size={20} />
                      </div>

                      <form action={updateCategory} className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full items-end">
                        <input type="hidden" name="id" value={cat.id} />
                        
                        <div>
                          <label className="block mb-1 text-sm text-slate-600 dark:text-slate-400">Tên chuyên mục</label>
                          <input type="text" name="name" defaultValue={cat.name} required className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white text-sm rounded px-3 py-2" />
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm text-slate-600 dark:text-slate-400">Slug</label>
                          <input type="text" name="slug" defaultValue={cat.slug} required className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white text-sm rounded px-3 py-2" />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm text-slate-600 dark:text-slate-400">Ảnh nền trang (URL)</label>
                          <input type="text" name="bannerUrl" defaultValue={cat.bannerUrl || ""} placeholder="URL..." className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white text-sm rounded px-3 py-2" />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm text-slate-600 dark:text-slate-400">Ảnh hover (URL)</label>
                          <div className="flex gap-2">
                            <input type="text" name="hoverImageUrl" defaultValue={cat.hoverImageUrl || ""} placeholder="URL ảnh hover..." className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white text-sm rounded px-3 py-2" />
                          </div>
                        </div>
                        
                        <div className="md:col-span-4 flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                            <input type="checkbox" name="protectMedia" value="true" defaultChecked={cat.protectMedia} className="w-4 h-4 text-teal-600 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                            Bảo vệ Media (Chặn tải ảnh, chặn copy, chống F12)
                          </label>
                          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded text-sm font-medium shrink-0">Lưu</button>
                        </div>
                      </form>

                      <button 
                        onClick={() => {
                          if (confirm("Bạn có chắc chắn muốn xóa chuyên mục này?")) {
                            deleteCategory(cat.id)
                          }
                        }}
                        className="shrink-0 mt-4 md:mt-0 ml-auto text-red-400 hover:text-red-300 p-2 bg-red-900/20 rounded hover:bg-red-900/40 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {categories.length === 0 && (
        <p className="text-center text-slate-600 dark:text-slate-400 p-4">Chưa có chuyên mục nào.</p>
      )}
    </div>
  )
}
