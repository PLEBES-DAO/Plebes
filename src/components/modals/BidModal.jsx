import { useEffect, useRef, useState } from 'react';
import { useBioniqContext } from '../../hooks/BioniqContext';
import { formatNumberWithPattern } from '../../utils';

export default function BidModal({ modalOpen, setModalOpen }) {
  const { createAbid,balances,toDecilamAmounts,convertUsdToBtcOnDemand,convertBtcToUsd } = useBioniqContext();
  const[ckBTCUSDBalance, setCkBTCUSD] = useState(null);

  const modalRef = useRef();

  // State to store the bid amount
  const [bidAmount, setBidAmount] = useState('0.0');
  const [bidAmountBTC,setBidAmountBTC] = useState(null);

  // onChange handler for the input field
  const handleBidChange = async (event) => {
    setBidAmount(event.target.value);
   let btc= await convertUsdToBtcOnDemand(event.target.value);
   console.log("btc",btc);
    setBidAmountBTC(btc.toString());
  };

  const handlePlaceBid = async () =>{
    setModalOpen(false);
    // if(bidAmount < formatNumberWithPattern(balances[1].available.fullAmount)){
    //   return "Your balance is insufficient to place a bid for this amount.";
    // }
    await createAbid(bidAmountBTC);
  };


  useEffect(() => {
    // 1) Define an async function inside the effect
    const convertBalance = async () => {
      try {
        // e.g. parse the ckBTC balance as a number
        const ckBtcBalance = formatNumberWithPattern(balances[1].available.fullAmount);
  
        // 2) Await the async conversion
        const usdVal = await convertBtcToUsd(ckBtcBalance);
  
        // 3) Format the result
        const usdValString = Number(usdVal).toFixed(2);
  
        console.log("usdValString", usdValString);
  
        // 4) Update state
        setCkBTCUSD(usdValString);
      } catch (err) {
        console.error("Error converting ckBTC to USD:", err);
      }
    };
  
    // 5) Call that async function if balances exist
    if (balances && balances[1]) {
      convertBalance();
    }
  }, [balances]); // <- dependencies
  

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [modalOpen, setModalOpen,balances]);

  return (
    <div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="modal-dialog max-w-2xl bg-white rounded-lg shadow-lg p-6"
          >
            {/* Modal Header */}
            <div className="modal-header flex justify-between items-center">
              <h5 className="modal-title font-semibold text-xl">Place a bid</h5>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-close text-black"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="h-6 w-6"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body p-6">
              {/* Price input */}
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-sm font-semibold">
                  Price
                </span>
              </div>
              <div className="relative mb-2 flex items-center rounded-lg border px-2">
                <span className="mr-2">USD</span>
                <input
                  type="text"
                  className="h-12 w-full focus:ring-inset focus:ring-accent"
                  placeholder="Amount"
                  value={bidAmount} // Controlled input
                  onChange={handleBidChange} // onChange handler
                />
              </div>

              <div className="text-right">
                <span className="text-sm">Balance: { ckBTCUSDBalance &&   ckBTCUSDBalance+" USD"}</span>
              </div>

              {/* Terms */}
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-5 w-5"
                />
                <label htmlFor="terms" className="text-sm">
                  By checking this box, I agree to the{" "}
                  <a href="#" className="text-accent">Terms of Service</a>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer flex justify-center">
              <button
                type="button"
                className="bg-accent py-3 px-8 text-white rounded-full shadow-lg"
                onClick={handlePlaceBid}
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
