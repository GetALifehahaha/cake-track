import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable";
import React, { useState, useMemo, useEffect } from 'react';
import { Download, Filter, X, XCircle } from 'lucide-react';
import useDashboard from '@/hooks/useDashboard';
import Loading from '@/components/molecules/Loading';
import { DashboardChart, DownloadReportModal } from '@/components/organisms';
import { Button, Label, Dropdown } from "@/components/atoms";
import { cn } from "@/utils/cn";
import { useSearchParams } from "react-router-dom";
import { DatePicker } from "@/components/molecules";
import { formatDateForAPI } from "@/utils/date";
import { useToast } from "@/context/ToastContext";

jsPDF.API.autoTable = autoTable;

const Reports = () => {

    const {addToast} = useToast();
    
    const {
        posDashboardData,
        ordersDashboardData,
        loading,
        error
    } = useDashboard();

    const [searchParams, setSearchParams] = useSearchParams();
    
    const [frequency, setFrequency] = useState('daily')
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [downloadModal, setDownloadModal] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);

    useEffect(() => {
        let params = {};

        if (frequency !== undefined && frequency !== null && frequency !== '') {
            params.frequency = frequency;
        }

        if (startDate !== null) params.start_date = formatDateForAPI(startDate)
        if (endDate !== null) params.end_date = formatDateForAPI(endDate)

        setSearchParams(params)
    }, [frequency, startDate, endDate])
    
    if (loading) return <Loading />;
    if (error) return <h5>Error...</h5>;

    const months = [
        { key: 'january', value: 1 },
        { key: 'february', value: 2 },
        { key: 'march', value: 3 },
        { key: 'april', value: 4 },
        { key: 'may', value: 5 },
        { key: 'june', value: 6 },
        { key: 'july', value: 7 },
        { key: 'august', value: 8 },
        { key: 'september', value: 9 },
        { key: 'october', value: 10 },
        { key: 'november', value: 11 },
        { key: 'december', value: 12 },
    ];



    const downloadCSV = (selected) => {
        const today = new Date().toISOString().split("T")[0];
        let csvContent = "data:text/csv;charset=utf-8,";

        // --- POS Dashboard Metrics ---
        if (selected.some(key => [
            'voided_transactions', 
            'total_transactions', 
            'products_sold', 
            'avg_daily_orders', 
            'total_revenue'
        ].includes(key))) {
            csvContent += "POS Dashboard Metrics\n";
            csvContent += "Metric,Value\n";

            if (selected.includes('total_transactions'))
            csvContent += `Total Successful Transactions,${posDashboardData.total_successful_transactions}\n`;

            if (selected.includes('products_sold'))
            csvContent += `Total Products Sold,${posDashboardData.total_products_sold}\n`;

            if (selected.includes('avg_daily_orders'))
            csvContent += `Average Daily Transactions,${posDashboardData.avg_daily_transactions}\n`;

            if (selected.includes('voided_transactions'))
            csvContent += `Total Voided Transactions,${posDashboardData.total_void_amount}\n`;

            if (selected.includes('total_revenue'))
            csvContent += `Total Revenue,${posDashboardData.total_revenue_generated}\n`;

            csvContent += "\n";
        }

        // --- Cashier Performance ---
        if (selected.includes('cashier_data')) {
            csvContent += "Cashier Performance\n";
            csvContent += "Name,Daily Revenue,Weekly Revenue,Monthly Revenue,Total Revenue\n";
            posDashboardData.cashier_performance.forEach(c => {
            csvContent += `${c.name},${c.daily_revenue.toFixed(2)},${c.weekly_revenue.toFixed(2)},${c.monthly_revenue.toFixed(2)},${c.total_revenue.toFixed(2)}\n`;
            });
            csvContent += "\n";
        }

        // --- Top Selling Products ---
        if (selected.includes('top_selling_products')) {
            csvContent += "Top Selling Products\n";
            csvContent += "Product Name,Total Sold\n";
            posDashboardData.top_selling_products.forEach(p => {
            csvContent += `${p.product__name},${p.total_sold}\n`;
            });
            csvContent += "\n";
        }

        // --- Sales Trend ---
        if (selected.includes('products_sold_trend')) {
            csvContent += "Sales Trend\n";
            csvContent += "Date,Items Sold\n";
            posDashboardData.sales_trend.forEach(t => {
            csvContent += `${t.date},${t.amount}\n`;
            });
            csvContent += "\n";
        }

        // --- Orders Dashboard ---
        if (selected.some(key => ['total_orders','pending','completed','rejected'].includes(key))) {
            csvContent += "Orders Dashboard\n";
            csvContent += "Metric,Value\n";

            if (selected.includes('total_orders'))
            csvContent += `Total Orders,${ordersDashboardData.total_orders}\n`;

            if (selected.includes('pending'))
            csvContent += `Pending Orders,${ordersDashboardData.pending_orders}\n`;

            if (selected.includes('completed'))
            csvContent += `Completed Orders,${ordersDashboardData.completed_orders}\n`;

            if (selected.includes('rejected'))
            csvContent += `Rejected Orders,${ordersDashboardData.rejected_orders}\n`;

            csvContent += "\n";
        }

        // Download CSV
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Dashboard_Report_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // FILTERS AND PARAMETERS

    const handleFrequency = (value) => {
        if (value === frequency) {setFrequency('daily'); return;}

        setFrequency(value)
    }

    const handleStartDate = (value) => {
        if (endDate && new Date(value) > new Date(endDate)) {
            addToast("Start date cannot be after the end date.", "error");
            return;
        }
        setStartDate(value);
    };

    const handleEndDate = (value) => {
        if (startDate && new Date(value) < new Date(startDate)) {
            addToast("End date cannot be before the start date.", "error");
            return;
        }
        setEndDate(value);
    };

    // MAPS

    const topSellingProducts = posDashboardData.top_selling_products.map((item, index) => (
        <div className='flex w-80 gap-4 p-2.5 rounded-sm bg-main-white shadow-sm border border-main-dark' key={index}>
            <div className='w-8 h-8 font-semibold rounded-full aspect-square flex justify-center items-center bg-accent-mute text-white '><h5>{index + 1}</h5></div>
            <div className='text-sm'>
                <h5 className='font-semibold'>{item.product__name}</h5>
                <h5 className='text-xs text-text-light'>{item.total_sold} units sold</h5>
            </div>
        </div>
    ));

    const cashierTableHeader = [
        "Name",
        "Today",
        "This Week",
        "This Month",
        "Total"
    ];

    const listCashierTableHeader = cashierTableHeader.map((item, index) => 
        <h5 key={index} className='flex-1 text-center font-medium text-sm text-white'>{item}</h5>
    );

    const cashierRowStyle = 'flex-1 text-center text-sm font-semibold text-text';

    const listCashiers = posDashboardData.cashier_performance.map((cashier, index) =>
        <div key={index} className='flex flex-row p-2.5 border-b border-b-border'>
            <h5 className={cashierRowStyle}>{cashier.name}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.daily_revenue)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.weekly_revenue)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.monthly_revenue)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.total_revenue)}</h5>
        </div>
    );

    return (
        <div className='flex-1 flex p-2 gap-6 w-full h-full flex-col pb-8'>
            <button 
                onClick={() => setDownloadModal(true)}
                className='p-2.5 w-fit rounded-md bg-main-white border border-border flex flex-row items-center gap-2 text-sm font-medium cursor-pointer hover:bg-main-dark text-text/50 ml-auto'>
                Download Report
                <Download size={18} />
            </button>
            <div className="flex gap-2 bg-white p-4 rounded-sm shadow-sm w-fit">
                <div>
                    <h5 className="text-xs font-semibold text-text/50 mb-2">Report Type</h5>
                    <div className="flex gap-2">
                        <Button text="Daily" onClick={() => handleFrequency('daily')} className={cn("rounded-sm text-xs font-semibold py-2 px-4 bg-white text-accent-mute shadow-md border-none", frequency === "daily" && 'bg-accent text-white')}/>
                        <Button text="Weekly" onClick={() => handleFrequency('weekly')} className={cn("rounded-sm text-xs font-semibold py-2 px-4 bg-white text-accent-mute shadow-md border-none", frequency === "weekly" && 'bg-accent text-white')}/>
                        <Button text="Monthly" onClick={() => handleFrequency('monthly')} className={cn("rounded-sm text-xs font-semibold py-2 px-4 bg-white text-accent-mute shadow-md border-none", frequency === "monthly" && 'bg-accent text-white')}/>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <div className="">
                        <h5 className="text-xs font-semibold text-text/50 mb-1">Start Date</h5>
                        <div className="flex gap-2 items-center">
                            <DatePicker selected={startDate} onSelect={handleStartDate} className='w-fit bg-white gap-8 ml-4 shadow-sm text-xs font-semibold text-accent-mute border-accent-mute'/> 
                            {startDate &&
                                <Button icon={X} onClick={() => handleStartDate(null)} variant="icon" text="" className="border-none font-semibold text-sm text-accent-mute" />
                            }
                        </div>
                    </div>
                    <div>
                        <h5 className="text-xs font-semibold text-text/50 mb-1">End Date</h5>
                        <div className="flex gap-2 items-center">
                            <DatePicker selected={endDate} onSelect={handleEndDate} className='w-fit bg-white gap-8 shadow-sm text-xs font-semibold text-accent-mute'/> 
                            {endDate &&
                                <Button icon={X} onClick={() => handleEndDate(null)} variant="icon" text="" className="border-none font-semibold text-sm text-accent-mute" />
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing POS dashboards */}
            <Label variant="small" text="POS Sales Data"/>
            <div className='flex items-center gap-4 -mt-4'>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Voided Transactions</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{posDashboardData.total_void_amount}</h5>
                    <h5 className='text-sm text-error'>Cancelled Orders</h5>
                </div>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Total Orders</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{posDashboardData.total_successful_transactions}</h5>
                    <h5 className='text-sm text-success'>Completed Transactions</h5>
                </div>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Products Sold</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{posDashboardData.total_products_sold}</h5>
                    <h5 className='text-sm text-none-text'>Total Items</h5>
                </div>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Avg Daily Orders</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>

                    <h5 className='text-2xl font-bold mt-8'>{posDashboardData.avg_daily_transactions}</h5>
                    <h5 className='text-sm text-none-text'>Orders</h5>
                </div>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Total Revenue</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>₱ {(posDashboardData.total_revenue_generated).toFixed(2)}</h5>
                    <h5 className='text-sm text-success'>Revenue Generated</h5>
                </div>
            </div>

            <Label variant="small" text="Cake Order Sales Data"/>
            <div className='flex items-center gap-4 -mt-4'>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Total Orders</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{ordersDashboardData.total_orders}</h5>
                    <h5 className='text-sm text-none-text'>All Orders</h5>
                </div>

                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Pending</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{ordersDashboardData.pending_orders}</h5>
                    <h5 className='text-sm text-warning'>Waiting</h5>
                </div>

                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Completed</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{ordersDashboardData.completed_orders}</h5>
                    <h5 className='text-sm text-success'>Success</h5>
                </div>

                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Rejected</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{ordersDashboardData.rejected_orders}</h5>
                    <h5 className='text-sm text-error'>Cancelled</h5>
                </div>
            </div>

            <div className='flex gap-4'>
                <div className='flex-1'>
                    <DashboardChart chartData={posDashboardData.sales_trend}/>
                </div>
                <div className='flex flex-col gap-2 bg-main-white p-4 rounded-xl shadow-sm h-full min-h-120'>
                    <h5 className='font-semibold'>Top Selling Products</h5>
                    {topSellingProducts}
                </div>
            </div>

            <div className='p-4 bg-main-white rounded-md shadow-sm'>
                <h5 className='font-semibold'>Cashier Revenues</h5>

                <div className='flex flex-col gap-2 p-2.5'>
                    <div className='flex flex-row gap-2 p-2 rounded-md bg-accent-mute rounded-t-xl'>
                        {listCashierTableHeader}
                    </div>
                    {listCashiers}
                </div>
            </div>

            {downloadModal &&
                <DownloadReportModal onClose={() => setDownloadModal(false)} onConfirm={downloadCSV}/>
            }
        </div>
    );
};

export default Reports;
