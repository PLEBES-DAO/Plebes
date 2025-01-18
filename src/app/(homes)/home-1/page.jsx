import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import Categories from "../../../components/homes/common/Categories";
import Collections from "../../../components/homes/common/Collections";
import Hero from "../../../components/homes/home-1/Hero";
import Hotbids from "../../../components/homes/home-1/Hotbids";
import Process from "../../../components/homes/common/Process";

export const metadata = {
  title: "Home 1 || Xhibiter | NFT Marketplace Nextjs Template",
};
export default function HomePage1() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Collections />
        <Categories />
        <Process />
      </main>
      <Footer1 />
    </>
  );
}
