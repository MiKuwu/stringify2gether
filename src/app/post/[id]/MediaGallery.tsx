"use client"
import { useState, useRef, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

function ProtectedImage({ src, alt, className, watermarkText, watermarkLogo }: { src: string, alt: string, className: string, watermarkText?: string | null, watermarkLogo?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const drawText = () => {
        if (watermarkText) {
          ctx.font = `bold ${Math.max(20, img.width / 30)}px sans-serif`
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          
          // Rotate slightly for a nice effect
          ctx.save()
          ctx.translate(img.width / 2, img.height / 2)
          ctx.rotate(-Math.PI / 6)
          ctx.fillText(watermarkText, 0, 0)
          
          // Draw a tile pattern of watermark across the image if it's large
          if (img.width > 800) {
             ctx.fillText(watermarkText, -img.width/3, -img.height/3)
             ctx.fillText(watermarkText, img.width/3, img.height/3)
          }
          ctx.restore()
        }
      }

      if (watermarkLogo) {
        const logo = new Image()
        logo.crossOrigin = "anonymous"
        logo.onload = () => {
          // Draw logo at bottom right, 20% of image width
          const logoWidth = img.width * 0.15
          const logoHeight = (logo.height / logo.width) * logoWidth
          ctx.globalAlpha = 0.6 // Semi-transparent
          ctx.drawImage(logo, img.width - logoWidth - 20, img.height - logoHeight - 20, logoWidth, logoHeight)
          ctx.globalAlpha = 1.0
          drawText()
        }
        logo.onerror = () => drawText() // Fallback to text if logo fails
        logo.src = watermarkLogo
      } else {
        drawText()
      }
    }
    img.src = src
  }, [src, watermarkText, watermarkLogo])

  return (
    <div className={`relative ${className}`} onContextMenu={e => e.preventDefault()}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain" 
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      />
      {/* Invisible overlay to block direct interactions */}
      <div className="absolute inset-0 z-10" />
    </div>
  )
}

