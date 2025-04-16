import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import Collections from "@/components/pages/collections-wide-sidebar/Collections";


export default function CollectionWideSidebarPage() {
  return (
    <>
      <Header1 />
      <main className="mt-24">
        <Collections />
      </main>
      <Footer1 />
    </>
  );
}
