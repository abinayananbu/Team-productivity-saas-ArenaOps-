import { useState } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { FileText, Plus } from "lucide-react";

export default function DocsPage() {
  const [docs, setDocs] = useState([
    { id: 1, title: "Product Requirements", content: "PRD content here..." },
    { id: 2, title: "Sprint Notes", content: "Sprint notes..." },
  ]);

  const [activeDoc, setActiveDoc] = useState(docs[0]);

  function createDoc() {
    const newDoc = {
      id: Date.now(),
      title: "Untitled Doc",
      content: "",
    };
    setDocs([newDoc, ...docs]);
    setActiveDoc(newDoc);
  }

  function updateContent(value) {
    setDocs(
      docs.map((d) =>
        d.id === activeDoc.id ? { ...d, content: value } : d
      )
    );
    setActiveDoc({ ...activeDoc, content: value });
  }

  return (
    <WorkspaceLayout>
      <div className="flex h-full">

        {/* Docs List */}
        <aside
          className="w-64 border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-[#1e1f21] p-4 space-y-4"
        >
          <button
            onClick={createDoc}
            className="w-full flex items-center gap-2 px-3 py-2
            rounded-lg text-sm font-medium
            bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Plus size={16} />
            New Doc
          </button>

          <div className="space-y-1">
            {docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg
                  text-sm text-left
                  ${
                    activeDoc.id === doc.id
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <FileText size={14} />
                {doc.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-[#151617]">
          {activeDoc ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <input
                value={activeDoc.title}
                onChange={(e) =>
                  setActiveDoc({ ...activeDoc, title: e.target.value })
                }
                className="w-full text-2xl font-semibold
                  bg-transparent outline-none
                  text-gray-900 dark:text-gray-100"
              />

              <textarea
                value={activeDoc.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Start writing..."
                className="w-full h-[60vh] resize-none
                  bg-white dark:bg-[#1e1f21]
                  border border-gray-200 dark:border-gray-800
                  rounded-xl p-4 text-sm
                  text-gray-700 dark:text-gray-300
                  focus:outline-none"
              />
            </div>
          ) : (
            <p className="text-gray-500">Select a document</p>
          )}
        </main>

      </div>
    </WorkspaceLayout>
  );
}
