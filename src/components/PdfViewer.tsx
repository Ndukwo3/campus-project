"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion } from "framer-motion";
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  X,
  AlertCircle
} from "lucide-react";

// Use CDN for the worker to avoid SSR and setup issues in Next.js
// Optimized worker initialization for local bundle loading if possible, or faster unpkg
// Using .js instead of .mjs for broader browser compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PremiumPdfViewerProps {
  url: string;
  onClose: () => void;
  title?: string;
}

export default function PremiumPdfViewer({ url, onClose, title }: PremiumPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setContainerWidth(Math.min(window.innerWidth - 32, 416));
      
      const handleResize = () => {
         setContainerWidth(Math.min(window.innerWidth - 32, 416));
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    console.error("PDF Load Error:", err);
    setError("Unable to load document. Please check your internet or try again later.");
    setLoading(false);
  }

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1.0);

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden text-white safe-area-inset border-x border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="p-3 sm:p-4 flex items-center gap-2 border-b border-white/10 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button 
            onClick={onClose}
            className="w-10 h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-sm font-black uppercase italic tracking-tight truncate leading-none">
              {title || "Academic Resource"}
            </h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5 truncate">
              {pageNumber} of {numPages || "--"} Pages
            </p>
          </div>
        </div>

        <div className="flex items-center shrink-0 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button onClick={handleZoomOut} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center active:scale-90 transition-all text-zinc-400 hover:text-white">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleResetZoom} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center active:scale-90 transition-all text-zinc-500 hover:text-white">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleZoomIn} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center active:scale-90 transition-all text-[#E5FF66]">
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-auto scrollbar-hide py-10 px-4 flex flex-col items-center bg-zinc-900/50"
        onContextMenu={(e) => e.preventDefault()} // Security
      >
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <Loader2 size={32} className="animate-spin text-[#E5FF66]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E5FF66]">Preparing Material...</p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 max-w-xs text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="font-black uppercase italic">Viewer Encountered Error</h4>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div
            drag={scale > 1}
            dragConstraints={{ 
              left: -500 * scale, 
              right: 500 * scale, 
              top: -800 * scale, 
              bottom: 800 * scale 
            }}
            dragElastic={0.05}
            dragMomentum={true}
            className="cursor-grab active:cursor-grabbing w-full flex justify-center"
            style={{ touchAction: scale > 1 ? "none" : "auto" }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className="flex flex-col items-center shadow-2xl"
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                width={containerWidth}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                className="rounded-lg overflow-hidden border border-white/5"
              />
            </Document>
          </motion.div>
        )}
      </div>

      {/* Navigation Controls */}
      {!loading && !error && numPages > 0 && (
        <div className="p-6 pb-10 flex items-center justify-center gap-6 bg-gradient-to-t from-black to-transparent">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(prev => prev - 1)}
            className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="px-8 py-3 rounded-2xl bg-zinc-950 border border-white/5 flex flex-col items-center shadow-lg">
             <span className="text-[14px] font-black italic">{pageNumber} <span className="text-zinc-500 text-[10px] not-italic">/ {numPages}</span></span>
             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Swipe / Tap to Page</span>
          </div>

          <button 
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(prev => prev + 1)}
            className="w-14 h-14 rounded-full bg-[#E5FF66] text-black flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all group"
          >
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Security Overlay (Subtle Brand Logo) */}
      <div className="fixed bottom-6 right-6 opacity-10 pointer-events-none select-none">
         <h2 className="text-2xl font-black italic tracking-tighter uppercase whitespace-pre">CAMPUS HUB</h2>
      </div>
    </div>
  );
}
