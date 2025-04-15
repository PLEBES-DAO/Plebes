import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import BidModal from "../../../components/modals/BidModal";

import ItemDetails from "../../../components/pages/item/ItemDetails";

import { useEffect,useState } from "react";


export default function AuctionPage({login,liveAuction,setModalOpenT}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Navbar bLogin={login} setModalOpen={setModalOpenT} />
      <main>
       <ItemDetails setModalOpen={setModalOpen} liveAuction={liveAuction} id={1}/>
       <BidModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      </main>
      <Footer1 />
    </>
  );
}
