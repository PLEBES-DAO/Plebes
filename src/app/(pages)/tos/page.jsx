import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import Tos from "@/components/pages/Tos";

export default function TermsPage() {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <Tos />
      </main>
      <Footer1 />
    </>
  );
}
