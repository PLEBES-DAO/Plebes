import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import ItemDetails from "@/components/pages/item/ItemDetails";

export default function ItemDetailsPage({ params }) {
  return (
    <>
      <Header1 />
      <main className="mt-24">
        <ItemDetails id={params.id} />
      </main>
      <Footer1 />
    </>
  );
}
