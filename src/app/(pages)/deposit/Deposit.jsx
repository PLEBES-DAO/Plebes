import Footer1 from "../../../components/footer/Footer1";
import Header1 from "../../../components/headers/Header1";

import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

import { useBioniqContext } from "../../../hooks/BioniqContext";



const TokenRow = () => {
    const { wallets, buy } = useBioniqContext();
    const [amount, setAmount] = useState(0);
    const [fromToken, setFromToken] = useState("sol");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [apiResponse, setApiResponse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [hasFetched, setHasFetched] = useState(false); // Track if the transaction has been fetched
    const [polling, setPolling] = useState(false); // Track polling state
    const [interval, setIntervalState] = useState(null); // Store interval reference


    // Fetch user transactions on component load
    useEffect(() => {
        const fetchUserTransactions = async () => {
            if (!wallets?.ckBTC?.walletAddressForDisplay) return;

            try {
                const response = await fetch(
                    `https://api.plebes.xyz/user-transactions/${wallets.ckBTC.walletAddressForDisplay}`
                );
                const data = await response.json();
                const transaction = data.transactions[0];
                setApiResponse(transaction);
                setPolling(true)
                setStatus(transaction ? transaction.details.status : ""); // Set initial status only if a transaction exists
            } catch (error) {
                console.error("Failed to fetch user transactions", error);
            }
        };

        fetchUserTransactions();
    }, [wallets]);
    //status ->waiting->sending->finished
    // Poll the server every second if a transaction exists
    useEffect(() => {
        if (polling) {
            //  setPolling(true); // Start polling when there's a transaction
            setIntervalState(setInterval(async () => {
                try {
                    const response = await fetch(
                        `https://api.plebes.xyz/user-transactions/${wallets.ckBTC.walletAddressForDisplay}`
                    );
                    const data = await response.json();
                    const transaction = data.transactions[0];

                 
                        if (transaction.details.status === "finished") {
                            console.log("status finished")
                            setPolling(false);
                            await buy()
                            handleDeleteExchange()
                        }
                        setApiResponse(transaction); // Update the transaction details
                        setStatus(transaction.details.status);
                 
                } catch (error) {
                    setPolling(false)
                    console.error("Failed to fetch transaction updates", error);
                }
            }, 1000)); // Poll every second
        } else {
            clearInterval(interval);

        }
        // Clean up polling on component unmount or when transaction is not present
        return () => {
            console.log("before clearing the interval")
            if (!polling) {
                console.log("inside clear interval if")
                clearInterval(interval);
            }
            //setPolling(false); // Stop polling when transaction is removed or status is updated
        };
    }, [polling]);

    const handleCreateExchange = async () => {
       // setStatus("Awaiting deposit");
        const payload = {
            route: {
                from: { symbol: fromToken, network: "mainnet" },
                to: { symbol: "icp", network: "mainnet" },
            },
            amount: parseFloat(amount),
            estimation: "direct",
            rate: "floating",
            address: AccountIdentifier.fromPrincipal({
                principal: wallets.ckBTC.walletPrincipal,
            }).toHex(),
            user_id: wallets?.ckBTC?.walletAddressForDisplay,
        };

        try {
            setLoading(true);
            const response = await fetch("https://api.plebes.xyz/create-exchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if(apiResponse?.details?.err){
                throw new Error("error");
            }
            setApiResponse(data);
            setPolling(true);
          //  setStatus("Receiving ICP");
        } catch (error) {
            console.error("API Request Failed", error);
         //   setStatus("Error during deposit process");
        } finally {
            setHasFetched(true); // Mark fetch as completed
            setLoading(false);
        }
    };

    const handleDeleteExchange = async () => {
        if (!wallets?.ckBTC?.walletAddressForDisplay) return; // Ensure user wallet is available
        try {
            setLoading(true); // Show loading state during the request
            const response = await fetch(
                `https://api.plebes.xyz/delete-transaction/${wallets.ckBTC.walletAddressForDisplay}`,
                { method: "GET" }
            );

            if (response.ok) {
                // Successfully deleted transaction
                setApiResponse(null); // Clear the transaction details
                setPolling(false);
             //   setStatus(""); // Clear status
            } else {
                // Handle error from the API
                console.error("Failed to delete the transaction");
             //   setStatus("Error deleting transaction. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
         //   setStatus("Error deleting transaction. Please check your connection.");
        } finally {
            setPolling(false);
            setLoading(false); // Hide loading state
            setShowModal(false); // Close the confirmation modal
        }
    };

    const isError = hasFetched ? !apiResponse?.details?.deposit?.address : false // Only show error after fetching

    return (
        <section className="relative pt-20 pb-24 lg:py-24">
            {/* Input Section */}
            <div className="flex items-center gap-4 p-4 bg-jacarta-800 rounded-lg shadow-sm dark:bg-jacarta-700">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
                        Token
                    </label>
                    <select
                        value={fromToken}
                        onChange={(e) => setFromToken(e.target.value)}
                        className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600"
                    >
                        <option value="sol">SOL</option>
                        <option value="eth">ETH</option>
                        <option value="btc">BTC</option>
                        <option value="usdt">USDT</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
                        Amount
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600"
                        placeholder="0.00"
                    />
                </div>

                <button
                    onClick={handleCreateExchange}
                    className="px-4 py-2 bg-accent text-white rounded-lg shadow hover:bg-accent-dark focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Start"}
                </button>
            </div>

            {/* Response Section */}
            {/* Response Section */}
            {!isError && apiResponse?.details && (
                <div>
                    <div className="mt-6 p-4 bg-jacarta-800 rounded-lg shadow-sm dark:bg-jacarta-700 relative">
                        <h2 className="text-lg font-medium text-jacarta-100 mb-4">
                            Exchange Details
                        </h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                            X
                        </button>
                        <div className="grid grid-cols-1 gap-4">
                            {/* QR Code and Address Section */}
                            <div className="flex flex-col items-center gap-2">
                                <QRCodeSVG value={apiResponse.details.deposit.address} size={300} />
                                <span className="block text-jacarta-100 break-all">
                                    {apiResponse.details.deposit.address}
                                </span>
                            </div>

                            {/* Deposit Amount Section */}
                            <div className="flex flex-col items-center">
                                <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100">
                                    Deposit Amount:
                                </span>
                                <span className="text-jacarta-100">
                                    {apiResponse.details.deposit.amount}{" "}
                                    {apiResponse.details.deposit.symbol?.toUpperCase() || ""}
                                </span>
                            </div>

                            {/* Status Section */}
                            <div className="flex flex-col items-center">
                                <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100">
                                    Status:
                                </span>
                                <span className="text-jacarta-100">{status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Render SwapSteps component */}
                    <SwapSteps />
                </div>
            )}


            {isError && (
                <div className="mt-6 p-4 bg-red-800 rounded-lg shadow-sm">
                    <p className="text-red-100">
                        <strong>Error:</strong> Failed to retrieve exchange details. Please try again.
                    </p>
                </div>
            )}

            {/* Loading Spinner with Status */}
            {loading && (
                <div className="flex items-center justify-center mt-4">
                    <div className="spinner-border animate-spin text-accent" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <span className="ml-2 text-jacarta-100">{status}</span>
                </div>
            )}

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            Are you sure you want to delete this exchange details?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            If you already deposited, wait for the deposit to go through, or you
                            will need to manually convert your funds.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteExchange}
                                className="px-4 py-2 bg-red-500 text-gray-800 rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );


};



import { FaCheck } from "react-icons/fa";

const SwapSteps = () => {
    const { swapStep, setSwapStep } = useBioniqContext(); // Access `swapStep` and `setSwapStep` from the context.

    useEffect(() => {
    }, [swapStep]);

    const steps = [
        { id: 1, title: "Approve ICP" },
        { id: 2, title: "Deposit ICP" },
        { id: 3, title: "Swap ICP for ckBTC" },
        { id: 4, title: "Withdraw ckBTC" },
        { id: 5, title: "Finished" },
    ];

    // Hide the modal if `swapStep` is 0
    if (swapStep === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-md mx-auto p-6 bg-jacarta-800 rounded-lg shadow-lg">
                <h2 className="text-lg font-medium text-white mb-4">Swap Details</h2>
                <p className="text-sm text-jacarta-300 mb-6">
                    If you have sufficient balance in the swap pool, you may be able to swap
                    directly without needing to deposit.
                </p>
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="flex items-center space-x-4 p-3 rounded-lg bg-jacarta-700"
                        >
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    step.id <= swapStep
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-500 text-gray-300"
                                }`}
                            >
                                {step.id < swapStep ? <FaCheck /> : step.id}
                            </div>
                            <div className="flex items-center space-x-2">
                                <p
                                    className={`text-sm font-medium ${
                                        step.id <= swapStep ? "text-white" : "text-jacarta-400"
                                    }`}
                                >
                                    {step.title}
                                </p>
                                {step.id === swapStep && (
                                    <div className="swiper-lazy-preloader animate-spin-slow"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => {
                        setSwapStep(0); // Reset `swapStep` to hide the modal
                    }}
                    className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Close
                </button>
            </div>
        </div>
    );
};











export const metadata = {
    title: "Home 9 || Xhibiter | NFT Marketplace Nextjs Template",
};
export default function AuctionPage({ login, setModalOpenT }) {
   // const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Header1 bLogin={login} setModalOpen={setModalOpenT} />
            <main>
                <TokenRow />
            </main>
            <Footer1 />
        </>
    );
}
