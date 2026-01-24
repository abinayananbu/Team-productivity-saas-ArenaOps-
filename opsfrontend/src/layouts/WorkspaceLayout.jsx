import Navbar from "../components/Navbar";

export default function WorkspaceLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
