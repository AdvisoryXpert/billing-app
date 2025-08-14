// components/DashboardCharts.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { Invoice } from '../../src/api/invoices';
import type { Payment } from '../../src/api/payments';

type Series = { labels: string[]; paidAmt: number[]; issuedAmt: number[]; paymentsAmt: number[] };

export const DashboardCharts = React.memo(function DashboardCharts({
  invoices, payments, months = 6, title = 'Revenue • Invoices • Payments (last 6 months)',
  containerMaxWidth = 1200, shellPadding = 32, panelPadding = 32,
}: {
  invoices: Invoice[]; payments: Payment[]; months?: number; title?: string;
  containerMaxWidth?: number; shellPadding?: number; panelPadding?: number;
}) {
  const { width: winW } = useWindowDimensions();
  const fixedWidth = Math.max(320, Math.min(winW, containerMaxWidth) - (shellPadding + panelPadding));
  const chartHeight = 260;

  const series = useMemo<Series>(() => makeSeries(invoices, payments, months), [invoices, payments, months]);

  const COLORS = { paid: '#2563EB', issued: '#8B5CF6', pay: '#22C55E' };
  const data = useMemo(() => ({
    labels: series.labels,
    datasets: [
      { data: series.paidAmt,     color: (o=1)=>rgba(COLORS.paid,o),   strokeWidth: 3 },
      { data: series.issuedAmt,   color: (o=1)=>rgba(COLORS.issued,o), strokeWidth: 3 },
      { data: series.paymentsAmt, color: (o=1)=>rgba(COLORS.pay,o),    strokeWidth: 3 },
    ],
  }), [series]);

  const [tip, setTip] = useState<{x:number;y:number;value:number;label:string;color:string;visible:boolean}>({
    x:0,y:0,value:0,label:'',color:COLORS.paid,visible:false
  });

  const chartConfig = useMemo(() => ({
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (o=1) => `rgba(17,24,39,${o})`,
    labelColor: (o=1) => `rgba(55,65,81,${o})`,
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#fff' },
    propsForBackgroundLines: { strokeDasharray: '4 6' },
    useShadowColorFromDataset: false,
  }), []);

  // container is relative so we can absolutely-position the tooltip overlay
  return (
    <View style={[styles.panel, styles.shadow]}>
      <Text style={styles.panelTitle}>{title}</Text>

      <View style={{ position: 'relative', width: fixedWidth, height: chartHeight }}>
        <LineChart
          data={data}
          width={fixedWidth}
          height={chartHeight}
          yAxisLabel="₹"
          fromZero
          withDots
          withShadow
          withInnerLines
          withOuterLines={false}
          bezier={false}
          segments={4}
          formatYLabel={(y) => formatINRShort(Number(y))}
          chartConfig={chartConfig}
          style={{ borderRadius: 14, position: 'absolute', left: 0, top: 0 }}
          onDataPointClick={({ value, x, y, getColor, index }) => {
            const color = typeof getColor === 'function' ? getColor(1) : COLORS.paid;
            const label = data.labels[index] ?? '';
            // toggle if the same point is tapped twice
            setTip(prev =>
              prev.visible && Math.abs(prev.x - x) < 2 && Math.abs(prev.y - y) < 2
                ? { ...prev, visible: false }
                : { x, y, value: Number(value), label, color, visible: true }
            );
          }}
        />

        {/* ABSOLUTE HTML-like tooltip overlay (works on web + native) */}
        {tip.visible && (
          <View
            pointerEvents="none"
            style={[
              styles.tooltip,
              {
                left: clamp(tip.x - 44, 6, fixedWidth - 96),
                top: clamp(tip.y - 58, 6, chartHeight - 64),
                borderColor: tip.color,
              },
            ]}
          >
            <Text style={styles.tooltipValue}>{formatINR(tip.value)}</Text>
            <Text style={styles.tooltipLabel}>{tip.label}</Text>
            <View style={[styles.tooltipCaret, { borderTopColor: '#111827' }]} />
          </View>
        )}
      </View>

      <View style={styles.legendRow}>
        <Legend color={COLORS.paid}   label="Revenue (Paid)" />
        <Legend color={COLORS.issued} label="Invoices Issued" />
        <Legend color={COLORS.pay}    label="Payments" />
        <Text style={styles.hint}>Tap a point to see value</Text>
      </View>
    </View>
  );
});

/* ===== series, helpers & styles (unchanged from your version except for tooltip bits) ===== */

function makeSeries(invoices: any[], payments: any[], months = 6): Series {
  const now = new Date();
  const buckets = getLastNMonths(months, now);
  const byKey = Object.fromEntries(buckets.map(b => [b.key, { paidAmt: 0, issuedAmt: 0, paymentsAmt: 0 }]));
  for (const iv of invoices ?? []) {
    const key = ymKey(iv.invoice_date); if (!byKey[key]) continue;
    const total = toNum(iv.total);
    byKey[key].issuedAmt += total;
    if ((iv.status ?? '').toLowerCase() === 'paid') byKey[key].paidAmt += total;
  }
  for (const p of payments ?? []) {
    const d = (p as any).date || (p as any).paid_at || (p as any).created_at || '';
    const key = ymKey(String(d).slice(0,10)); if (!byKey[key]) continue;
    byKey[key].paymentsAmt += toNum((p as any).amount ?? (p as any).amount_paid ?? 0);
  }
  return {
    labels: buckets.map(b => b.label),
    paidAmt:     buckets.map(b => Math.round(byKey[b.key].paidAmt)),
    issuedAmt:   buckets.map(b => Math.round(byKey[b.key].issuedAmt)),
    paymentsAmt: buckets.map(b => Math.round(byKey[b.key].paymentsAmt)),
  };
}

function getLastNMonths(n: number, base = new Date()) {
  const arr: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    arr.push({ key: ymKey(d), label: d.toLocaleString('en-IN', { month: 'short' }) });
  }
  return arr;
}
function ymKey(d: Date | string) { const dt = typeof d === 'string' ? new Date(d) : d; const y = dt.getFullYear(); const m = String(dt.getMonth()+1).padStart(2,'0'); return `${y}-${m}`; }
function toNum(v:any){const n=typeof v==='number'?v:Number(v);return Number.isFinite(n)?n:0;}
function rgba(hex: string, a = 1) { const h = hex.replace('#',''); const r=h.length===3?parseInt(h[0]+h[0],16):parseInt(h.slice(0,2),16); const g=h.length===3?parseInt(h[1]+h[1],16):parseInt(h.slice(2,4),16); const b=h.length===3?parseInt(h[2]+h[2],16):parseInt(h.slice(4,6),16); return `rgba(${r},${g},${b},${a})`; }
function formatINR(n: number){ try{return new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(n);}catch{return String(Math.round(n));} }
function formatINRShort(n: number){ if(!Number.isFinite(n))return'0'; if(n>=1e7)return`${(n/1e7).toFixed(2)}Cr`; if(n>=1e5)return`${(n/1e5).toFixed(2)}L`; if(n>=1e3)return`${(n/1e3).toFixed(1)}k`; return formatINR(n); }
function clamp(v:number,min:number,max:number){return Math.max(min, Math.min(v,max));}

const styles = StyleSheet.create({
  panel: {
    backgroundColor:'#fff', borderRadius:14, padding:16, marginBottom:14,
    borderWidth:StyleSheet.hairlineWidth, borderColor:'#E6E8EC', width:'100%',
  },
  panelTitle:{ fontSize:16, fontWeight:'800', marginBottom:12, color:'#111827' },
  legendRow:{ flexDirection:'row', alignItems:'center', marginTop:8, flexWrap:'wrap' },
  hint:{ marginLeft:'auto', color:'#6B7280', fontSize:12 },

  // Tooltip overlay
  tooltip:{
    position:'absolute',
    backgroundColor:'#111827',
    borderRadius:8,
    paddingHorizontal:8,
    paddingVertical:6,
    borderWidth:1,
  },
  tooltipValue:{ color:'#fff', fontWeight:'800', fontSize:12 },
  tooltipLabel:{ color:'#CBD5E1', fontSize:10, marginTop:2 },
  tooltipCaret:{
    position:'absolute', left:40, bottom:-6, width:0, height:0,
    borderLeftWidth:6, borderRightWidth:6, borderTopWidth:6,
    borderLeftColor:'transparent', borderRightColor:'transparent',
  },

  shadow: Platform.select({
    web:   { boxShadow:'0 6px 24px rgba(0,0,0,0.06)' } as any,
    default:{ elevation:2 },
  }),
});

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', marginRight:12, marginTop:4 }}>
      <View style={{ width:10, height:10, borderRadius:10, backgroundColor:color, marginRight:6 }} />
      <Text style={{ color:'#374151', fontWeight:'600' }}>{label}</Text>
    </View>
  );
}
