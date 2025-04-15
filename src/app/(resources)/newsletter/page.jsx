import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import NewsLetter from "@/components/resources/NewsLetter";

export default function NewsLatterPage() {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <NewsLetter />
      </main>
      <Footer1 />
    </>
  );
}
