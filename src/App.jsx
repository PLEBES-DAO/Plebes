import { Routes, Route } from "react-router-dom";
import HomePage from "./app/(homes)/launchpad/page.jsx";
import Page from "./app/page";
import AuctionPage from "./app/(pages)/Auction/AuctionPage";
import OwnedPage from "./app/(pages)/user/owned.jsx";
import Deposit from "./app/(pages)/deposit/Deposit.jsx";
import { useBioniqContext } from "./hooks/BioniqContext";
import { useEffect } from "react";
import ErrorModal from "./components/modals/ErrorModal";
import TransferModal from './components/modals/TransferckBTCModal.jsx';
import DAO from "./app/(homes)/dao/page.jsx";
import ProposalPage from "./app/(homes)/proposal_page/page.jsx";
import {
  useState
} from "react";





function App() {
  const {
    login,
    userConnection,
    reloadInscriptions,
    reloadWallets,
    liveBioniqWalletApi,
    wallets,
    liveAuction,
    loading, // Assuming you have a loading state in your context
    error,
    resetError,
    inscriptions
  } = useBioniqContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [ wihdrawlModal,setWithdralModal] = useState(false);


  useEffect(() => {
    console.log("loading change!", error,inscriptions)
    if (error !== null) {
      setModalOpen(true);
    }
  }, [loading, error,inscriptions])

  return (
    <>
      {/* Conditionally render the loading overlay */}
      {loading && (
        <>
          {false && <div className="swiper-lazy-preloader animate-spin-slow"></div>}
        </>
      )}

      <Routes>
        <Route path="/" element={<Page login={login} setModalOpen={setWithdralModal} />} />
        <Route path="/auction" element={<AuctionPage liveAuction={liveAuction} login={login} setModalOpenT={setWithdralModal}  />} />
        <Route path="/profile" element={<OwnedPage login={login} inscriptions={inscriptions} loading={loading} setModalOpen={setWithdralModal}  />} />
        <Route path="/deposit" element={<Deposit login={login} setModalOpenT={setWithdralModal}  />} />
        <Route path="/launchpad" element={<HomePage login={login} setModalOpenT={setWithdralModal} />} />
        <Route path="/dao" element={<DAO login={login} setModalOpenT={setWithdralModal} />} />
        <Route path="/proposal_page" element={<ProposalPage login={login} setModalOpenT={setWithdralModal} />} />

      </Routes>
      <ErrorModal modalOpen={modalOpen} setModalOpen={setModalOpen} error={error} resetError={resetError} />
      <TransferModal isOpen={wihdrawlModal} setModalOpen={setWithdralModal} />
    </>
  );
}

export default App;
