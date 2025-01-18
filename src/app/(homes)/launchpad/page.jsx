export default function Homepage() {
    return(<div className="min-h-screen grid grid-cols-1 md:grid-cols-4 gap-4 comics">
            <div className="h-full dao-section">
                <div
                    className="p-4 bg-white shadow-md rounded-md cursor-pointer hover:shadow-lg"

                >
                    <span className="comic-sans">DAO/GOV</span>
                </div>
            </div>

            <div className="md:col-span-2 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white shadow-md rounded-md md:col-span-2">
                    Holders
                </div>
                <div className="p-4 bg-white shadow-md rounded-md">
                    Precio
                </div>
                <div className="p-4 bg-white shadow-md rounded-md row-span-2">
                    Tesorería
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white shadow-md rounded-md">Staking</div>
                    <div className="p-4 bg-white shadow-md rounded-md">Staking 2</div>
                </div>
            </div>

            <div className="md:col-span-1 h-full grid grid-cols-1 md:grid-cols-1 grid-rows-6 gap-4">
                <div className="p-4 bg-white shadow-md rounded-md row-span-4">Holders</div>
                <div className="p-4 bg-white shadow-md rounded-md row-span-2">Precio</div>
            </div>
        </div>
    )
}