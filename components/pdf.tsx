import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import "react-pdf/dist/esm/Page/TextLayer.css";

// You might need to specify the workerSrc to avoid issues in certain setups
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ filePath }: {filePath: string | undefined}) => {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages } : {numPages: number}) {
    setNumPages(numPages);
    setError(null); // Clear any previous errors
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Error loading PDF');
  }

  const starterPath = "../../public/starter.pdf";
  
  return (
    <div className="pdf-viewer">
      {error && <p className="error-message">{error}</p>}
      <Document
        file={filePath || starterPath}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className={"flex-col w-8/12 h-[792px] overflow-auto justify-center items-center border-2 border-gray-300 rounded-md"}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false}/>
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;