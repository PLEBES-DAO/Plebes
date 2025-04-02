import { offers } from "../../../data/itemDetails";
import { Link } from "react-router-dom";
import { useBioniqContext } from "../../../hooks/BioniqContext";
import { formatNumberWithPattern } from "../../../utils";


function bigNatToDecimal(number, originalDecimalLength) {
    // 1. Convert the number to a string (avoids scientific notation)
    const numStr = number.toString();
  
    // 2. Pad with leading zeros if needed (to match the original decimal length)
    const paddedStr = numStr.padStart(originalDecimalLength, '0');
  
    // 3. Insert the decimal point
    const decimalStr = `0.${paddedStr}`;
  
    return decimalStr;
  }

export default function Offers({ liveAuctionBidders }) {
    const{toDecimalAmounts} = useBioniqContext();
    return (
        <div
            role="table"
            className="scrollbar-custom grid max-h-72 w-full grid-cols-2 overflow-y-auto rounded-lg rounded-tl-none border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
        >
            <div className="contents" role="row">
                <div
                    className="sticky top-0 bg-light-base py-2 px-4 dark:bg-jacarta-600"
                    role="columnheader"
                >
                    <span className="w-full overflow-hidden text-ellipsis truncate text-jacarta-700 dark:text-jacarta-100">
                        Bidder
                    </span>
                </div>
                <div
                    className="sticky top-0 bg-light-base py-2 px-4 dark:bg-jacarta-600"
                    role="columnheader"
                >
                    <span className="w-full overflow-hidden text-ellipsis truncate text-jacarta-700 dark:text-jacarta-100">
                        Amount
                    </span>
                </div>
            </div>
            {liveAuctionBidders && liveAuctionBidders.map((elm, i) => (
                <div key={i} className="contents" role="row">
                    <div
                        className="flex min-w-0 items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                        role="cell"
                        title={elm.bidder}  // Tooltip text here
                    >
                        <span className="text-sm font-medium tracking-tight text-green truncate">
                            {elm.address}
                        </span>
                    </div>
                    <div
                        className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                        role="cell"
                    >
                        {elm.amount} USD
                    </div>
                </div>
            ))}
        </div>
    );
}
