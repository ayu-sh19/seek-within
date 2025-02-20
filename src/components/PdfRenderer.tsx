"use client";

import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
  url: string;
}
const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* Top Bar */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap1.5"></div>
      </div>
      {/* PDF Render */}
      <div className="flex-1 w-full max-h-screen ">
        <div ref={ref}>
          <Document
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
            onLoadError={() => {
              toast({
                title: "Error Loading PDF",
                description: "Please try again.",
                variant: "destructive",
              });
            }}
            file={url}
            className="max-h-full"
          >
            <Page width={width ? width : 1} pageNumber={2} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
