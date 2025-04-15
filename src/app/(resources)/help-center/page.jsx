import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import HelpCenter from "@/components/resources/help-center/HelpCenter";
import PageTitle from "@/components/resources/help-center/PageTitle";

export default function HelpCenterPage() {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <PageTitle />
        <HelpCenter />
      </main>
      <Footer1 />
    </>
  );
}
