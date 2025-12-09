import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable";
import React from 'react';
import { Download, XCircle } from 'lucide-react';
import useDashboard from '@/hooks/useDashboard';
import Loading from '@/components/molecules/Loading';
import { DashboardChart } from '@/components/organisms';
import { Label } from "@/components/atoms";

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

    if (dashboardLoading || orderDashboardLoading) return <Loading />;
    if (dashboardError || orderDashboardError) return <h5>Error...</h5>;

    const downloadCSV = () => {
        const today = new Date().toISOString().split("T")[0];

        let csvContent = "data:text/csv;charset=utf-8,";

        // --- POS Dashboard ---
        csvContent += "POS Dashboard Metrics\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Successful Transactions,${dashboardData.total_successful_transactions}\n`;
        csvContent += `Total Products Sold,${dashboardData.total_products_sold}\n`;
        csvContent += `Average Daily Transactions,${dashboardData.avg_daily_transactions}\n`;
        csvContent += `Total Voided Transactions,${dashboardData.total_void_amount}\n\n`;

        // --- Cashier Performance ---
        csvContent += "Cashier Performance\n";
        csvContent += "Name,Daily Revenue,Weekly Revenue,Monthly Revenue,Total Revenue\n";
        dashboardData.cashier_performance.forEach(c => {
            csvContent += `${c.name},${c.daily_revenue.toFixed(2)},${c.weekly_revenue.toFixed(2)},${c.monthly_revenue.toFixed(2)},${c.total_revenue.toFixed(2)}\n`;
        });
        csvContent += "\n";

        // --- Top Selling Products ---
        csvContent += "Top Selling Products\n";
        csvContent += "Product Name,Total Sold\n";
        dashboardData.top_selling_products.forEach(p => {
            csvContent += `${p.product__name},${p.total_sold}\n`;
        });
        csvContent += "\n";

        // --- Sales Trend ---
        csvContent += "Sales Trend\n";
        csvContent += "Date,Items Sold\n";
        dashboardData.sales_trend.forEach(t => {
            csvContent += `${t.date},${t.amount}\n`;
        });
        csvContent += "\n";

        // --- Orders Dashboard ---
        csvContent += "Orders Dashboard\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Orders,${orderDashboardData.total_orders}\n`;
        csvContent += `Pending Orders,${orderDashboardData.pending_orders}\n`;
        csvContent += `Completed Orders,${orderDashboardData.completed_orders}\n`;
        csvContent += `Rejected Orders,${orderDashboardData.rejected_orders}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Dashboard_Report_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                onClick={downloadCSV}
                className='p-2.5 w-fit rounded-md bg-main-white border border-border flex flex-row items-center gap-2 text-sm font-medium cursor-pointer hover:bg-main-dark text-text/50 ml-auto'>
                Download Report
                <Download size={18} />
            </button>

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

            {/* ⭐ NEW ORDER DASHBOARD SECTION ⭐ */}
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

            {/* CHART + TOP PRODUCTS */}
            <div className='flex gap-4'>
                <div className='flex-1'>
                    <DashboardChart chartData={dashboardData.sales_trend}/>
                </div>
                <div className='flex flex-col gap-2 bg-main-white p-4 rounded-xl shadow-sm h-full min-h-120'>
                    <h5 className='font-semibold'>Top Selling Products</h5>
                    {topSellingProducts}
                </div>
            </div>

            {/* CASHIER TABLE */}
            <div className='p-4 bg-main-white rounded-md shadow-sm'>
                <h5 className='font-semibold'>Cashier Revenues</h5>

                <div className='flex flex-col gap-2 p-2.5'>
                    <div className='flex flex-row gap-2 p-2 rounded-md bg-accent-mute rounded-t-xl'>
                        {listCashierTableHeader}
                    </div>
                    {listCashiers}
                </div>
            </div>
        </div>
    );
};

export default Reports;
