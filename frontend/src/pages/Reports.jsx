import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable";
import React, { useState, useEffect } from 'react';
import { Download, XCircle } from 'lucide-react';
import useDashboard from '@/hooks/useDashboard';
import Loading from '@/components/molecules/Loading';
import { DashboardChart, DownloadReportModal } from '@/components/organisms';
import { Button, Label, Dropdown } from "@/components/atoms";
import { cn } from "@/utils/cn";
import { useSearchParams } from "react-router-dom";

jsPDF.API.autoTable = autoTable;

const Reports = () => {
    
    const {
        dashboardData,
        orderDashboardData,
        dashboardLoading,
        orderDashboardLoading,
        dashboardError,
        orderDashboardError
    } = useDashboard();

    const [searchParams, setSearchParams] = useSearchParams();
    
    const [frequency, setFrequency] = useState('daily')
    const [month, setMonth] = useState(null);

    const [downloadModal, setDownloadModal] = useState(false);

    useEffect(() => {
        let params = {};

        if (frequency !== undefined && frequency !== null && frequency !== '') {
            params.frequency = frequency;
        }

        if (month !== undefined && month !== null) {
            params.month = Number(month);
        }

        setSearchParams(params)
    }, [frequency, month])
    
    if (dashboardLoading || orderDashboardLoading) return <Loading />;
    if (dashboardError || orderDashboardError) return <h5>Error...</h5>;

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
            csvContent += `Total Successful Transactions,${dashboardData.total_successful_transactions}\n`;

            if (selected.includes('products_sold'))
            csvContent += `Total Products Sold,${dashboardData.total_products_sold}\n`;

            if (selected.includes('avg_daily_orders'))
            csvContent += `Average Daily Transactions,${dashboardData.avg_daily_transactions}\n`;

            if (selected.includes('voided_transactions'))
            csvContent += `Total Voided Transactions,${dashboardData.total_void_amount}\n`;

            if (selected.includes('total_revenue'))
            csvContent += `Total Revenue,${dashboardData.total_revenue_generated}\n`;

            csvContent += "\n";
        }

        // --- Cashier Performance ---
        if (selected.includes('cashier_data')) {
            csvContent += "Cashier Performance\n";
            csvContent += "Name,Daily Revenue,Weekly Revenue,Monthly Revenue,Total Revenue\n";
            dashboardData.cashier_performance.forEach(c => {
            csvContent += `${c.name},${c.daily_revenue.toFixed(2)},${c.weekly_revenue.toFixed(2)},${c.monthly_revenue.toFixed(2)},${c.total_revenue.toFixed(2)}\n`;
            });
            csvContent += "\n";
        }

        // --- Top Selling Products ---
        if (selected.includes('top_selling_products')) {
            csvContent += "Top Selling Products\n";
            csvContent += "Product Name,Total Sold\n";
            dashboardData.top_selling_products.forEach(p => {
            csvContent += `${p.product__name},${p.total_sold}\n`;
            });
            csvContent += "\n";
        }

        // --- Sales Trend ---
        if (selected.includes('products_sold_trend')) {
            csvContent += "Sales Trend\n";
            csvContent += "Date,Items Sold\n";
            dashboardData.sales_trend.forEach(t => {
            csvContent += `${t.date},${t.amount}\n`;
            });
            csvContent += "\n";
        }

        // --- Orders Dashboard ---
        if (selected.some(key => ['total_orders','pending','completed','rejected'].includes(key))) {
            csvContent += "Orders Dashboard\n";
            csvContent += "Metric,Value\n";

            if (selected.includes('total_orders'))
            csvContent += `Total Orders,${orderDashboardData.total_orders}\n`;

            if (selected.includes('pending'))
            csvContent += `Pending Orders,${orderDashboardData.pending_orders}\n`;

            if (selected.includes('completed'))
            csvContent += `Completed Orders,${orderDashboardData.completed_orders}\n`;

            if (selected.includes('rejected'))
            csvContent += `Rejected Orders,${orderDashboardData.rejected_orders}\n`;

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

    const handleFrequency = (value) => {
        if (value === frequency) {setFrequency('daily'); return;}

        setFrequency(value)
    }

    const handleSetMonth = (value) => {
        setMonth(month => {
            if (month == value) return null;
                return value
            })
    }

    const topSellingProducts = dashboardData.top_selling_products.map((item, index) => (
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

    const listCashiers = dashboardData.cashier_performance.map((cashier, index) =>
        <div key={index} className='flex flex-row p-2.5 border-b border-b-border'>
            <h5 className={cashierRowStyle}>{cashier.name}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.daily_revenue).toFixed(2)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.weekly_revenue).toFixed(2)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.monthly_revenue).toFixed(2)}</h5>
            <h5 className={cashierRowStyle}>₱ {(cashier.total_revenue).toFixed(2)}</h5>
        </div>
    );

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col pb-8'>
            <button 
                onClick={() => setDownloadModal(true)}
                className='p-2.5 w-fit rounded-md bg-main-white border border-border flex flex-row items-center gap-2 text-sm font-medium cursor-pointer hover:bg-main-dark text-text/50 ml-auto'>
                Download Report
                <Download size={18} />
            </button>

            <div className="flex gap-2">
                <Button text="Daily" onClick={() => handleFrequency('daily')} className={cn("text-xs font-medium py-2 px-8 bg-white text-accent-mute border-accent-mute", frequency === "daily" && 'bg-accent text-white border-accent')}/>
                <Button text="Weekly" onClick={() => handleFrequency('weekly')} className={cn("text-xs font-medium py-2 px-8 bg-white text-accent-mute border-accent-mute", frequency === "weekly" && 'bg-accent text-white border-accent')}/>
                <Button text="Monthly" onClick={() => handleFrequency('monthly')} className={cn("text-xs font-medium py-2 px-8 bg-white text-accent-mute border-accent-mute", frequency === "monthly" && 'bg-accent text-white border-accent')}/>

            {false &&
                    <Dropdown value={month} selection={"Select Month"} options={months} onSelect={handleSetMonth}/>
                } 
            </div>

            {/* Existing POS dashboards */}
            <Label variant="small" text="POS Sales Data"/>
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
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Total Revenue</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>₱ {(dashboardData.total_revenue_generated).toFixed(2)}</h5>
                    <h5 className='text-sm text-success'>Revenue Generated</h5>
                </div>
            </div>

            <Label variant="small" text="Cake Order Sales Data"/>
            <div className='flex items-center gap-4 mt-4'>
                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Total Orders</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{orderDashboardData.total_orders}</h5>
                    <h5 className='text-sm text-none-text'>All Orders</h5>
                </div>

                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Pending</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{orderDashboardData.pending_orders}</h5>
                    <h5 className='text-sm text-warning'>Waiting</h5>
                </div>

                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Completed</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{orderDashboardData.completed_orders}</h5>
                    <h5 className='text-sm text-success'>Success</h5>
                </div>

                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Rejected</h5>
                        <XCircle className='text-accent' size={16} />
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>{orderDashboardData.rejected_orders}</h5>
                    <h5 className='text-sm text-error'>Cancelled</h5>
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
