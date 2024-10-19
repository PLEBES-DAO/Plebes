import Footer1 from "../../../components/footer/Footer1";
import Header1 from "../../../components/headers/Header1";
import BidModal from "../../../components/modals/BidModal";

import ItemDetails from "../../../components/pages/item/ItemDetails";

import { useEffect,useState } from "react";


export const metadata = {
  title: "Home 9 || Xhibiter | NFT Marketplace Nextjs Template",
};
export default function AuctionPage({login,liveAuction}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Header1 bLogin={login} />
      <main>
       <ItemDetails setModalOpen={setModalOpen} liveAuction={liveAuction} id={1}/>
       <BidModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      </main>
      <Footer1 />
    </>
  );
}
