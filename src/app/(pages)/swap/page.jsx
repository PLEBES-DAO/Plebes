import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import SwapInterface from "../../../components/swap/SwapInterface";

export const metadata = {
  title: "Swap - ICP ⇄ ckBTC",
  description: "Exchange your ICP tokens for ckBTC using the decentralized swap pool",
};

export default function SwapPage({ login, setModalOpenT }) {
  return (
    <>
      <Navbar bLogin={login} setModalOpen={setModalOpenT} />
      <main>
        {/* Background with overlay */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: "url('/img/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Semi-transparent overlay with #0d102d base color */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#0d102d",
              opacity: 0.90,
            }}
          ></div>
        </div>

        {/* Main content area */}
        <section className="relative min-h-screen pt-24 pb-12">
          <div className="container mx-auto px-4">
            {/* Page title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold text-white munro-regular-heading mb-4">
                Token Swap
              </h1>
              <p className="text-xl text-jacarta-300 munro-small-text max-w-2xl mx-auto">
                Seamlessly exchange ICP for ckBTC using our decentralized swap protocol
              </p>
            </div>

            {/* Swap Interface Component */}
            <SwapInterface />

            {/* Information Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-jacarta-800/50 backdrop-blur-sm p-6 rounded-lg border border-jacarta-600">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 munro-narrow">Secure & Decentralized</h3>
                  <p className="text-jacarta-300 munro-small-text">
                    Your funds remain in your custody throughout the entire swap process using Internet Computer's native protocols.
                  </p>
                </div>
              </div>

              <div className="bg-jacarta-800/50 backdrop-blur-sm p-6 rounded-lg border border-jacarta-600">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 munro-narrow">Competitive Rates</h3>
                  <p className="text-jacarta-300 munro-small-text">
                    Get the best exchange rates powered by ICPSwap's automated market maker and deep liquidity pools.
                  </p>
                </div>
              </div>

              <div className="bg-jacarta-800/50 backdrop-blur-sm p-6 rounded-lg border border-jacarta-600">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 munro-narrow">Instant Settlement</h3>
                  <p className="text-jacarta-300 munro-small-text">
                    Experience fast transaction finality with Internet Computer's sub-second block times and instant confirmations.
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-white text-center mb-8 munro-regular-heading">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  {
                    step: "1",
                    title: "Connect Wallet",
                    description: "Link your Internet Computer wallet to access the swap interface"
                  },
                  {
                    step: "2", 
                    title: "Approve Tokens",
                    description: "Authorize the smart contract to access your ICP tokens"
                  },
                  {
                    step: "3",
                    title: "Deposit & Swap", 
                    description: "Your ICP is deposited and automatically exchanged for ckBTC"
                  },
                  {
                    step: "4",
                    title: "Receive ckBTC",
                    description: "Your new ckBTC tokens are withdrawn to your wallet"
                  },
                  {
                    step: "5",
                    title: "Complete",
                    description: "Transaction is finalized and balances are updated"
                  }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 munro-small font-bold">
                      {item.step}
                    </div>
                    <h4 className="text-white font-semibold mb-2 munro-narrow">{item.title}</h4>
                    <p className="text-jacarta-400 text-sm munro-small-text">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer1 />
    </>
  );
} 