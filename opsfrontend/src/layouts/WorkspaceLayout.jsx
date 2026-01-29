import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function WorkspaceLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 bg-gray-100 dark:bg-[#121212]">
          {children}
        </main>
      </div>
    </div>
  );
}
