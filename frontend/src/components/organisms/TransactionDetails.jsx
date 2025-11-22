import React from 'react';
import { Title, Button } from '../atoms';
import { Download, Printer, X } from 'lucide-react';
import jsPDF from 'jspdf';

const TransactionDetails = ({transactionDetail, onClose}) => {

    const downloadPdf = async () => {
        window.print()
    }

    return (
         <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex flex-col justify-center items-center z-10 gap-4'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[40vw] flex flex-col gap-4'>
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='View Order Details' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                </div>

                {/* <div className='text-text font-semibold text-sm border-t border-t-border border-b border-b-border py-8'>
                    {transactionDetail.transaction_items.map((item, index) => <h5 key={index}>{item.quantity}x {item.product.name}</h5>)}
                </div>

                <div className='flex flex-row'>
                    <div className='flex-1 flex flex-col gap-4'>
                        <h5>Time Ordered: <strong>{new Date(transactionDetail.created_at).toLocaleTimeString()}</strong></h5>
                        <h5>Cashier: <strong>{transactionDetail.cashier.first_name} {transactionDetail.cashier.last_name}</strong></h5>
                    </div>
                    <div className='flex-1 flex flex-col gap-4'>
                        <h5>Receipt ID: <strong>{transactionDetail.id}</strong></h5>
                        <h5>Total: <strong>P {transactionDetail.net_total}</strong></h5>
                    </div>
                </div> */}
            </div>
            {!transactionDetail.is_void &&
                <>
                    <div id="receipt" className="max-w-sm mx-auto bg-main-white shadow-sm p-6 text-sm w-full flex flex-col justify-between">
                        <h5 className="text-center text-text font-bold text-base mb-2 ">
                            Michelle's Cakes and Cafe
                        </h5>

                        <div className="text-center text-text/50 text-xs mb-4 space-y-0.5 border-b border-b-main-dark pb-8">
                            <h5>Boalan, Zamboanga City</h5>
                            <h5>TIN: 123-456-789-000</h5>
                            <h5>Permit No: ATP-2025-56789</h5>
                        </div>

                        <div className="text-text/50 text-xs mb-2 space-y-0.5">
                            <h5>Cashier: {transactionDetail.cashier.first_name} {transactionDetail.cashier.last_name} </h5>
                            <h5>Serving Mode: {transactionDetail.order_type == "dine-in" ? 'DINE IN' : 'TAKE OUT'}</h5>
                        </div>

                        <div className="flex justify-between text-text text-xs mb-4">
                            <h5 className='text-text/50'>Date & Time:</h5>
                            <h5>{new Date(transactionDetail.created_at).toLocaleDateString()}</h5>
                        </div>

                        <table className="w-full text-text text-xs mb-4 ">
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
                                        <td className="py-2">{item.product.name}</td>
                                        <td className="text-right py-2">{item.price}</td>
                                    </tr>)}
                            </tbody>
                        </table>

                        <div className="text-xs space-y-1 mb-4">
                            <div className="flex justify-between text-text/50">
                                <h5>Subtotal:</h5>
                                <h5>{(transactionDetail.gross_total).toFixed(2)}</h5>
                            </div>
                            <div className="flex justify-between text-text/50">
                                <h5>VAT Amount:</h5>
                                <h5>{transactionDetail.gross_total - (transactionDetail.gross_total* .88).toFixed(2)}</h5>
                            </div>
                            <div className="flex justify-between font-bold text-sm pt-1 text-text">
                                <h5>Total:</h5>
                                <h5>{(transactionDetail.net_total).toFixed(2)}</h5>
                            </div>
                        </div>

                        <div className="text-center text-text text-xs space-y-1 mb-3">
                            <h5>System-Generated Receipt</h5>
                            <h5>Contact us: +63 966 443 1581</h5>
                            <h5>Thank you! Come back for another coffee!</h5>
                        </div>

                        <h5 className="text-center text-text text-xs italic">
                            This is not an official receipt
                        </h5>
                    </div>
                                    
                    <div className='p-2 bg-main-white rounded-md w-1/4 shadow-md shadow-black/25 flex justify-between items-center gap-4'>
                        <Button text='Print Receipt' variant='modalOutline' size='fit' icon={Printer}/>
                        <Button text='Download' variant='modalBlock' size='fit' icon={Download} onClick={downloadPdf}/>
                    </div>
                </>
            }
        </div>
    )
}

export default TransactionDetails;