import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function WorkspaceLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <div className="flex h-[calc(100vh-56px)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-3 scrollbar">
        {children}
      </main>
    </div>
    </div>
  );
}
