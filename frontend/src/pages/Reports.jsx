import React from 'react';
import { XCircle } from 'lucide-react';
import useDashboard from '@/hooks/useDashboard';
import Loading from '@/components/molecules/Loading';
import { DashboardChart } from '@/components/organisms';

const Reports = () => {

    const {dashboardData, dashboardLoading, dashboardError} = useDashboard();

    if (dashboardLoading) return <Loading />
    if (dashboardError) return <h5>Error...</h5>

    const topSellingProducts = dashboardData.top_selling_products.map((item, index) => (
                    <div className='flex w-80 gap-4 p-2.5 rounded-sm bg-main-white shadow-sm border border-main-dark' key={index}>
                        <div className='w-8 h-8 font-semibold rounded-full aspect-square flex justify-center items-center bg-accent-mute text-white '><h5>{index + 1}</h5></div>
                        <div className='text-sm'>
                            <h5 className='font-semibold'>{item.product__name}</h5>
                            <h5 className='text-xs text-text-light'>{item.total_sold} units sold</h5>
                        </div>
                    </div>
                ))

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
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
            <div className='h-20'/>
        </div>
    )
};

export default Reports;