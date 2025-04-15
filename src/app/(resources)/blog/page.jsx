import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import Blogs from "@/components/resources/Blogs";

export default function BlogPage() {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <Blogs />
      </main>
      <Footer1 />
    </>
  );
}
