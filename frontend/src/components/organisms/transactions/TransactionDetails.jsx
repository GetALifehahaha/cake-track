import React from 'react';
import { Title, Button } from '../../atoms';
import { Download, Printer, X } from 'lucide-react';
import { formatToDecimal } from '@/utils/formatToDecimal';

const TransactionDetails = ({ transactionDetail, onClose }) => {

    const downloadPdf = async () => {
        window.print()
    }

    return (
        <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex flex-col justify-center items-center z-10 gap-4'>
                <div id="receipt" className="relative bg-main-white shadow-sm ">
                    <div className='max-h-[80vh] overflow-y-auto mx-auto p-6 text-sm w-md flex flex-col justify-between'>

                        <h5 className="text-center text-text font-bold text-lg mb-2 ">
                            Michelle's Cakes and Cafe
                        </h5>

                        <div className="text-center text-text/50 text-sm mb-4 space-y-0.5 border-b border-b-main-dark pb-8">
                            <h5>Boalan, Zamboanga City</h5>
                            <h5>TIN: 123-456-789-000</h5>
                            <h5>Permit No: ATP-2025-56789</h5>
                        </div>

                        <div className="text-text font-medium text-sm mb-2 space-y-0.5">
                            <h5>Cashier: {transactionDetail.cashier.first_name} {transactionDetail.cashier.last_name} </h5>
                            <h5>Serving Mode: {transactionDetail.order_type == "dine-in" ? 'DINE IN' : 'TAKE OUT'}</h5>
                        </div>

                        <div className="flex text-text text-sm mb-4">
                            <h5 className='text-text/50'>Date & Time:</h5>
                            <h5 className='ml-auto mr-4'>{new Date(transactionDetail.created_at).toLocaleDateString()}</h5>
                            <h5>{new Date(transactionDetail.created_at).toLocaleTimeString()}</h5>
                        </div>

                        <table className="w-full text-text text-sm mb-4 ">
                            <thead>
                                <tr className="border-b border-text/20">
                                    <th className="text-left py-1 font-semibold">Quantity</th>
                                    <th className="text-left py-1 font-semibold">Name</th>
                                    <th className="text-right py-1 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody >
                                {transactionDetail.transaction_items.map((item, index) =>
                                    <tr key={index}>
                                        <td className="py-2 text-center">{item.quantity}</td>
                                        <td className="py-2">{item.product.name} - {item.product_variant.label}</td>
                                        <td className="text-right py-2">{(item.product_variant.price * item.quantity).toFixed(2)}</td>
                                    </tr>)}
                            </tbody>
                        </table>

                        <div className="text-sm space-y-1 mb-4">
                            {/* <div className="flex justify-between text-text/50">
                                <h5>Subtotal:</h5>
                                <h5>{(transactionDetail.gross_total).toFixed(2)}</h5>
                            </div> */}
                            {transactionDetail.discount &&
                                <div className="flex justify-between text-text/50">
                                    <h5>Discount:</h5>
                                    <h5>{transactionDetail.discount.name}: {transactionDetail.discount.rate * 100}%</h5>
                                </div>
                            }
                            {/* <div className="flex justify-between text-text/50">
                                <h5>VAT Amount:</h5>
                                <h5>{(transactionDetail.gross_total - (transactionDetail.gross_total * .88)).toFixed(2)}</h5>
                            </div> */}
                            <div className="flex justify-between font-bold text-base pt-1 text-text">
                                <h5>Total:</h5>
                                <h5>₱ {formatToDecimal(transactionDetail.net_total)}</h5>
                            </div>
                        </div>

                        <div className="text-center text-text text-sm space-y-1 mb-3">
                            <h5>System-Generated Receipt</h5>
                            <h5>Contact us: +63 966 443 1581</h5>
                            <h5>Thank you! Come back for another coffee!</h5>
                        </div>

                        <h5 className="text-center text-text text-sm italic">
                            This is not an official receipt
                        </h5>
                    </div>

                    <div className='absolute top-0 -right-2 translate-x-full p-2 w-fit flex-col bg-main-white rounded-md shadow-md shadow-black/25 flex justify-between items-center gap-4'>
                        <Button text='' variant='modalOutline' size='fit' icon={X} onClick={onClose} />
                        <Button text='' variant='modalOutline' size='fit' icon={Printer} />
                        <Button text='' variant='modalBlock' size='fit' icon={Download} onClick={downloadPdf} />
                    </div>
                </div>
        </div>
    )
}

export default TransactionDetails;