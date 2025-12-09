import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable";
import React from 'react';
import { Download, XCircle } from 'lucide-react';
import useDashboard from '@/hooks/useDashboard';
import Loading from '@/components/molecules/Loading';
import { DashboardChart } from '@/components/organisms';

jsPDF.API.autoTable = autoTable;

const Reports = () => {

    const {dashboardData, dashboardLoading, dashboardError} = useDashboard();

    if (dashboardLoading) return <Loading />
    if (dashboardError) return <h5>Error...</h5>

    const downloadReport = (data) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString();

        console.log("PDF DOC:", doc)

        // --- 1. Header ---
        doc.setFontSize(18);
        doc.text("Sales & Performance Report", 14, 20);
        doc.setFontSize(11);
        doc.text(`Date Generated: ${today}`, 14, 28);
        
        // --- 2. Summary Section ---
        doc.setFontSize(14);
        doc.text("Overview", 14, 40);
        doc.setFontSize(10);
        
        // Create a simple summary data layout
        const summaryData = [
            ["Total Successful Transactions", data.total_successful_transactions],
            ["Total Products Sold", data.total_products_sold],
            ["Avg Daily Transactions", data.avg_daily_transactions],
            ["Total Voided Transactions", data.total_void_amount],
        ];

        doc.autoTable({
            startY: 45,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'plain', // Minimalist look
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } }
        });

        // --- 3. Cashier Performance Table ---
        // Calculate current Y position based on previous table
        let finalY = doc.lastAutoTable.finalY + 10; 
        
        doc.setFontSize(14);
        doc.text("Cashier Performance", 14, finalY);
        
        const cashierRows = data.cashier_performance.map(c => [
            c.name,
            c.daily_revenue.toFixed(2),
            c.weekly_revenue.toFixed(2),
            c.monthly_revenue.toFixed(2),
            c.total_revenue.toFixed(2)
        ]);

        doc.autoTable({
            startY: finalY + 5,
            head: [['Cashier Name', 'Daily', 'Weekly', 'Monthly', 'Total Rev']],
            body: cashierRows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }, // Blue header
        });

        // --- 4. Top Selling Products ---
        finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text("Top Selling Products", 14, finalY);

        const productRows = data.top_selling_products.map(p => [
            p.product__name,
            p.total_sold
        ]);

        doc.autoTable({
            startY: finalY + 5,
            head: [['Product Name', 'Total Sold']],
            body: productRows,
            theme: 'striped',
        });

        // --- 5. Sales Trend ---
        finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text("Recent Sales Trend", 14, finalY);

        const trendRows = data.sales_trend.map(t => [
            t.date,
            t.amount
        ]);

        doc.autoTable({
            startY: finalY + 5,
            head: [['Date', 'Items Sold']],
            body: trendRows,
            theme: 'striped',
        });

        // --- Save File ---
        doc.save(`Sales_Report_${today.replace(/\//g, '-')}.pdf`);
    };

    const topSellingProducts = dashboardData.top_selling_products.map((item, index) => (
                    <div className='flex w-80 gap-4 p-2.5 rounded-sm bg-main-white shadow-sm border border-main-dark' key={index}>
                        <div className='w-8 h-8 font-semibold rounded-full aspect-square flex justify-center items-center bg-accent-mute text-white '><h5>{index + 1}</h5></div>
                        <div className='text-sm'>
                            <h5 className='font-semibold'>{item.product__name}</h5>
                            <h5 className='text-xs text-text-light'>{item.total_sold} units sold</h5>
                        </div>
                    </div>
                ))

    const cashierTableHeader = [
        "Name",
        "Today",
        "This Week",
        "This Month",
        "Total"
    ]

    const listCashierTableHeader = cashierTableHeader.map((item, index) => 
        <h5 key={index} className='flex-1 text-center font-medium text-sm text-white'>{item}</h5>
    )

    const cashierRowStyle = 'flex-1 text-center text-sm font-semibold text-text'

    const listCashiers = dashboardData.cashier_performance.map((cashier, index) =>
        <div key={index} className='flex flex-row p-2.5 border-b border-b-border'>
            <h5 className={cashierRowStyle}>{cashier.name}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.daily_revenue).toFixed(2)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.weekly_revenue).toFixed(2)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.monthly_revenue).toFixed(2)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.total_revenue).toFixed(2)}</h5>
        </div>
    )

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col pb-8'>
            <button 
            onClick={downloadReport}
            className='p-2.5 w-fit rounded-md bg-main-white border border-border flex flex-row items-center gap-2 text-sm font-medium cursor-pointer hover:bg-main-dark text-text/50 ml-auto'>
                Download Report
                <Download size={18} className='' />
            </button>
            <div className='flex items-center gap-4'>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Voided Transactions</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{dashboardData.total_void_amount}</h5>
                    <h5 className='text-sm text-error'>Cancelled Orders</h5>
                </div>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Total Orders</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{dashboardData.total_successful_transactions}</h5>
                    <h5 className='text-sm text-success'>Completed Transactions</h5>
                </div>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Products Sold</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{dashboardData.total_products_sold}</h5>
                    <h5 className='text-sm text-none-text'>Total Items</h5>
                </div>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Avg Daily Orders</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{dashboardData.avg_daily_transactions}</h5>
                    <h5 className='text-sm text-none-text'>Orders</h5>
                </div>
            </div>

            <div className='flex gap-4'>
                <div className='flex-1'>
                    <DashboardChart chartData={dashboardData.sales_trend}/>
                </div>
                <div className='flex flex-col gap-2 bg-main-white p-4 rounded-xl shadow-sm h-full min-h-120'>
                    <h5 className='font-semibold'>Top Selling Products</h5>
                    {topSellingProducts}
                </div>
            </div>

            <div className='p-4 bg-main-white rounded-md shadow-sm'>
                <h5 className='font-semibold'>Cashier Revenues</h5>

                <div className='flex flex-col gap-2 p-2.5'>
                    <div className='flex flex-row gap-2 p-2 ronuded-md bg-accent-mute rounded-t-xl'>{listCashierTableHeader}</div>
                    {listCashiers}
                </div>
            </div>
        </div>
    )
};

export default Reports;