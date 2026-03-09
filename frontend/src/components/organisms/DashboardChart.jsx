"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { CartesianGrid, Dot, Line, LineChart, XAxis } from "recharts"
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
	ChartTooltipContent,
} from "@/components/ui/chart"

import { Button } from "@/components/atoms"

const DashboardChart = ({chartData}) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [frequency, setFrequency] = useState("daily")
	

	const handleFrequency = (value) => {
		setFrequency(value)
	}

	useEffect(() => {
        const params = new URLSearchParams(searchParams);

        params.set('frequency', frequency);

        setSearchParams(params);
	}, [frequency])

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

	return (
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
					<LineChart
						accessibilityLayer
						data={chartData}
						margin={{
							top: 24,
							left: 24,
							right: 24,
						}}
					>
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
							content={
								<ChartTooltipContent
									indicator="line"
									nameKey="amount"
									hideLabel
								/>
							}
						/>

						<Line
							dataKey="amount"
							type="natural"
							stroke="var(--color-accent-mute)"
							strokeWidth={2}
							dot={({ payload, ...props }) => (
								<Dot
									r={5}
									cx={props.cx}
									cy={props.cy}
									fill={payload.fill}
									stroke={payload.fill}
								/>
							)}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>

			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 leading-none font-semibold text-center mx-auto text-accent-text">
					Products Sold
				</div>
			</CardFooter>
		</Card>
	)
}

export default DashboardChart