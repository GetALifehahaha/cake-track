import { Title, Label, Button } from '@/components/atoms';
import React, { useState } from 'react';

const Invoice = () => {

    const invoice = {
        businessName: "Michelle's Cakes and Cafe",
        address: "Boalan, Zamboanga City",
        tin: "123-456-789-000",
        accreditionNumber: "POS-2025-0001234",
        permitNumber: "ATP-2025-56789",
        contactNumber: "+63 966 443 1581",
        message: "Thank you! Come back for another coffee!"
    }

    const [invoiceDetails, setInvoiceDetails] = useState(invoice);

    return (
        <div className='flex flex-row w-full h-full gap-8 mb-4'>
            {/* Invoice Information */}
            {/* <div className="max-w-sm mx-auto bg-main-white shadow-sm p-6 text-sm basis-1/3 flex flex-col justify-between">
                <h5 className="text-center text-text font-bold text-base mb-2 ">
                    {invoiceDetails.businessName}
                </h5>

                <div className="text-center text-text/50 text-xs mb-4 space-y-0.5 border-b border-b-main-dark pb-8">
                    <h5>{invoiceDetails.address}</h5>
                    <h5>TIN: {invoiceDetails.tin}</h5>
                    <h5>Permit No: {invoiceDetails.permitNumber}</h5>
                </div>

                <div className="text-text/50 text-xs mb-2 space-y-0.5">
                    <h5>Cashier: Adrian Agraviador</h5>
                    <h5>Serving Mode: DINE IN</h5>
                </div>

                <div className="flex justify-between text-text text-xs mb-4">
                    <h5 className='text-text/50'>Date & Time:</h5>
                    <h5>{localDateTime}</h5>
                </div>

                <table className="w-full text-text text-xs mb-4">
                    <thead>
                        <tr className="border-b border-text/20">
                            <th className="text-left py-1 font-semibold">Quantity</th>
                            <th className="text-left py-1 font-semibold">Name</th>
                            <th className="text-right py-1 font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="">
                            <td className="py-2 text-center">2</td>
                            <td className="py-2">Caramel Macchiato</td>
                            <td className="text-right py-2">150.00</td>
                        </tr>
                        <tr className="">
                            <td className="py-2 text-center">1</td>
                            <td className="py-2">Blueberry Muffin</td>
                            <td className="text-right py-2">120.00</td>
                        </tr>
                        <tr className="">
                            <td className="py-2 text-center">1</td>
                            <td className="py-2">Croissant</td>
                            <td className="text-right py-2">95.00</td>
                        </tr>
                        <tr className="">
                            <td className="py-2 text-center">1</td>
                            <td className="py-2">Iced Americano</td>
                            <td className="text-right py-2">130.00</td>
                        </tr>
                    </tbody>
                </table>

                <div className="text-xs space-y-1 mb-4">
                    <div className="flex justify-between text-text/50">
                        <h5>Subtotal:</h5>
                        <h5>₱495.00</h5>
                    </div>
                    <div className="flex justify-between text-text/50">
                        <h5>VAT Amount:</h5>
                        <h5>₱59.40</h5>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-1 text-text">
                        <h5>Total:</h5>
                        <h5>₱554.40</h5>
                    </div>
                </div>

                <div className="text-center text-text text-xs space-y-1 mb-3">
                    <h5>System-Generated Receipt</h5>
                    <h5>Contact us: {invoiceDetails.contactNumber}</h5>
                    <h5>{invoiceDetails.message}</h5>
                </div>

                <h5 className="text-center text-text text-xs italic">
                    This is not an official receipt
                </h5>
            </div> */}


            {/* Invoice CMS */}
            <div className='flex-1 flex flex-col gap-6'> 
                <div className='p-6 rounded-sm bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Business Details' variant='block' />
                        <Button text='Save' size='small'/>
                    </div>

                    <div className='mt-4'>
                        <Label variant='small' text='Business Name' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={invoiceDetails.businessName} onChange={(e) => setInvoiceDetails({...invoiceDetails, businessName: e.target.value})}/>
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Address' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={invoiceDetails.address} onChange={(e) => setInvoiceDetails({...invoiceDetails, address: e.target.value})}/>
                    </div>
                </div>

                <div className='p-6 rounded-sm bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Business Credentials' variant='block' />
                        <Button text='Save' size='small'/>
                    </div>

                    <div className='mt-4'>
                        <Label variant='small' text='TIN' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={invoiceDetails.tin} onChange={(e) => setInvoiceDetails({...invoiceDetails, tin: e.target.value})}/>
                    </div>
                    {/* <div className='mt-4'>
                        <Label variant='small' text='Accreditation Number' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={invoiceDetails.accreditionNumber} onChange={(e) => setInvoiceDetails({...invoiceDetails, accreditionNumber: e.target.value})}/>
                    </div> */}
                    {/* <div className='mt-4'>
                        <Label variant='small' text='Permit Number' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={invoiceDetails.permitNumber} onChange={(e) => setInvoiceDetails({...invoiceDetails, permitNumber: e.target.value})}/>
                    </div> */}
                </div>

                <div className='p-6 rounded-sm bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Contact and Message' variant='block' />
                        <Button text='Save' size='small'/>
                    </div>

                    <div className='mt-4'>
                        <Label variant='small' text='Contact Number' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={invoiceDetails.contactNumber} onChange={(e) => setInvoiceDetails({...invoiceDetails, contactNumber: e.target.value})}/>
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Message' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={invoiceDetails.message} onChange={(e) => setInvoiceDetails({...invoiceDetails, message: e.target.value})}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Invoice;