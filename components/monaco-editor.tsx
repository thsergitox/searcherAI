'use client'

import PDFViewer from '@/components/pdf'
import { Editor } from '@monaco-editor/react'
import { useQuery } from "@tanstack/react-query"
import * as monaco from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'
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
  language = 'latex'
}: MonacoWithWebsocketProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [editorText, setEditorText] = useState(defaultValue)

  const { isLoading, data, error } = useQuery({
    queryKey: ['retrieve-latex', editorText],
    queryFn: async () => {
      const latexContent = editorText.replace(/\\/g, '\\\\');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/latex/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex: latexContent }),
      });
      const data = await response.blob();
      return URL.createObjectURL(data);
    },
    enabled: !!editorText,
    retry: false
  });

  // Editor value -> YJS Text value (A text value shared by multiple people)
  // One person deletes text -> Deletes from the overall shared text value
  // Handled by YJS

  useEffect(() => {
    monaco.languages.registerCompletionItemProvider("latex", {
      triggerCharacters: ["/"], // Trigger suggestions on '/'
      provideCompletionItems: function (model: monaco.editor.ITextModel, position: monaco.Position) {
        const word = model.getWordUntilPosition(position);
        //logic to get rid of the first slash and word
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn - 1, // Adjusted to include the trigger character
          endColumn: position.column,
        };

        //list of commands
        const suggestions = [
          {
            label: "/resumeList",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "% === BEGIN resumeList SECTION ===",
              "\\begin{itemize}",
              "  \\item ${1:First item}",
              "  \\item ${2:Second item}",
              "\\end{itemize}",
              "% === END resumeList SECTION ===",
            ].join("\n"),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "/unionsetproof",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "\\${First set}",
              "  \\${union symbol}",
              "  \\${secondset}",
            ].join("\n"),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "DeMorgan's Law",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: [
              "% Applying DeMorgan's Law",
              "% NOT (A OR B) is equivalent to NOT A AND NOT B",
              "% NOT (A AND B) is equivalent to NOT A OR NOT B",
              "\\overline{${1:A} \\cup ${2:B}} = \\overline{${1:A}} \\cap \\overline{${2:B}}",
              "\\overline{${1:A} \\cap ${2:B}} = \\overline{${1:A}} \\cup \\overline{${2:B}}",
              "% Replace A and B with your specific variables",
            ].join("\n"),
            detail: "Insert DeMorgan's Law with placeholders for A and B",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "not op",
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: "\\neg",
            detail: "Insert Not Operator",
          },
          {
            label: "or op",
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: "\\lor",
            detail: "Insert Or Operator",
          },
          {
            label: "and op",
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: "\\land",
            detail: "Insert And Operator",
          },
          {
            label: "sum op",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "\\sum_{i=${1:1}}^{${2:n}} ${3:expr}",
            detail: "Insert Summation",
          },
          {
            label: "implies",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "\\leftrightarrow",
            detail: "Implies",
          },
          {
            label: "iff",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "\\rightarrow",
            detail: "If and only if",
          },
          {
            label: "uni",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\cup",
            detail: "Insert Union of Sets",
          },
          {
            label: "intersec",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\cap",
            detail: "Insert Intersection of Sets",
          },

          {
            label: "curly",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\{ $1 \\}",
            detail: "Insert Curly Braces",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "square",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\[ $1 \\]",
            detail: "Insert Square Braces",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "angle",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\langle $1 \\rangle",
            detail: "Insert Angle Braces",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "bar",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\bar{$1}",
            detail: "Insert Bar Over Character",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },

          {
            label: "cup",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\bigcup_{$1}^{$2}",
            detail: "Insert Big Union",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "cap",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "\\bigcap_{$1}^{$2}",
            detail: "Insert Big Intersection",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },

          {
            label: "/resumeHeader",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "% === BEGIN resumeHeader SECTION ===",
              "\\begin{center}",
              "    \\textbf{\\Huge \\scshape ${1:Name}} \\\\ \\vspace{1pt}", // ${1:Name} as a fillable
              "    \\small \\faIcon{envelope} ${2:email@example.com} $|$ \\faIcon{globe} \\href{${3:https://yourwebsite.com/}}{\\underline{Personal Website}} $|$ \\faIcon{youtube} \\href{${4:https://www.youtube.com}}{\\underline{Self Intro Video}} $|$",
              "    \\faIcon{linkedin} \\href{${5:https://www.linkedin.com/in/yourprofile/}}{\\underline{LinkedIn}}$|$",
              "    \\faIcon{github}",
              "    \\href{${6:https://github.com/yourusername}}{\\underline{Github}}",
              "\\end{center}",
              "% === END resumeHeader SECTION ===",
            ].join("\n"),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "/resumeTemplate", // Trigger label
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              // Heading
              "% === HEADING SECTION ===",
              "\\begin{center}",
              "    \\textbf{\\Huge \\scshape ${1:Your Name}} \\\\ \\vspace{1pt}",
              "    \\small \\faIcon{envelope} ${2:your_email@example.com} $|$ \\faIcon{globe} \\href{${3:https://yourwebsite.com/}}{\\underline{Personal Website}} $|$ \\faIcon{youtube} \\href{${4:https://www.youtube.com}}{\\underline{Self Intro Video}} $|$",
              "    \\faIcon{linkedin} \\href{${5:https://www.linkedin.com/in/yourprofile/}}{\\underline{LinkedIn}}$|$",
              "    \\faIcon{github} \\href{${6:https://github.com/yourusername}}{\\underline{Github}}",
              "\\end{center}",
              "% === END HEADING SECTION ===",

              // Education
              "% === EDUCATION SECTION ===",
              "\\section{Education}",
              "  \\resumeSubHeadingListStart",
              "    \\resumeSubheading",
              "      {${7:University Name}}{${8:City, State}}",
              "      {\\emph{${9:Degree} in ${10:Major}}}{\\emph{${11:Graduation Month, Year}}}",
              "  \\resumeSubHeadingListEnd",
              "% === END EDUCATION SECTION ===",

              // Experience
              "% === EXPERIENCE SECTION ===",
              "\\section{Experience}",
              "  \\resumeSubHeadingListStart",
              "    \\resumeSubheading",
              "      {${12:Company Name}}{${13:Location}}",
              "      {\\emph{${14:Job Title}}}{\\emph{${15:Start Date – End Date}}}",
              "      \\resumeItemListStart",
              "        \\resumeItem{${16:Description of your responsibility or achievement}}",
              "      \\resumeItemListEnd",
              "  \\resumeSubHeadingListEnd",
              "% === END EXPERIENCE SECTION ===",

              // Projects
              "% === PROJECTS SECTION ===",
              "\\section{Projects}",
              "  \\resumeSubHeadingListStart",
              "    \\resumeProjectHeading",
              "          {\\textbf{${17:Project Name}} $|$ \\emph{${18:Technologies Used}}}{${19:Date}}",
              "          \\resumeItemListStart",
              "            \\resumeItem{${20:Project description and achievements}}",
              "          \\resumeItemListEnd",
              "  \\resumeSubHeadingListEnd",
              "% === END PROJECTS SECTION ===",

              // Additional Information
              "% === ADDITIONAL INFORMATION SECTION ===",
              "\\section{Additional}",
              " \\begin{itemize}[leftmargin=0.15in, label={}]",
              "    \\small{\\item{",
              "       \\resumeItemListStart",
              "            \\resumeItem{${21:Interesting fact or hobby}}",
              "       \\resumeItemListEnd",
              "    }}",
              "% === END ADDITIONAL INFORMATION SECTION ===",
            ].join("\n"), // Join the array elements into a single string with new lines
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
        ];
        //map function to get rid of the length fo the concatenated string
        return {
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            range,
          })),
        };
      },
    });

    const keywords = [
      "\\alpha", "\\beta", "\\gamma", "\\delta", "\\epsilon", "\\zeta", "\\eta", "\\theta", "\\iota", "\\kappa", "\\lambda", "\\mu", "\\nu", "\\xi", "\\omicron", "\\pi", "\\rho", "\\sigma", "\\tau", "\\upsilon", "\\phi", "\\chi", "\\psi", "\\omega"
    ];

    monaco.languages.registerCompletionItemProvider("latex", {
      triggerCharacters: ["\\"], // Trigger suggestions on '\'
      provideCompletionItems: function (model: monaco.editor.ITextModel, position: monaco.Position) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        return {
          suggestions: keywords.filter(w => w.startsWith(word.word)).map((label) => ({
            label,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: label,
            range,
          }))
        };
      },
    });
  }, [monaco]);


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
            setupLanguage(monaco as typeof import('monaco-editor-core'))
          }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on'
          }}
        />
      </div>
      <div className="w-1/2 border-l p-4">
        {isLoading ? (
          <p>Rendering LaTeX...</p>
        ) : error ? (
          <div className="text-red-500">
            <p>Error: {error instanceof Error ? error.message : 'Failed to render LaTeX'}</p>
          </div>
        ) : (
          <PDFViewer filePath={data} />
        )}
      </div>
    </div>
  )
}

