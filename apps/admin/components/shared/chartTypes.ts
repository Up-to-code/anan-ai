export type ChartDatum = Record<string, number | string>;

export type ChartSeries = {
  dataKey: string;
  label: string;
  color: string;
};

export function formatChartNumber(value: number | string) {
  const numericValue = Number(value ?? 0);
  return new Intl.NumberFormat("ar-SA").format(numericValue);
}
