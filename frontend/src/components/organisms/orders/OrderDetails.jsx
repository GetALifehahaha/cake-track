import React from 'react';
import { Title, Label } from '../../atoms';
import { X } from 'lucide-react';

const OrderDetails = ({ orderDetails, onClose }) => {
    // Determine if it's a pre-made cake or custom
    const isPreMade = orderDetails.cake_orders.type === 'pre-made';

    return (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
            <div className='bg-white rounded-3xl shadow-xl w-full max-w-[80vw] overflow-hidden flex flex-col'>
                
                {/* Header with Stepper */}
                <div className="p-6 flex justify-between items-center border-b border-gray-100">
                    <div className='flex flex-col gap-1'>
                        <div className="flex items-center gap-3">
                            <span className="bg-accent/20 text-accent-dark px-3 py-1 rounded-full text-xs font-bold uppercase">
                                {orderDetails.id}
                            </span>
                            <span className="capitalize text-text/50 text-sm font-medium">{orderDetails.status}</span>
                        </div>
                        <h2 className="text-md ml-2 font-bold text-text">
                            Deduct Inventory Ingredients
                        </h2>
                    </div>
                    
                    {/* Stepper Implementation */}
                    {orderDetails.status !== 'pending' && (

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-stone-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                                <span className="text-stone-700 font-semibold text-sm">Order Info</span>
                            </div>
                            <div className="h-px w-8 bg-gray-300"></div>
                            <div className="flex items-center gap-2 opacity-40">
                                <span className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">2</span>
                                <span className="text-gray-600 font-medium text-sm">Ingredients</span>
                            </div>
                            <div className="h-px w-8 bg-gray-300"></div>
                            <div className="flex items-center gap-2 opacity-40">
                                <span className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">3</span>
                                <span className="text-gray-600 font-medium text-sm">Review</span>
                            </div>
                        </div>
                        )}

                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto">
                    <div>
                        
                        <div className="">
                            <h3 className="text-lg font-bold text-gray-800">Order Summary</h3>
                            <p className="text-gray-400 text-sm">Review the accepted order details before deducting from inventory.</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Cake Details Card */}
                        <div className="border border-accent-mute rounded-2xl p-6 bg-accent/5">
                            <h4 className="text-[10px] uppercase tracking-widest text-accent-text font-bold mb-4">Cake Details</h4>
                            <div className="space-y-4">
                                <DetailRow label="Flavor" value={orderDetails.cake_orders.base_flavor} />
                                <DetailRow label="Filling" value={orderDetails.cake_orders.filling} />
                                <DetailRow label="Shape" value={orderDetails.cake_orders.shape} />
                                <DetailRow label="Inscription" value={orderDetails.cake_orders.message_type}/>
                                <DetailRow label="Message" value={orderDetails.cake_orders.message}  />
                            </div>
                        </div>

                        {/* Extras Card */}
                        <div className="border border-accent-mute rounded-2xl p-6 bg-accent/5">
                            <h4 className="text-[10px] uppercase tracking-widest text-accent-text font-bold mb-4">Extras</h4>
                            <div className="space-y-4">
                                <DetailRow label="Cupcakes" value={`${orderDetails.cupcake_orders?.amount || 0}x`} />
                                <DetailRow label="Frosting" value={orderDetails.cupcake_orders?.frosting || 'N/A'} />
                                <DetailRow label="Order ID" value={orderDetails.id} />
                                <DetailRow label="Status" value={orderDetails.status}/>
                            </div>
                        </div>
                    </div>

                    {/* Helper Banner */}
                    {orderDetails.status !== 'pending' &&
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border border-blue-400 text-blue-500 flex items-center justify-center text-[10px] font-bold">i</div>
                            <p className="text-blue-600 text-sm">
                                Click <span className="font-bold">Next Step</span> to set up ingredients. You can load from a saved recipe or enter them manually.
                            </p>
                        </div>
                    }
                </div>

                {/* Footer Action */}
                {orderDetails.status !== 'pending' && 
                    <div className="p-6 bg-gray-50 flex justify-end">
                        <button className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                            Next Step
                        </button>
                    </div>
                }
            </div>
        </div>
    );
};

// Internal Helper for clean rows
const DetailRow = ({ label, value, isLast, valueClass = "text-stone-900" }) => (
    <div className={`flex justify-between items-center pb-2 ${!isLast ? 'border-b border-accent/15' : ''}`}>
        <span className="text-sm text-stone-500 font-medium">{label}</span>
        <span className={`text-sm font-bold capitalize ${valueClass} wrap-break-words whitespace-normal w-80`}>{value}</span>
    </div>
);

export default OrderDetails;