import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function HomeLayout({
  children,
}: {
    children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen min-w-screen overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
    </div>
  )
}