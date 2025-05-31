import { useEffect, useRef, useState } from 'react';
import { useBioniqContext } from '../../hooks/BioniqContext';
import { formatNumberWithPattern } from '../../utils';

export default function ErrorModal({ modalOpen, setModalOpen, error, resetError }) {
  const modalRef = useRef();
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
        resetError()
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
  }, [modalOpen, setModalOpen]);

 const errorMsg = () =>{
    // Handle null or undefined error objects
    if (!error) {
        return "An unknown error occurred";
    }
    
    // If error is a string, return it directly
    if (typeof error === 'string') {
        return error;
    }
    
    // If error has an error property, return it, otherwise return the error object as string
    if (error.error !== null && error.error !== undefined) {
        return error.error;
    }
    
    // Fallback: convert error to string
    return error.toString();
 }

  return (
    <div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="modal-dialog max-w-2xl bg-white rounded-lg shadow-lg p-6"
          >
            {/* Modal Body */}
            <div className="modal-body p-6">
              {/* Price input */}
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-sm font-semibold">
                  {errorMsg()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
