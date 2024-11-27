import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';


// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

const PDFViewer = ({ filePath }: {filePath: string | undefined}) => {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages } : {numPages: number}) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError(`Failed to load PDF: ${error.message}`);
  }

  if (!filePath) {
    return <div className="flex items-center justify-center h-full">No PDF to display</div>;
  }
  
  return (
    <div className="pdf-viewer">
      {error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <Document
          file={filePath}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className={"flex-col w-8/12 h-[792px] overflow-auto justify-center items-center border-2 border-gray-300 rounded-md"}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page 
              key={`page_${index + 1}`} 
              pageNumber={index + 1} 
              renderTextLayer={false}
              className="mb-4"
            />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PDFViewer;