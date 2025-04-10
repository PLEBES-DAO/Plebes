import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import Benefits from "../../../components/homes/home-9/Benefits";
import Faq from "../../../components/homes/home-9/Faq";
import CoverFlowSlider from "../../../components/homes/home-4/CoverFlowSlider";
import Hero from "../../../components/homes/home-9/Hero";
import Intro from "../../../components/homes/home-9/Intro";

export const metadata = {
};
export default function HomePage9({ login, setModalOpen }) {
  return (
    <>
      <Navbar bLogin={login} setModalOpen={setModalOpen} />
      <main>
        <Hero />
        
      </main>
    </>
  );
}
