'use client'

import PDFViewer from '@/components/pdf'
import { Editor } from '@monaco-editor/react'
import { useQuery } from "@tanstack/react-query"
import * as monaco from 'monaco-editor'
import { useRef, useState } from 'react'
import { MonacoBinding } from 'y-monaco'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { setupLanguage } from "@/lib/latex/setup"

interface MonacoWithWebsocketProps {
  documentId: string
  defaultValue?: string
  language?: string
}

export default function MonacoWithWebsocket({
  documentId,
  defaultValue = '',
  language = 'latex'  // Changed default to latex
}: MonacoWithWebsocketProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [editorText, setEditorText] = useState(defaultValue)

  // Editor value -> YJS Text value (A text value shared by multiple people)
  // One person deletes text -> Deletes from the overall shared text value
  // Handled by YJS

  const { isLoading, data } = useQuery({
    queryKey: ['retrieve-latex', editorText],
    queryFn: async () => {
      const latexContent = editorText.replace(/\\/g, '\\\\');

      const response = await fetch('http://localhost:8000/api/render-latex/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: latexContent }),
      });
      const data = await response.blob();
      const url = URL.createObjectURL(data);
      console.log(url);
      return url;
    },
    enabled: !!editorText, // This ensures the query doesn't run until editorText is not empty
  });


  // Initialize YJS, tell it to listen to our Monaco instance for changes.
  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;

    

    // Initialize YJS
    const doc = new Y.Doc(); // a collection of shared objects -> Text
    // Connect to peers (or start connection) with WebRTC
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!websocketUrl) {
      throw new Error('WEBSOCKET_URL env variable is required')
    }
    const provider = new WebsocketProvider(websocketUrl, documentId, doc); // room1, room2
    const type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
    // Bind YJS to Monaco 
    const awareness = provider.awareness;
    // @ts-expect-error MonacoBinding is not a constructor
    const binding = new MonacoBinding(type, editorRef.current!.getModel(), new Set([editorRef.current!]), awareness);
    binding._beforeTransaction = () => { }              
  
    awareness.on("update", () => {
      console.log("Awareness updated  ", awareness.getStates());
    });
  }

  
  return (
    <div className="flex">
      <div className="w-1/2">
      <Editor
        height="90vh"
        defaultLanguage={language}
        defaultValue={defaultValue}
        theme="vs-light"
        onChange={(value) => setEditorText(value || '')}
        beforeMount={(monaco) => {
        // @ts-expect-error MonacoBinding is not a constructor
        setupLanguage(monaco)
        }}
        onMount={handleEditorDidMount}
        options={{
        minimap: { enabled: false },
        wordWrap: 'on'  // Added for better LaTeX editing
        }}
      />
      </div>
      <div className="w-1/2 border-l p-4">
      {
        isLoading ? <p>Loading...</p> : (
        <PDFViewer filePath={data} />
        )
      }
      </div>
    </div>
    

  )
}

