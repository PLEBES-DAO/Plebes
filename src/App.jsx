import { Routes, Route } from "react-router-dom";
import Page from "./app/page";
import AuctionPage from "./app/(pages)/Auction/AuctionPage";
import OwnedPage from "./app/(pages)/user/owned.jsx";
import { useBioniqContext } from "./hooks/BioniqContext";
import { useEffect } from "react";
import ErrorModal from "./components/modals/ErrorModal";
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
          <div className="swiper-lazy-preloader animate-spin-slow"></div> {/* Original preloader */}
        </>
      )}

      <Routes>
        <Route path="/" element={<Page login={login} />} />
        <Route path="/auction" element={<AuctionPage liveAuction={liveAuction} login={login} />} />
        <Route path="/profile" element={<OwnedPage login={login} inscriptions={inscriptions} loading={loading} />} />
      </Routes>
      <ErrorModal modalOpen={modalOpen} setModalOpen={setModalOpen} error={error} resetError={resetError} />
    </>
  );
}

export default App;
