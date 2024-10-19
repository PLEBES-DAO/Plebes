import Footer1 from "../../../components/footer/Footer1";
import Header1 from "../../../components/headers/Header1";
import Benefits from "../../../components/homes/home-9/Benefits";
import Cta from "../../../components/homes/home-9/Cta";
import Faq from "../../../components/homes/home-9/Faq";
import Featured from "../../../components/homes/home-3/Featured";
import Collections from "../../../components/homes/home-3/Collections";
import Testimonials from "../../../components/common/Testimonials";
import Blogs from "../../../components/homes/home-7/Blogs";
import Team from "../../../components/homes/home-12/Team";
import Roadmap from "../../../components/homes/home-12/Roadmap";
import AggregatorTable from "../../../components/homes/home-13/AggregatorTable";

import CoverFlowSlider from "../../../components/homes/home-4/CoverFlowSlider";


import Hero from "../../../components/homes/home-9/Hero";
import Intro from "../../../components/homes/home-9/Intro";
import Partners from "../../../components/common/Partners2";
import Partners2 from "../../../components/homes/home-9/Partners2";

export const metadata = {
  title: "Home 9 || Xhibiter | NFT Marketplace Nextjs Template",
};
export default function HomePage9({login}) {
  return (
    <>
      <Header1 bLogin={login} />
      <main>
        <Hero />
        <Intro />
        <Benefits />
        {/* <CoverFlowSlider/> */}
        <Faq />
        {/* <Collections/> */}
        {/* <Partners2 /> */}
        {/* <Testimonials/> */}
        {/* <Cta/> */}
        {/* <Blogs/> */}
        {/* <Team/> */}
        {/* <Roadmap/> */}
        {/* <AggregatorTable/> */}
      </main>
      <Footer1 />
    </>
  );
}
