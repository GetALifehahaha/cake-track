"use client"

import { useSearchParams } from "react-router-dom"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
	ChartTooltipContent,
} from "@/components/ui/chart"

const RevenueChart = ({ chartData }) => {
	const [searchParams] = useSearchParams();
	const frequency = searchParams.get('frequency') || 'daily';

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

	const formatCurrency = (value) => {
		return `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
	};

	return (
		<Card className="border-none bg-main-white shadow-md">
			<CardHeader className="flex flex-row justify-between items-center">
				<CardTitle>Revenue Trend</CardTitle>
				<span className="text-xs font-semibold text-accent-mute capitalize">{frequency}</span>
			</CardHeader>

			<CardContent>
				<ChartContainer>
					<AreaChart
						accessibilityLayer
						data={chartData}
						margin={{
							top: 24,
							left: 24,
							right: 24,
						}}
					>
						<defs>
							<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-accent-mute)" stopOpacity={0.3} />
								<stop offset="95%" stopColor="var(--color-accent-mute)" stopOpacity={0} />
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
						<YAxis
							tickFormatter={formatCurrency}
							tick={{ fontSize: 11 }}
							axisLine={false}
							tickLine={false}
							width={70}
						/>

						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									indicator="line"
									nameKey="amount"
									hideLabel
									formatter={(value) => `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
								/>
							}
						/>

						<Area
							dataKey="amount"
							type="natural"
							stroke="var(--color-accent-mute)"
							strokeWidth={2}
							fill="url(#revenueGradient)"
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
	)
}

export default RevenueChart
