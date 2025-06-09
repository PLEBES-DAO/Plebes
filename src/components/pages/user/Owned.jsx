import React, { useEffect, useState } from "react";
import tippy from "tippy.js";
import Image from "../../common/Image";
import { useBioniqContext } from "../../../hooks/BioniqContext";

// 1. Transfer Modal
function TransferModal({ isOpen, onClose, onSend, selectedItem }) {
  const [address, setAddress] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="dark:bg-jacarta-700 rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Transfer Item</h3>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter recipient BTC address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            onSend(address);
          }}
        >
          Send
        </button>
        <button className="mt-2 text-gray-500" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// 2. Create Auction Confirmation Modal
function CreateAuctionConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="dark:bg-jacarta-700 rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Create Auction</h3>
        <p className="mb-4">
          Are you sure you want to <strong>create an auction</strong> for this item?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            No
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Cancel Auction Confirmation Modal
function CancelAuctionConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="dark:bg-jacarta-700 rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Cancel Auction</h3>
        <p className="mb-4">
          Are you sure you want to <strong>cancel the auction</strong> for this item?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            No
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}



export default function Owned({ initialInscriptions, userAddress }) {
  const { sendInscription, createAuction, cancelAuction, fetchUserInscriptions } = useBioniqContext();
  const [inscriptions, setInscriptions] = useState(initialInscriptions?.nfts || []);
  const [pagination, setPagination] = useState(initialInscriptions?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(false);

  // Track currently selected item for any action
  const [selectedItem, setSelectedItem] = useState(null);

  // Transfer modal states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Create Auction confirmation modal states
  const [isCreateAuctionModalOpen, setIsCreateAuctionModalOpen] = useState(false);

  // Cancel Auction confirmation modal states
  const [isCancelAuctionModalOpen, setIsCancelAuctionModalOpen] = useState(false);
  useEffect(() => {
    console.log("inscriptions", initialInscriptions)
  }, [initialInscriptions]);

  // Initialize tippy tooltips
  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  // Fetch more inscriptions when pagination changes
  const fetchMoreInscriptions = async (page) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await fetchUserInscriptions(page, pagination.limit);
      setInscriptions(data.nfts);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching inscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchMoreInscriptions(newPage);
  };

  // ----------------------------
  // TRANSFER HANDLERS
  // ----------------------------
  const handleOpenTransferModal = (item) => {
    setSelectedItem(item);
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setSelectedItem(null);
  };

  const handleSend = (address) => {
    console.log(`Send item to address: ${address}`);
    // Call the context function
    sendInscription(selectedItem, address);
    // Close modal
    setIsTransferModalOpen(false);
    setSelectedItem(null);
  };

  // ----------------------------
  // CREATE AUCTION HANDLERS
  // ----------------------------
  const handleOpenCreateAuctionModal = (item) => {
    setSelectedItem(item);
    setIsCreateAuctionModalOpen(true);
  };

  const handleCloseCreateAuctionModal = () => {
    setIsCreateAuctionModalOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmCreateAuction = () => {
    console.log("Auction created for:", selectedItem);
    // Call the context function
    createAuction(selectedItem);
    // Close modal
    setIsCreateAuctionModalOpen(false);
    setSelectedItem(null);
  };

  // ----------------------------
  // CANCEL AUCTION HANDLERS
  // ----------------------------
  const handleOpenCancelAuctionModal = (item) => {
    setSelectedItem(item);
    setIsCancelAuctionModalOpen(true);
  };

  const handleCloseCancelAuctionModal = () => {
    setIsCancelAuctionModalOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmCancelAuction = () => {
    console.log("Auction canceled for:", selectedItem);
    // Call the context function
    cancelAuction(selectedItem);
    // Close modal
    setIsCancelAuctionModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <section className="relative py-24 pt-20">
      <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
        <Image
          width={1920}
          height={789}
          src="/img/gradient_light.jpg"
          alt="gradient"
          className="h-full w-full"
        />
      </picture>

      <div className="container">
        <div className="tab-content">
          <div className="tab-pane fade" id="owned" role="tabpanel" aria-labelledby="owned-tab">
            {/* Pagination Controls */}
            {initialInscriptions && <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={initialInscriptions.pagination.page === 1 || isLoading}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-jacarta-700 dark:text-white">
                Page {initialInscriptions.pagination.page} of {initialInscriptions.pagination.totalPages} ({initialInscriptions.pagination.total} items)
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={initialInscriptions.pagination.page === initialInscriptions.pagination.totalPages || isLoading}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>}

            {isLoading ? (
              <div className="text-center py-8 text-jacarta-700 dark:text-white">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-2 lg:grid-cols-4">
                {initialInscriptions && initialInscriptions.nfts && initialInscriptions.nfts.map((item, i) => (
                  <article key={i}>
                    <div className="block rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700">
                      <span className="font-display text-base text-jacarta-700 dark:text-white">
                        {item.collection || 'Plebes NFT'}
                      </span>
                      <figure className="relative">
                        <Image
                          width={230}
                          height={230}
                          src={`https://q3nxc-eyaaa-aaaah-aq2ha-cai.raw.icp0.io/?tokenid=${item.asset_id}`}
                          alt="item"
                          className="w-full rounded-[0.625rem]"
                          loading="lazy"
                        />
                      </figure>
                      <div className="mt-7 flex items-center justify-between space-x-2">
                        {/* Transfer Button */}
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() => handleOpenTransferModal(item)}
                        >
                          Transfer
                        </button>

                        {/* Create Auction Button */}
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                          onClick={() => handleOpenCreateAuctionModal(item)}
                        >
                          Create Auction
                        </button>

                        {/* Cancel Auction Button (conditionally show if needed) */}
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => handleOpenCancelAuctionModal(item)}
                        >
                          Cancel Auction
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        onSend={handleSend}
        selectedItem={selectedItem}
      />

      {/* Create Auction Confirmation Modal */}
      <CreateAuctionConfirmationModal
        isOpen={isCreateAuctionModalOpen}
        onClose={handleCloseCreateAuctionModal}
        onConfirm={handleConfirmCreateAuction}
      />

      {/* Cancel Auction Confirmation Modal */}
      <CancelAuctionConfirmationModal
        isOpen={isCancelAuctionModalOpen}
        onClose={handleCloseCancelAuctionModal}
        onConfirm={handleConfirmCancelAuction}
      />
    </section>
  );
}