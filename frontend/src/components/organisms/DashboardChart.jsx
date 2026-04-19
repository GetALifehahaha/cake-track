"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { cn } from "@/lib/utils"

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import {
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart"

import { Button } from "@/components/atoms"

const DashboardChart = ({ salesData = [], revenueData = [], cakeRevenueData = [] }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [frequency, setFrequency] = useState(searchParams.get("frequency") || "daily")

	const handleFrequency = (value) => {
		setFrequency(value)
	}

	useEffect(() => {
		const params = new URLSearchParams(searchParams);
		if ((params.get("frequency") || "daily") !== frequency) {
			params.set("frequency", frequency);
			setSearchParams(params);
		}
	}, [frequency, searchParams, setSearchParams])

	const formatXAxis = (value) => {
		const d = new Date(value);

		if (frequency === "daily") {
			return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
		}

		if (frequency === "weekly") {
			return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
		}

		if (frequency === "monthly") {
			return d.toLocaleDateString(undefined, { month: "short" });
		}

		return value;
	};

	const formatTooltipDate = (value) => {
		if (!value) return "";

		const raw = String(value);
		const dateOnly = raw.includes("T") ? raw.split("T")[0] : raw;
		const date = new Date(dateOnly);

		if (Number.isNaN(date.getTime())) {
			const fallback = new Date(raw);
			if (Number.isNaN(fallback.getTime())) return dateOnly;
			return fallback.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
		}

		return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
	};

	const SalesTrendTooltip = ({ active, payload }) => {
		if (!active || !payload?.length) return null;
		const point = payload[0]?.payload || {};
		const topProducts = Array.isArray(point.top_products) ? point.top_products.slice(0, 3) : [];

		return (
			<div className="border-border/50 bg-background grid min-w-56 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
				<div className="grid gap-1">
					<span className="text-muted-foreground">Date: <strong>{formatTooltipDate(point.period)}</strong></span>
					{topProducts.length > 0 ? (
						<>
							<span className="text-muted-foreground">Top 3 Products:</span>
							{topProducts.map((product, index) => (
								<span key={`${product.product__name}-${index}`} className="text-muted-foreground">
									<strong>{index + 1}.</strong> {product.product__name} ({product.total_sold})
								</span>
							))}
						</>
					) : (
						<span className="text-muted-foreground">Top 3 Products: <strong>No sales</strong></span>
					)}
				</div>
			</div>
		);
	};

	const RevenueTrendTooltip = ({ active, payload, metricLabel = "Revenue" }) => {
		if (!active || !payload?.length) return null;
		const point = payload[0]?.payload || {};
		const revenue = Number(point.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

		return (
			<div className="border-border/50 bg-background grid min-w-56 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
				<div className="grid gap-1">
					<span className="text-muted-foreground">Date: <strong>{formatTooltipDate(point.period)}</strong></span>
					<span className="text-muted-foreground">{metricLabel}: <strong>₱{revenue}</strong></span>
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Products Sold Trend */}
				<Card className="border-none bg-main-white shadow-md">
				<CardHeader className="flex flex-row justify-between items-center">
					<CardTitle>Products Sold Trend</CardTitle>

					{/* Frequency Toggle */}
					<div className="flex gap-2">
						<Button
							text="Daily"
							onClick={() => handleFrequency("daily")}
							className={cn(
								"rounded-sm text-xs font-semibold py-2 px-4 bg-white text-accent-mute shadow-md border-none",
								frequency === "daily" && "bg-accent text-white"
							)}
						/>

						<Button
							text="Weekly"
							onClick={() => handleFrequency("weekly")}
							className={cn(
								"rounded-sm text-xs font-semibold py-2 px-4 bg-white text-accent-mute shadow-md border-none",
								frequency === "weekly" && "bg-accent text-white"
							)}
						/>

						<Button
							text="Monthly"
							onClick={() => handleFrequency("monthly")}
							className={cn(
								"rounded-sm text-xs font-semibold py-2 px-4 bg-white text-accent-mute shadow-md border-none",
								frequency === "monthly" && "bg-accent text-white"
							)}
						/>
					</div>
				</CardHeader>

				<CardContent>
					<ChartContainer>
						<AreaChart
							accessibilityLayer
							data={salesData}
							margin={{
								top: 24,
								left: 24,
								right: 24,
							}}
						>
							<defs>
								<linearGradient id="salesAreaFill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-accent-mute)" stopOpacity={0.35} />
									<stop offset="95%" stopColor="var(--color-accent-mute)" stopOpacity={0.03} />
								</linearGradient>
							</defs>

							<CartesianGrid vertical={true} />
							<XAxis
								dataKey="period"
								tickFormatter={formatXAxis}
								tick={{ fontSize: 12 }}
								axisLine={false}
								tickLine={false}
							/>

							<ChartTooltip
								cursor={false}
								content={<SalesTrendTooltip />}
							/>

							<Area
								dataKey="amount"
								type="monotone"
									strokeWidth={2.2}
									fill="url(#salesAreaFill)"
									activeDot={{ r: 4 }}
								stroke="var(--color-accent-mute)"
							/>
						</AreaChart>
					</ChartContainer>
				</CardContent>

				<CardFooter className="flex-col items-start gap-2 text-sm">
					<div className="flex gap-2 leading-none font-semibold text-center mx-auto text-accent-text">
						Products Sold
					</div>
				</CardFooter>
				</Card>

				{/* Revenue Trend */}
				<Card className="border-none bg-main-white shadow-md">
				<CardHeader className="flex flex-row justify-between items-center">
					<CardTitle>Revenue Trend</CardTitle>
					<span className="text-xs font-semibold text-accent-mute capitalize">{frequency}</span>
				</CardHeader>

				<CardContent>
					<ChartContainer>
						<AreaChart
							accessibilityLayer
							data={revenueData}
							margin={{
								top: 24,
								left: 24,
								right: 24,
							}}
						>
							<defs>
								<linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-accent-mute)" stopOpacity={0.35} />
									<stop offset="95%" stopColor="var(--color-accent-mute)" stopOpacity={0.03} />
								</linearGradient>
							</defs>

							<CartesianGrid vertical={true} />
							<XAxis
								dataKey="period"
								tickFormatter={formatXAxis}
								tick={{ fontSize: 12 }}
								axisLine={false}
								tickLine={false}
							/>

							<ChartTooltip
								cursor={false}
								content={<RevenueTrendTooltip metricLabel="Revenue" />}
							/>

							<Area
								dataKey="amount"
								type="monotone"
								strokeWidth={2.2}
								fill="url(#revenueAreaFill)"
								activeDot={{ r: 4 }}
								stroke="var(--color-accent-mute)"
							/>
						</AreaChart>
					</ChartContainer>
				</CardContent>

				<CardFooter className="flex-col items-start gap-2 text-sm">
					<div className="flex gap-2 leading-none font-semibold text-center mx-auto text-accent-text">
						Revenue (₱)
					</div>
				</CardFooter>
				</Card>
			</div>

			{/* Cake Revenue Trend */}
			<Card className="border-none bg-main-white shadow-md">
				<CardHeader className="flex flex-row justify-between items-center">
					<CardTitle>Cake Revenue Trend</CardTitle>
					<span className="text-xs font-semibold text-accent-mute capitalize">{frequency}</span>
				</CardHeader>

				<CardContent>
					<ChartContainer className="aspect-32/9">
						<AreaChart
							accessibilityLayer
							data={cakeRevenueData}
							margin={{
								top: 24,
								left: 24,
								right: 24,
							}}
						>
							<defs>
								<linearGradient id="cakeRevenueAreaFill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-accent-mute)" stopOpacity={0.35} />
									<stop offset="95%" stopColor="var(--color-accent-mute)" stopOpacity={0.03} />
								</linearGradient>
							</defs>

							<CartesianGrid vertical={true} />
							<XAxis
								dataKey="period"
								tickFormatter={formatXAxis}
								tick={{ fontSize: 12 }}
								axisLine={false}
								tickLine={false}
							/>

							<ChartTooltip
								cursor={false}
								content={<RevenueTrendTooltip metricLabel="Cake Revenue" />}
							/>

							<Area
								dataKey="amount"
								type="monotone"
								strokeWidth={2.2}
								fill="url(#cakeRevenueAreaFill)"
								activeDot={{ r: 4 }}
								stroke="var(--color-accent-mute)"
							/>
						</AreaChart>
					</ChartContainer>
				</CardContent>

				<CardFooter className="flex-col items-start gap-2 text-sm">
					<div className="flex gap-2 leading-none font-semibold text-center mx-auto text-accent-text">
						Cake Revenue (₱)
					</div>
				</CardFooter>
			</Card>
		</div>
	)
}

export default DashboardChart