'use client'

import { Editor } from '@monaco-editor/react'
import { useRef } from 'react'
import { MonacoBinding } from 'y-monaco'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

interface MonacoWithWebsocketProps {
  documentId: string
  defaultValue?: string
  language?: string
}

export default function MonacoWithWebsocket({
  documentId,
  defaultValue = '',
  language = 'javascript'
}: MonacoWithWebsocketProps) {
  const editorRef = useRef(null)

  // Editor value -> YJS Text value (A text value shared by multiple people)
  // One person deletes text -> Deletes from the overall shared text value
  // Handled by YJS

  // Initialize YJS, tell it to listen to our Monaco instance for changes.

  function handleEditorDidMount(editor: any, monaco: any) {
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
    console.log(provider.awareness);                
  
    awareness.on("update", () => {
      console.log("Awareness updated  ", awareness.getStates());
    });
  }

  
  return (
    <Editor
      height="90vh"
      defaultLanguage={language}
      defaultValue={defaultValue}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false }
      }}
    />
  )
}

