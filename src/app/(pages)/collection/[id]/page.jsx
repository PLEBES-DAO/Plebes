import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import Banner from "@/components/pages/collection/Banner";
import Collection from "@/components/pages/collection/Collection";
import Profile from "@/components/pages/collection/Profile";


export default function ClooectionSinglePage({ params }) {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <Banner />
        <Profile id={params.id} />
        <Collection />
      </main>
      <Footer1 />
    </>
  );
}
