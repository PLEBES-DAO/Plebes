import React, { useEffect, useState } from "react";
import tippy from "tippy.js";
import Image from "../../common/Image";
import { useBioniqContext } from "../../../hooks/BioniqContext";

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="dark:bg-jacarta-700 rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
        <p className="mb-4">{message}</p>
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

export default function Owned({ inscriptions }) {
  const { sendInscription, createAuction, cancelAuction } = useBioniqContext();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  const handleCreateAuction = (item) => {
    setSelectedItem(item);
    setConfirmationMessage("Are you sure you want to create an auction for this plebe?");
    setIsConfirmationOpen(true);
  };

  const handleConfirmCreateAuction = () => {
    if (selectedItem) {
      createAuction(selectedItem);
    }
    setIsConfirmationOpen(false);
    setSelectedItem(null);
  };

  const handleCancelConfirmation = () => {
    setIsConfirmationOpen(false);
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
            <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-2 lg:grid-cols-4">
              {inscriptions && inscriptions.map((elm, i) => (
                <article key={i}>
                  <div className="block rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700">
                    <figure className="relative">
                      <Image
                        width={230}
                        height={230}
                        src={elm.contentUrl}
                        alt="item"
                        className="w-full rounded-[0.625rem]"
                        loading="lazy"
                      />
                    </figure>
                    <div className="mt-7 flex items-center justify-between">
                      <span className="font-display text-base text-jacarta-700 dark:text-white">
                        {elm.collectionId}
                      </span>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={() => handleCreateAuction(elm)}
                      >
                        Create Auction
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => cancelAuction(elm)}
                      >
                        Cancel Auction
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmCreateAuction}
        message={confirmationMessage}
      />
    </section>
  );
}
