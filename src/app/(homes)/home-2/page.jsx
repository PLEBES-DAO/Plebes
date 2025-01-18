import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import Collections from "../../../components/homes/common/Collections";
import Process from "../../../components/homes/common/Process";
import Auction from "../../../components/homes/common/Auction";
import Featured from "../../../components/homes/common/Featured";
import Hero from "../../../components/homes/home-2/Hero";
import Partners from "../../../components/common/Partners";
export const metadata = {
  title: "Home 2 || Xhibiter | NFT Marketplace Nextjs Template",
};
export default function HomePage2() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Collections />
        <Auction />
        <Process />
        <Featured />
        <Partners />
      </main>
      <Footer1 />
    </>
  );
}
