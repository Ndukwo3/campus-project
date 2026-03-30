"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import {
  Loader2,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  RotateCw,
} from "lucide-react";

// Ensure reliable PDF worker loading matching the exact react-pdf version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface IntegratedPdfViewerProps {
  url: string;
  onClose: () => void;
  title?: string;
}

// Zoom controls component inside TransformWrapper context
function ZoomControls({ rotation, onRotate }: { rotation: number; onRotate: () => void }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 scale-90 sm:scale-100">
      <button
        onClick={onRotate}
        className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-500 active:scale-90 transition-all"
      >
        <RotateCw size={14} />
      </button>
      <div className="w-[1px] h-4 bg-white/10 mx-1" />
      <button
        onClick={() => zoomOut(0.3)}
        className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-500 active:scale-90 transition-all"
      >
        <ZoomOut size={14} />
      </button>
      <button
        onClick={() => resetTransform()}
        className="px-2 text-[10px] font-black tabular-nums hover:text-white text-zinc-400 transition-colors"
      >
        Reset
      </button>
      <button
        onClick={() => zoomIn(0.3)}
        className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-[#E5FF66] active:scale-90 transition-all"
      >
        <ZoomIn size={14} />
      </button>
    </div>
  );
}

export default function IntegratedPdfViewer({ url, onClose, title }: IntegratedPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(Math.min(window.innerWidth, 600));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
      
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        limitToBounds={false}
        panning={{ disabled: false, velocityDisabled: false, lockAxisX: false, lockAxisY: false }}
        pinch={{ step: 5 }}
        wheel={{ step: 0.05, activationKeys: ["Control", "Meta"] }}
        doubleClick={{ mode: "toggle", step: 0.7 }}
        smooth={true}
      >
        {/* Header must live inside TransformWrapper to access useControls */}
        {() => (
          <>
            {/* Immersive Reader Header */}
            <motion.header
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/90 backdrop-blur-2xl absolute top-0 left-0 right-0 z-30"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all border border-white/5 shrink-0"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 min-w-0 max-w-[180px]">
                  <h3 className="text-xs font-black uppercase italic tracking-tighter truncate leading-none text-white/90">
                    {title || "Class Resource"}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5 leading-none">
                    SECURE VIEW · {numPages || "--"} PAGES
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 shrink-0">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-500 active:scale-90 transition-all"
                >
                  <RotateCw size={14} />
                </button>
              </div>
            </motion.header>

            {/* Reader Engine — vertical scroll, zoom handles pan */}
            <div className="flex-1 overflow-auto bg-zinc-950 pt-20 pb-10 scrollbar-hide">
              {loading && (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4 opacity-40">
                  <Loader2 size={32} className="animate-spin text-[#E5FF66]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E5FF66] animate-pulse">
                    Initializing Reader...
                  </p>
                </div>
              )}

              {error ? (
                <div className="flex flex-col items-center justify-center h-[70vh] gap-10 text-center max-w-[320px] mx-auto px-6">
                  <div className="w-24 h-24 rounded-[40px] bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <AlertCircle size={44} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">
                      Reader Encountered Error
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                      {error}
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onClose()}
                      className="mt-6 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 transition-all text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest w-full border border-white/5 active:scale-95"
                    >
                      <ExternalLink size={16} /> Open Document Externally
                    </a>
                  </div>
                </div>
              ) : (
                <TransformComponent
                  wrapperStyle={{ width: "100%", display: "block" }}
                  contentStyle={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                  <div
                    style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }}
                    className="transition-transform duration-300"
                  >
                    <Document
                      file={url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={null}
                      className="flex flex-col items-center gap-6 py-4 px-4"
                    >
                      {Array.from(new Array(numPages), (_, index) => (
                        <motion.div
                          key={`page_${index + 1}`}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3 }}
                          className="shadow-[0_8px_60px_rgba(0,0,0,0.7)] rounded-sm overflow-hidden"
                        >
                          <Page
                            pageNumber={index + 1}
                            width={containerWidth - 32}
                            renderAnnotationLayer={true}
                            renderTextLayer={true}
                            loading={
                              <div
                                className="bg-white/5 animate-pulse rounded-sm"
                                style={{ width: containerWidth - 32, height: (containerWidth - 32) * 1.414 }}
                              />
                            }
                          />
                        </motion.div>
                      ))}
                    </Document>
                  </div>
                </TransformComponent>
              )}
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] select-none scale-150 overflow-hidden">
        <h2 className="text-[120px] font-black italic -rotate-12 tracking-tighter whitespace-pre text-center">
          UNIVAS HUB PROTECTED
        </h2>
      </div>
    </div>
  );
}
