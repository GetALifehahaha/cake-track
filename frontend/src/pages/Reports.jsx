import React, { useState, useEffect } from 'react';
import { Download, X, Info, RefreshCw } from 'lucide-react';
import useDashboard from '@/hooks/useDashboard';
import useCategory from '@/hooks/useCategory';
import { DashboardChart, DownloadReportModal } from '@/components/organisms';
import { Button, Dropdown, Label } from "@/components/atoms";
import { useSearchParams } from "react-router-dom";
import { DatePicker } from "@/components/molecules";
import { formatDateForAPI } from "@/utils/date";
import { useToast } from "@/context/ToastContext";
import { ReportsSkeleton } from "@/components/molecules/Skeletons";
import Modal from "@/components/molecules/Modal";


const Reports = () => {

    const { addToast } = useToast();

    const {
        posDashboardData,
        ordersDashboardData,
        loading,
        error,
        refreshReports,
    } = useDashboard();
    const { categoryData } = useCategory();

    const [searchParams, setSearchParams] = useSearchParams();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [downloadModal, setDownloadModal] = useState(false);
    const [showTopSellingModal, setShowTopSellingModal] = useState(false);
    const [showLeastSellingModal, setShowLeastSellingModal] = useState(false);
    const [topSellingCategoryFilter, setTopSellingCategoryFilter] = useState(() => searchParams.get('top_selling_category') || null);
    const [leastSellingCategoryFilter, setLeastSellingCategoryFilter] = useState(() => searchParams.get('least_selling_category') || null);

    useEffect(() => {
        setSearchParams((prevParams) => {
            const params = new URLSearchParams(prevParams);

            if (startDate == null) params.delete('start_date');
            else params.set('start_date', formatDateForAPI(startDate));

            if (endDate == null) params.delete('end_date');
            else params.set('end_date', formatDateForAPI(endDate));

            if (topSellingCategoryFilter == null) params.delete('top_selling_category');
            else params.set('top_selling_category', topSellingCategoryFilter);

            if (leastSellingCategoryFilter == null) params.delete('least_selling_category');
            else params.set('least_selling_category', leastSellingCategoryFilter);

            return params;
        });
    }, [startDate, endDate, topSellingCategoryFilter, leastSellingCategoryFilter, setSearchParams])

    if (loading) return <ReportsSkeleton />;
    if (error) return <h5>Error...</h5>;


    const toNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const formatNumber = (value, minimumFractionDigits = 0, maximumFractionDigits = minimumFractionDigits) => {
        return toNumber(value).toLocaleString('en-PH', {
            minimumFractionDigits,
            maximumFractionDigits,
        });
    };

    const formatDateOnly = (value) => {
        if (!value) return '-';

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return String(value).split('T')[0] || String(value);
        }

        return parsed.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const formatTopProductCell = (product) => {
        if (!product || typeof product !== 'object') return '-';
        const name = product.product__name || 'Unknown Product';
        const count = formatNumber(product.total_sold);
        return `${name} (${count})`;
    };

    const getProductCategoryNames = (product) => {
        const categories = Array.isArray(product?.product_categories)
            ? product.product_categories.filter(Boolean)
            : [];

        return categories.length > 0 ? categories : ['Uncategorized'];
    };

    const formatProductCategories = (product) => {
        return getProductCategoryNames(product).join(', ');
    };

    const posRevenue = toNumber(posDashboardData?.total_revenue_generated);
    const ordersRevenue = toNumber(ordersDashboardData?.total_revenue_generated);
    const combinedSalesRevenue = posRevenue + ordersRevenue;
    const posVatAmount = posRevenue * 0.12;
    const ordersVatAmount = ordersRevenue * 0.12;
    const totalVatAmount = combinedSalesRevenue * 0.12;
    const totalDiscountAmount = toNumber(posDashboardData?.total_discount_amount);

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const buildTable = (headers, rows) => {
        const safeHeaders = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');

        const safeRows = rows.length > 0
            ? rows.map((row) => (
                `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
            )).join('')
            : `<tr><td colspan="${headers.length}" class="empty-row">No data available.</td></tr>`;

        return `
            <table class="report-table">
                <thead>
                    <tr>${safeHeaders}</tr>
                </thead>
                <tbody>
                    ${safeRows}
                </tbody>
            </table>
        `;
    };

    const downloadExcelReport = (selected) => {
        const pos = posDashboardData || {};
        const orders = ordersDashboardData || {};
        const selectedSet = new Set(selected);
        const today = new Date().toISOString().split('T')[0];

        const sections = [];

        if (selected.some(key => [
            'voided_transactions',
            'total_transactions',
            'products_sold',
            'avg_daily_orders',
            'total_revenue'
        ].includes(key))) {
            const posRows = [];

            if (selectedSet.has('total_transactions')) {
                posRows.push(['Total Successful Transactions', formatNumber(pos.total_successful_transactions)]);
            }

            if (selectedSet.has('products_sold')) {
                posRows.push(['Total Products Sold', formatNumber(pos.total_products_sold)]);
            }

            if (selectedSet.has('avg_daily_orders')) {
                posRows.push(['Average Daily Transactions', formatNumber(pos.avg_daily_transactions, 2, 2)]);
            }

            if (selectedSet.has('voided_transactions')) {
                posRows.push(['Total Voided Transactions', formatNumber(pos.total_void_amount)]);
            }

            if (selectedSet.has('total_revenue')) {
                posRows.push(['Total Revenue', formatNumber(pos.total_revenue_generated, 2, 2)]);
            }

            sections.push({
                title: 'POS Dashboard Metrics',
                table: buildTable(['Metric', 'Value'], posRows),
            });
        }

        if (selectedSet.has('cashier_data')) {
            const cashierRows = (pos.cashier_performance || []).map((cashier) => [
                cashier.name || '-',
                formatNumber(cashier.daily_revenue, 2, 2),
                formatNumber(cashier.weekly_revenue, 2, 2),
                formatNumber(cashier.monthly_revenue, 2, 2),
                formatNumber(cashier.total_revenue, 2, 2),
            ]);

            sections.push({
                title: 'Cashier Performance',
                table: buildTable(['Name', 'Daily Revenue', 'Weekly Revenue', 'Monthly Revenue', 'Total Revenue'], cashierRows),
            });
        }

        if (selectedSet.has('top_selling_products')) {
            const productRows = (pos.top_selling_products || []).map((product) => [
                product.product__name || '-',
                formatProductCategories(product),
                formatNumber(product.total_sold),
            ]);

            sections.push({
                title: 'Top Selling Products',
                table: buildTable(['Product Name', 'Categories', 'Total Sold'], productRows),
            });
        }

        if (selectedSet.has('least_selling_products')) {
            const leastRows = (pos.least_selling_products || []).map((product) => [
                product.product__name || '-',
                formatProductCategories(product),
                formatNumber(product.total_sold),
            ]);

            sections.push({
                title: 'Least Selling Products',
                table: buildTable(['Product Name', 'Categories', 'Total Sold'], leastRows),
            });
        }

        if (selectedSet.has('products_sold_trend')) {
            const trendRows = (pos.sales_trend || []).map((trendItem) => {
                const topProducts = Array.isArray(trendItem.top_products) ? trendItem.top_products : [];

                return [
                    formatDateOnly(trendItem.period),
                    formatNumber(trendItem.amount),
                    formatTopProductCell(topProducts[0]),
                    formatTopProductCell(topProducts[1]),
                    formatTopProductCell(topProducts[2]),
                ];
            });

            sections.push({
                title: 'Products Sold Trend',
                table: buildTable(['Date', 'Items Sold', 'Top 1 Product', 'Top 2 Product', 'Top 3 Product'], trendRows),
            });
        }

        if (selectedSet.has('revenue_trend')) {
            const revenueRows = (pos.revenue_trend || []).map((trendItem) => [
                formatDateOnly(trendItem.period),
                formatNumber(trendItem.amount, 2, 2),
            ]);

            sections.push({
                title: 'Revenue Trend',
                table: buildTable(['Date', 'Revenue'], revenueRows),
            });
        }

        if (selected.some(key => ['total_orders', 'pending', 'completed', 'rejected', 'order_total_revenue'].includes(key))) {
            const orderRows = [];

            if (selectedSet.has('total_orders')) {
                orderRows.push(['Total Orders', formatNumber(orders.total_orders)]);
            }

            if (selectedSet.has('pending')) {
                orderRows.push(['Pending Orders', formatNumber(orders.pending_orders)]);
            }

            if (selectedSet.has('completed')) {
                orderRows.push(['Completed Orders', formatNumber(orders.completed_orders)]);
            }

            if (selectedSet.has('rejected')) {
                orderRows.push(['Rejected Orders', formatNumber(orders.rejected_orders)]);
            }

            if (selectedSet.has('order_total_revenue')) {
                orderRows.push(['Total Revenue Generated', formatNumber(orders.total_revenue_generated, 2, 2)]);
            }

            sections.push({
                title: 'Orders Dashboard',
                table: buildTable(['Metric', 'Value'], orderRows),
            });
        }

        const sectionHtml = sections.length > 0
            ? sections.map((section) => `
                <section class="report-section">
                    <h2>${escapeHtml(section.title)}</h2>
                    ${section.table}
                </section>
            `).join('')
            : `
                <section class="report-section">
                    <h2>No Selected Data</h2>
                    <p class="empty-row">No report sections were selected.</p>
                </section>
            `;

        const htmlContent = `
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <style>
                        body {
                            font-family: Segoe UI, Tahoma, sans-serif;
                            background: #f8fafc;
                            color: #0f172a;
                            margin: 0;
                            padding: 24px;
                        }

                        .wrapper {
                            background: #ffffff;
                            border: 1px solid #cbd5e1;
                            border-radius: 12px;
                            padding: 20px;
                        }

                        h1 {
                            margin: 0 0 4px 0;
                            font-size: 24px;
                            color: #0f172a;
                        }

                        .subtitle {
                            margin: 0;
                            color: #475569;
                            font-size: 12px;
                        }

                        .report-section {
                            margin-top: 20px;
                        }

                        .report-section h2 {
                            margin: 0;
                            padding: 8px 12px;
                            border-radius: 8px;
                            background: #e2e8f0;
                            color: #1e293b;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 0.04em;
                        }

                        .report-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 8px;
                            background: #ffffff;
                        }

                        .report-table th {
                            text-align: left;
                            padding: 8px 10px;
                            border: 1px solid #cbd5e1;
                            background: #f1f5f9;
                            color: #1e293b;
                            font-size: 12px;
                        }

                        .report-table td {
                            padding: 8px 10px;
                            border: 1px solid #e2e8f0;
                            font-size: 12px;
                        }

                        .empty-row {
                            color: #64748b;
                            text-align: center;
                            font-style: italic;
                        }
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <h1>Cake Track Report</h1>
                        ${sectionHtml}
                    </div>
                </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/vnd.ms-excel;charset=utf-8;',
        });

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `CakeTrack_Report_${today}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    };

    // FILTERS AND PARAMETERS

    const handleStartDate = (value) => {
        if (endDate && new Date(value) > new Date(endDate)) {
            addToast("Start date cannot be after the end date.", "error");
            return;
        }
        setStartDate(value);
    };

    const handleEndDate = (value) => {
        if (value == null) {
            setEndDate(null);
            return;
        }

        if (startDate && new Date(value) < new Date(startDate)) {
            addToast("End date cannot be before the start date.", "error");
            return;
        }
        setEndDate(value);
    };

    const handleRefreshReports = async () => {
        try {
            await refreshReports();
            addToast("Reports refreshed successfully.", "success");
        } catch {
            addToast("Unable to refresh reports right now.", "error");
        }
    };

    const clearAllFilters = () => {
        setStartDate(null);
        setEndDate(null);
    };

    const rankingCategoryOptions = (categoryData || [])
        .map((category) => category?.name)
        .filter(Boolean)
        .sort((a, b) => String(a).localeCompare(String(b)))
        .map((categoryName) => ({ key: categoryName, value: categoryName }));

    // MAPS

    const topSellingProductCards = (posDashboardData.top_selling_products || []).slice(0, 5).map((item, index) => (
        <div className='flex gap-4 p-2.5 rounded-sm bg-main-white shadow-sm border border-main-dark' key={index}>
            <div className='w-8 h-8 font-semibold rounded-full aspect-square flex justify-center items-center bg-accent-mute text-white '><h5>{index + 1}</h5></div>
            <div className='text-sm'>
                <h5 className='font-semibold'>{item.product__name}</h5>
                <h5 className='text-xs text-text/70'>{formatProductCategories(item)}</h5>
                <h5 className='text-xs text-text-light'>{item.total_sold} units sold</h5>
            </div>
        </div>
    ));

    const leastSellingProductCards = (posDashboardData.least_selling_products || []).slice(0, 5).map((item, index) => (
        <div className='flex gap-4 p-2.5 rounded-sm bg-main-white shadow-sm border border-main-dark' key={index}>
            <div className='w-8 h-8 font-semibold rounded-full aspect-square flex justify-center items-center bg-main-dark text-white '><h5>{index + 1}</h5></div>
            <div className='text-sm'>
                <h5 className='font-semibold'>{item.product__name}</h5>
                <h5 className='text-xs text-text/70'>{formatProductCategories(item)}</h5>
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
            <div className="flex flex-row gap-2 w-full">
                <div className="flex gap-2">
                    <div className="">
                        <h5 className="text-xs font-semibold text-text/50 mb-1">Start Date</h5>
                        <div className="flex gap-2 items-center">
                            <DatePicker selected={startDate} onSelect={handleStartDate} className='w-fit bg-white gap-8 ml-4 shadow-sm text-xs font-semibold text-accent-mute border-accent-mute' />
                            {startDate &&
                                <Button icon={X} onClick={() => handleStartDate(null)} variant="icon" text="" className="border-none font-semibold text-sm text-accent-mute" />
                            }
                        </div>
                    </div>
                    <div>
                        <h5 className="text-xs font-semibold text-text/50 mb-1">End Date</h5>
                        <div className="flex gap-2 items-center">
                            <DatePicker selected={endDate} onSelect={handleEndDate} className='w-fit bg-white gap-8 shadow-sm text-xs font-semibold text-accent-mute' />
                            {endDate &&
                                <Button icon={X} onClick={() => handleEndDate(null)} variant="icon" text="" className="border-none font-semibold text-sm text-accent-mute" />
                            }
                        </div>
                    </div>
                </div>
                <div className='ml-auto flex items-center gap-2'>
                    {(startDate || endDate) && (
                        <Button
                            text='Clear All'
                            size='small'
                            variant='modalOutline'
                            onClick={clearAllFilters}
                            className='rounded-sm py-2.5 px-4 h-fit'
                        />
                    )}
                    <button
                        type='button'
                        onClick={handleRefreshReports}
                        className='flex items-center gap-2 rounded-sm py-2 px-3 h-fit border border-accent-mute text-accent-mute bg-main-white text-sm font-semibold hover:bg-main-dark/10'
                    >
                        <RefreshCw size={14} />
                        Refresh Reports
                    </button>
                    <Button text="Download Report" size="small" variant="block" icon={Download} onClick={() => setDownloadModal(true)} className="rounded-sm py-2.5 px-4 h-fit" />
                </div>
            </div>

            {/* Existing POS dashboards */}
            <Label variant="small" text="POS Sales Data" />
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
                    <h5 className='text-2xl font-bold mt-8'>₱ {formatNumber(posRevenue, 2, 2)}</h5>
                    <div className='mt-1 flex items-center justify-between'>
                        <h5 className='text-sm text-success'>Revenue Generated</h5>
                        <h5 className='text-sm text-text/60'>VAT: ₱ {formatNumber(posVatAmount, 2, 2)}</h5>
                    </div>
                </div>
            </div>

            <Label variant="small" text="Cake Order Sales Data" />
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

                <div className='flex-1 rounded-xl p-4 bg-main-white shadow-sm'>
                    <div className='flex justify-between items-center'>
                        <h5 className='text-lg font-medium'>Total Revenue</h5>
                        {/* <XCircle className='text-accent' size={16} /> */}
                    </div>
                    <h5 className='text-2xl font-bold mt-8'>₱ {formatNumber(ordersRevenue, 2, 2)}</h5>
                    <div className='mt-1 flex items-center justify-between'>
                        <h5 className='text-sm text-success'>Revenue Generated</h5>
                        <h5 className='text-sm text-text/60'>VAT: ₱ {formatNumber(ordersVatAmount, 2, 2)}</h5>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 -mt-1'>
                <div className='rounded-xl p-4 bg-accent shadow-lg shadow-accent-mute/35 border border-main-white/20'>
                    <h5 className='text-sm font-bold text-main-white'>Combined Revenue</h5>
                    <h5 className='text-3xl font-extrabold mt-2 text-main-white'>₱ {formatNumber(combinedSalesRevenue, 2, 2)}</h5>
                </div>

                <div className='rounded-xl p-4 bg-main-white shadow-sm border border-border'>
                    <h5 className='text-sm font-semibold text-text/70'>Total VAT</h5>
                    <h5 className='text-2xl font-extrabold mt-2 text-text'>₱ {formatNumber(totalVatAmount, 2, 2)}</h5>
                </div>

                <div className='rounded-xl p-4 bg-main-white shadow-sm border border-border'>
                    <h5 className='text-sm font-semibold text-text/70'>Total Discount Amount</h5>
                    <h5 className='text-2xl font-extrabold mt-2 text-text'>₱ {formatNumber(totalDiscountAmount, 2, 2)}</h5>
                </div>
            </div>

            <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                    <Label variant="small" text="Product Ranking Data" />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-2 bg-main-white p-4 rounded-xl shadow-sm h-full'>
                        <div className='flex items-center justify-between'>
                            <h5 className='font-semibold'>Top 5 Best Selling Products</h5>
                            <div className='flex items-center gap-2'>
                                <div className='w-44'>
                                    <Dropdown
                                        size='full'
                                        variant='white'
                                        selection='All categories'
                                        value={topSellingCategoryFilter}
                                        options={rankingCategoryOptions}
                                        onSelect={setTopSellingCategoryFilter}
                                        removeText='All categories'
                                    />
                                </div>
                                <button
                                    type='button'
                                    onClick={() => setShowTopSellingModal(true)}
                                    className='p-1.5 rounded-full border border-border bg-main-white text-text/70 hover:bg-main-dark/10'
                                    aria-label='View top 10 best selling products'
                                >
                                    <Info size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="py-2 px-1 flex flex-col gap-2 min-h-60">
                            {topSellingProductCards.length > 0 ? topSellingProductCards : <h5 className='text-sm text-text/60'>No product sales data for this category.</h5>}
                        </div>
                    </div>

                    <div className='flex flex-col gap-2 bg-main-white p-4 rounded-xl shadow-sm h-full'>
                        <div className='flex items-center justify-between'>
                            <h5 className='font-semibold'>Top 5 Least Selling Products</h5>
                            <div className='flex items-center gap-2'>
                                <div className='w-44'>
                                    <Dropdown
                                        size='full'
                                        variant='white'
                                        selection='All categories'
                                        value={leastSellingCategoryFilter}
                                        options={rankingCategoryOptions}
                                        onSelect={setLeastSellingCategoryFilter}
                                        removeText='All categories'
                                    />
                                </div>
                                <button
                                    type='button'
                                    onClick={() => setShowLeastSellingModal(true)}
                                    className='p-1.5 rounded-full border border-border bg-main-white text-text/70 hover:bg-main-dark/10'
                                    aria-label='View top 10 least selling products'
                                >
                                    <Info size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="py-2 px-1 flex flex-col gap-2 min-h-60">
                            {leastSellingProductCards.length > 0 ? leastSellingProductCards : <h5 className='text-sm text-text/60'>No product sales data for this category.</h5>}
                        </div>
                    </div>
                </div>

                <div className='flex-1'>
                    <DashboardChart salesData={posDashboardData.sales_trend} revenueData={posDashboardData.revenue_trend} />
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
                <DownloadReportModal onClose={() => setDownloadModal(false)} onConfirm={downloadExcelReport} />
            }

            {showTopSellingModal && (
                <Modal title='Top 10 Best Selling Products' onClose={() => setShowTopSellingModal(false)} className='w-[520px]'>
                    <div className='flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1'>
                        {(posDashboardData.top_selling_products || []).map((product, index) => (
                            <div key={`${product.product__name}-${index}`} className='flex items-center justify-between border border-border rounded-lg p-3 bg-main-white gap-2'>
                                <div>
                                    <h5 className='text-text font-medium'>{index + 1}. {product.product__name}</h5>
                                    <h5 className='text-xs text-text/70'>{formatProductCategories(product)}</h5>
                                </div>
                                <h5 className='text-text/70 font-semibold whitespace-nowrap'>{product.total_sold}</h5>
                            </div>
                        ))}
                        {(posDashboardData.top_selling_products || []).length === 0 && (
                            <h5 className='text-sm text-text/60 text-center py-6'>No products found for this category.</h5>
                        )}
                    </div>

                    <div className='flex justify-end'>
                        <Button variant='modalOutline' text='Close' onClick={() => setShowTopSellingModal(false)} />
                    </div>
                </Modal>
            )}

            {showLeastSellingModal && (
                <Modal title='Top 10 Least Selling Products' onClose={() => setShowLeastSellingModal(false)} className='w-[520px]'>
                    <div className='flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1'>
                        {(posDashboardData.least_selling_products || []).map((product, index) => (
                            <div key={`${product.product__name}-${index}`} className='flex items-center justify-between border border-border rounded-lg p-3 bg-main-white gap-2'>
                                <div>
                                    <h5 className='text-text font-medium'>{index + 1}. {product.product__name}</h5>
                                    <h5 className='text-xs text-text/70'>{formatProductCategories(product)}</h5>
                                </div>
                                <h5 className='text-text/70 font-semibold whitespace-nowrap'>{product.total_sold}</h5>
                            </div>
                        ))}
                        {(posDashboardData.least_selling_products || []).length === 0 && (
                            <h5 className='text-sm text-text/60 text-center py-6'>No products found for this category.</h5>
                        )}
                    </div>

                    <div className='flex justify-end'>
                        <Button variant='modalOutline' text='Close' onClick={() => setShowLeastSellingModal(false)} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Reports;
