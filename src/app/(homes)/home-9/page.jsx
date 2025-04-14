import Navbar from "../../../components/headers/Navbar.jsx";
import Hero from "../../../components/homes/home-9/Hero";

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
