import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col bg-gray-100 p-4 pt-0">
      <div className="flex-1 flex justify-center items-center">{children}</div>
      <Footer />
    </main>
  );
}
