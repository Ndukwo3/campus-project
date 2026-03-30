"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle,
  ExternalLink,
  RotateCw
} from "lucide-react";

// Ensure reliable PDF worker loading matching the exact react-pdf version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface IntegratedPdfViewerProps {
  url: string;
  onClose: () => void;
  title?: string;
}

export default function IntegratedPdfViewer({ url, onClose, title }: IntegratedPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pinch-to-zoom tracking
  const [touchStartDist, setTouchStartDist] = useState(0);
  const [lastScale, setLastScale] = useState(1);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(Math.min(window.innerWidth, 500));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setTouchStartDist(dist);
      setLastScale(scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist > 0) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const newScale = lastScale * (dist / touchStartDist);
      setScale(Math.min(Math.max(newScale, 0.5), 4.0));
    }
  };

  const handleTouchEnd = () => setTouchStartDist(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    console.error("PDF Load Error:", err);
    setError("Failed to initialize document reader within the app.");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-white font-sans overflow-hidden select-none">
      {/* Immersive Reader Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl absolute top-0 left-0 right-0 z-30"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all border border-white/5"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0 max-w-[200px]">
            <h3 className="text-xs font-black uppercase italic tracking-tighter truncate leading-none text-white/90">
              {title || "Class Resource"}
            </h3>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5 leading-none">
              SECURE VIEW · {numPages || "--"} PAGES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 scale-90 sm:scale-100">
          <button 
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-500"
          >
            <RotateCw size={14} />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button onClick={() => setScale(s => Math.max(s - 0.25, 0.5))} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-500">
            <ZoomOut size={14} />
          </button>
          <div className="px-2 text-[10px] font-black tabular-nums">{Math.round(scale * 100)}%</div>
          <button onClick={() => setScale(s => Math.min(s + 0.25, 4.0))} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-[#E5FF66]">
            <ZoomIn size={14} />
          </button>
        </div>
      </motion.header>

      {/* Reader Engine */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-zinc-950 pt-20 pb-32 px-4 flex flex-col items-center scrollbar-hide"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
            <Loader2 size={32} className="animate-spin text-[#E5FF66]" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E5FF66] animate-pulse">Initializing Reader...</p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-10 text-center max-w-[320px]">
            <div className="w-24 h-24 rounded-[40px] bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
              <AlertCircle size={44} />
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-black uppercase italic tracking-tighter">Reader Encountered Error</h4>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                {error}
              </p>
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  // If we open externally, we can also close the viewer to return.
                  onClose();
                }}
                className="mt-6 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 transition-all text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest w-full border border-white/5 active:scale-95"
              >
                <ExternalLink size={16} /> Open Document Externally
              </a>
            </div>
          </div>
        ) : (
          <div 
            className="relative will-change-transform transition-transform duration-300 ease-out pb-32"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className="flex flex-col items-center gap-6"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <motion.div
                  key={`page_${index + 1}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  className="shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden"
                >
                  <Page 
                    pageNumber={index + 1} 
                    scale={scale} 
                    width={containerWidth - 32}
                    renderAnnotationLayer={true}
                    renderTextLayer={true}
                    loading={<div className="bg-white/5 animate-pulse" style={{ width: containerWidth-32, height: (containerWidth-32)*1.4 }} />}
                  />
                </motion.div>
              ))}
            </Document>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none scale-150 overflow-hidden">
        <h2 className="text-[120px] font-black italic -rotate-12 tracking-tighter whitespace-pre text-center">CAMPUS HUB PROTECTED</h2>
      </div>
    </div>
  );
}
