import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import SinglePost from "@/components/resources/SinglePost";

export default function SinglePostPage({ params }) {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <SinglePost id={params.id} />
      </main>
      <Footer1 />
    </>
  );
}
