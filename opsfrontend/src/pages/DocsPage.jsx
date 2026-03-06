import { useState, useEffect, useCallback, useRef } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { FileText, Plus, Loader2, Trash } from "lucide-react";
import { createDocsApi, showDocsApi , saveDocApi, deleteDocApi   } from "../services/api";

// Simple debounce utility (no external deps)
function useDebounce(callback, delay) {
  const timeoutRef = useRef();
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

export default function DocsPage() {
  const [docs, setDocs] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [projectToDelete,setProjectToDelete]= useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null;

  const loadData = useCallback(async () => {
    try {
      const res = await showDocsApi();
      setDocs(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Unable to get data:", err);
      setError("Failed to load documents. Please try again.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  //  SINGLE updateActiveDoc with debounced save
  const debouncedSave = useDebounce(async (docId, updates) => {
    try {
      setIsSaving(true);
       await saveDocApi(docId, updates);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, 1500);

  const updateActiveDoc = useCallback((updates) => {
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === activeDocId ? { ...doc, ...updates } : doc
      )
    );
    
    // Auto-save after update (disabled until API exists)
    if (activeDocId) {
      debouncedSave(activeDocId, updates);
    }
  }, [activeDocId, debouncedSave]);

  const createDoc = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const payload = {
        title: "Untitled Doc",
        content: "",
      };

      const res = await createDocsApi(payload);
      const newDoc = res.data;
      setDocs((prev) => [newDoc, ...prev]);
      setActiveDocId(newDoc.id); 
      loadData();
    } catch (err) {
      console.error("Document creation failed:", err);
      setError("Failed to create document. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteDoc = async(id) =>{
    try{
      await deleteDocApi(id);
      loadData();
    }catch{
      console.error("Document deletion failed:", err);
      setError("Failed to delete document. Please try again.");
    }
  }

  return (  
    <WorkspaceLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1f21] p-4 space-y-4">
          <button
            onClick={createDoc}
            disabled={isCreating}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {isCreating ? "Creating..." : "New Doc"}
          </button>

          {error && (
            <p className="text-xs text-red-500 px-1">{error}</p>
          )}

          {isSaving && (
            <p className="text-xs text-indigo-500 px-1 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Saving...
            </p>
          )}

          <div className="space-y-1">
            {docs.length === 0 && !isCreating ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 px-2">
                No documents yet.
              </p>
            ) : docs.map((doc) => (
              <div
                key={doc.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveDocId(doc.id)}
                onKeyDown={(e) => e.key === "Enter" && setActiveDocId(doc.id)}
                className={`group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left cursor-pointer transition-colors ${
                  activeDocId === doc.id
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{doc.title || "Untitled Doc"}</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setProjectToDelete(doc.id); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(),setShowDeleteConfirm(true) , setProjectToDelete(doc.id))}
                  className="shrink-0 rounded hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash size={10} />
                </div>
              </div>
            ))}
            {showDeleteConfirm && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white dark:bg-[#1e1f21] rounded-xl shadow-lg w-full max-w-sm p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Confirm Delete</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                   Are you sure you want to delete this Document? 
                  </p>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); deleteDoc(projectToDelete); }}
                      className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-[#151617]">
          {activeDoc ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <input
                value={activeDoc.title}
                onChange={(e) => updateActiveDoc({ title: e.target.value })}
                className="w-full text-2xl font-semibold bg-transparent outline-none text-gray-900 dark:text-gray-100"
                placeholder="Untitled Doc"
              />
              <textarea
                value={activeDoc.content}
                onChange={(e) => updateActiveDoc({ content: e.target.value })}
                placeholder="Start writing..."
                className="w-full h-[60vh] resize-none bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Create or select a document to get started.
              </p>
            </div>
          )}
        </main>
      </div>
    </WorkspaceLayout>
  );
}
