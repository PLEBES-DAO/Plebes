import Partners from "@/components/common/Partners";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import PageTitle from "@/components/pages/career/PageTitle";
import Perks from "@/components/pages/career/Perks";
import Positions from "@/components/pages/career/Positions";


export default function CareerPage() {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <PageTitle />
        <Positions />
        <Perks />
        <Partners />
      </main>
      <Footer1 />
    </>
  );
}
