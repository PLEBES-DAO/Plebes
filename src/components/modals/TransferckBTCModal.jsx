import { useEffect, useRef, useState } from 'react';
import { BioniqContext, useBioniqContext } from '../../hooks/BioniqContext';



export default function TransferModal({ isOpen, setModalOpen, onSend }) {
    const [address, setAddress] = useState(null);
    const{withdrawCKBTC} = useBioniqContext();
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="dark:bg-jacarta-700 rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-4">Transfer ckBTC</h3>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter recipient ckBTC  principal address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {address && withdrawCKBTC(address),setModalOpen(false)}}
          >
            Send
          </button>
          <button
            className="mt-2 text-gray-500"
            onClick={()=>{setModalOpen(false)}}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }