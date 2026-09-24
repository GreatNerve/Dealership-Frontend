import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type Props = {
  data: Array<Record<string, string | number>>
  config: ChartConfig
  keys: string[]
}

export function DashboardWeekChart({ data, config, keys }: Props) {
  const max = useMemo(() => {
    let n = 1
    for (const row of data) {
      for (const key of keys) {
        const v = row[key]
        if (typeof v === 'number' && v > n) n = v
      }
    }
    return n
  }, [data, keys])

  return (
    <ChartContainer config={config} className="aspect-auto h-52 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="18%">
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          className="text-[11px]"
        />
        <YAxis
          allowDecimals={false}
          domain={[0, max]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={32}
          className="text-[11px]"
        />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
          content={<ChartTooltipContent />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        {keys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
