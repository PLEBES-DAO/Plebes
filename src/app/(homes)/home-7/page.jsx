import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import Partners from "@/components/common/Partners";
import Blogs from "@/components/homes/home-7/Blogs";
import Cta from "@/components/homes/home-7/Cta";
import Faq from "@/components/homes/home-7/Faq";
import Hero from "@/components/homes/home-7/Hero";
import Promo from "@/components/homes/home-7/Promo";
import Service from "@/components/homes/home-7/Service";
import Testimonials from "@/components/common/Testimonials";

export const metadata = {
};
export default function HomePage7() {
  return (
    <>
      <Header1 />
      <main>
        <Hero />
        <Partners />
        <Service />
        <Promo />
        <Testimonials />
        <Faq />
        <Blogs />
        <Cta />
      </main>
      <Footer1 />
    </>
  );
}