export default function MediaGallery({ media, protectMedia, watermarkText, watermarkLogo }: { media: any[], protectMedia?: boolean, watermarkText?: string | null, watermarkLogo?: string | null }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })

  if (!media || media.length === 0) return null

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedIndex(prev => prev !== null && prev < media.length - 1 ? prev + 1 : 0)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : media.length - 1)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedIndex(null)
  }

  return (
    <>
      <div className="mt-12 mb-12">
        <div className={`rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 
          ${media.length === 1 ? "grid grid-cols-1" : ""}
          ${media.length === 2 ? "grid grid-cols-2 gap-1 h-64 md:h-[500px]" : ""}
          ${media.length === 3 ? "grid grid-cols-2 grid-rows-2 gap-1 h-64 md:h-[500px]" : ""}
          ${media.length >= 4 ? "grid grid-cols-2 grid-rows-2 gap-1 h-64 md:h-[500px]" : ""}
        `}>
          {media.slice(0, 4).map((item, index) => {
            let cellClass = "relative w-full h-full overflow-hidden bg-black flex items-center justify-center cursor-pointer hover:opacity-90 transition"
            if (media.length === 3 && index === 0) cellClass += " row-span-2"

            return (
              <div key={item.id} className={cellClass} onClick={() => setSelectedIndex(index)}>
                {item.type === "IMAGE" ? (
                  protectMedia ? (
                    <ProtectedImage 
                      src={item.url} 
                      alt="Đính kèm" 
                      className={`w-full h-full ${media.length === 1 ? "object-contain max-h-[80vh]" : "object-cover"}`}
                      watermarkText={watermarkText}
                      watermarkLogo={watermarkLogo}
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt="Đính kèm" 
                      className={`w-full h-full ${media.length === 1 ? "object-contain max-h-[80vh]" : "object-cover"}`} 
                    />
                  )
                ) : (
                  <video 
                    src={item.url} 
                    className={`w-full h-full ${media.length === 1 ? "object-contain max-h-[80vh]" : "object-cover"}`} 
                    controlsList={protectMedia ? "nodownload" : undefined}
                    onContextMenu={protectMedia ? e => e.preventDefault() : undefined}
                  />
                )}
                
                {media.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">+{media.length - 4}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {media.length === 1 && media[0].caption && (
          <p className="mt-4 text-center text-slate-700 dark:text-slate-300 italic px-4 border-l-4 border-teal-500 bg-white dark:bg-slate-900/50 py-2 rounded-r max-w-2xl mx-auto">
            {media[0].caption}
          </p>
        )}
      </div>

      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm"
          onClick={handleClose}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-red-500 bg-black/50 rounded-full p-2 transition z-50"
            onClick={handleClose}
          >
            <X size={32} />
          </button>
          
          {media.length > 1 && (
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-teal-400 bg-black/50 rounded-full p-3 transition z-50"
              onClick={handlePrev}
            >
              <ChevronLeft size={40} />
            </button>
          )}

          <div 
            className="relative w-full h-[calc(100%-80px)] flex items-center justify-center overflow-hidden p-4 touch-none"
            onWheel={(e) => {
              if (media[selectedIndex].type !== "IMAGE") return
              e.preventDefault()
              const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2
              setZoom(z => Math.max(1, Math.min(5, z + zoomDelta)))
            }}
            onPointerDown={(e) => {
              if (zoom > 1 && media[selectedIndex].type === "IMAGE") {
                setIsDragging(true)
                setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y })
                ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
              }
            }}
            onPointerMove={(e) => {
              if (isDragging && zoom > 1) {
                setPan({
                  x: e.clientX - startPan.x,
                  y: e.clientY - startPan.y
                })
              }
            }}
            onPointerUp={(e) => {
              setIsDragging(false)
              ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
            }}
            onPointerCancel={() => setIsDragging(false)}
          >
            {media[selectedIndex].type === "IMAGE" ? (
              protectMedia ? (
                <div
                  className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl ${zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"}`}
                  style={{ 
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, 
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                    width: '100%',
                    height: '100%'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (zoom > 1) {
                      setZoom(1)
                      setPan({ x: 0, y: 0 })
                    } else {
                      setZoom(2)
                    }
                  }}
                >
                  <ProtectedImage 
                    src={media[selectedIndex].url} 
                    alt="Lightbox" 
                    className="w-full h-full"
                    watermarkText={watermarkText}
                    watermarkLogo={watermarkLogo}
                  />
                </div>
              ) : (
                <img 
                  src={media[selectedIndex].url} 
                  draggable={false}
                  style={{ 
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, 
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.2s ease-out" 
                  }}
                  className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl ${zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"}`} 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (zoom > 1) {
                      setZoom(1)
                      setPan({ x: 0, y: 0 })
                    } else {
                      setZoom(2)
                    }
                  }} 
                />
              )
            ) : (
              <video 
                src={media[selectedIndex].url} 
                controls 
                autoPlay
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                onClick={(e) => e.stopPropagation()} 
                controlsList={protectMedia ? "nodownload" : undefined}
                onContextMenu={protectMedia ? e => e.preventDefault() : undefined}
              />
            )}
            
            {media[selectedIndex].type === "IMAGE" && (
              <div className="absolute bottom-4 flex gap-4 bg-black/50 p-2 rounded-full z-50" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setZoom(z => Math.max(1, z - 0.5)); if (zoom - 0.5 <= 1) setPan({x:0, y:0}) }} className="text-white hover:text-teal-400 font-bold px-3 py-1">-</button>
                <span className="text-white font-mono flex items-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="text-white hover:text-teal-400 font-bold px-3 py-1">+</button>
              </div>
            )}
          </div>

          <div className="h-[80px] w-full flex flex-col items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            {media[selectedIndex].caption && (
              <p className="text-slate-800 dark:text-slate-200 text-center mb-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg max-w-3xl border border-slate-300 dark:border-slate-700">
                {media[selectedIndex].caption}
              </p>
            )}
            <p className="text-white/50 text-sm z-50">
              {selectedIndex + 1} / {media.length}
            </p>
          </div>

          {media.length > 1 && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-teal-400 bg-black/50 rounded-full p-3 transition z-50"
              onClick={handleNext}
            >
              <ChevronRight size={40} />
            </button>
          )}
        </div>
      )}
    </>
  )
}
