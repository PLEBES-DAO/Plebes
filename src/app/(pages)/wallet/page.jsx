import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Navbar";
import PageTitle from "@/components/pages/wallet/PageTitle";
import Wallets from "@/components/pages/wallet/Wallets";

export default function WalletPage() {
  return (
    <>
      <Header1 />
      <main className="pt-[5.5rem] lg:pt-24">
        <PageTitle />
        <Wallets />
      </main>
      <Footer1 />
    </>
  );
}
