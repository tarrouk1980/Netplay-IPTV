import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_W = width - 64;
const CHART_H = 160;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

function generatePriceHistory(basePrice, days = 30) {
  const now = new Date();
  const data = [];
  let price = basePrice;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    price = Math.max(basePrice * 0.7, Math.min(basePrice * 1.4,
      price * (1 + (Math.random() - 0.5) * 0.08)));
    data.push({ date: d.toISOString().split('T')[0], price: Math.round(price) });
  }
  return data;
}

function linePath(points) {
  if (!points.length) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

function areaPath(points, bottom) {
  if (!points.length) return '';
  return linePath(points) + ` L ${points[points.length - 1].x.toFixed(1)} ${bottom.toFixed(1)} L ${points[0].x.toFixed(1)} ${bottom.toFixed(1)} Z`;
}

export default function PriceHistoryChart({ basePrice = 300, currency = 'TND' }) {
  const [tooltip, setTooltip] = useState(null);
  const data = useMemo(() => generatePriceHistory(basePrice), [basePrice]);

  const prices = data.map(d => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const avgP = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const todayPrice = prices[prices.length - 1];
  const trend = todayPrice > avgP ? 'up' : 'down';

  const yScale = val => PAD_TOP + (1 - (val - minP) / (maxP - minP + 1)) * PLOT_H;
  const xScale = idx => PAD_LEFT + (idx / (data.length - 1)) * PLOT_W;

  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.price), ...d }));
  const bottomY = PAD_TOP + PLOT_H;

  const avgY = yScale(avgP);
  const todayX = xScale(data.length - 1);

  function handleChartPress(evt) {
    const touchX = evt.nativeEvent.locationX;
    const relX = touchX - PAD_LEFT;
    const idx = Math.round((relX / PLOT_W) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setTooltip(tooltip?.idx === clamped ? null : { idx: clamped, ...points[clamped] });
  }

  const yLabels = [minP, Math.round((minP + maxP) / 2), maxP];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des prix (30j)</Text>
        <View style={[styles.trendBadge, trend === 'down' ? styles.trendDown : styles.trendUp]}>
          <Ionicons name={trend === 'down' ? 'trending-down' : 'trending-up'} size={14} color={trend === 'down' ? '#276749' : '#C53030'} />
          <Text style={[styles.trendText, { color: trend === 'down' ? '#276749' : '#C53030' }]}>
            Prix en {trend === 'down' ? 'baisse ↓' : 'hausse ↑'}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Minimum</Text>
          <Text style={[styles.statValue, { color: '#276749' }]}>{minP} {currency}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Moyenne</Text>
          <Text style={styles.statValue}>{avgP} {currency}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Maximum</Text>
          <Text style={[styles.statValue, { color: '#C53030' }]}>{maxP} {currency}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
          <Text style={[styles.statValue, { color: '#FF6B35' }]}>{todayPrice} {currency}</Text>
        </View>
      </View>

      <View style={styles.chartWrap} onTouchEnd={handleChartPress}>
        <Svg width={CHART_W} height={CHART_H}>
          <Defs>
            <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FF6B35" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#FF6B35" stopOpacity="0.02" />
            </SvgGradient>
          </Defs>

          {/* Y-axis labels */}
          {yLabels.map((v, i) => {
            const y = yScale(v);
            return (
              <React.Fragment key={i}>
                <Line x1={PAD_LEFT} y1={y} x2={PAD_LEFT + PLOT_W} y2={y} stroke="#EDF2F7" strokeWidth={1} />
                <SvgText x={PAD_LEFT - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#A0AEC0">{v}</SvgText>
              </React.Fragment>
            );
          })}

          {/* X axis */}
          <Line x1={PAD_LEFT} y1={bottomY} x2={PAD_LEFT + PLOT_W} y2={bottomY} stroke="#EDF2F7" strokeWidth={1} />

          {/* Average dashed line */}
          <Line
            x1={PAD_LEFT} y1={avgY} x2={PAD_LEFT + PLOT_W} y2={avgY}
            stroke="#718096" strokeWidth={1} strokeDasharray="4,3"
          />
          <SvgText x={PAD_LEFT + PLOT_W + 4} y={avgY + 4} fontSize={8} fill="#718096">moy</SvgText>

          {/* Area fill */}
          <Path d={areaPath(points, bottomY)} fill="url(#areaGrad)" />

          {/* Line */}
          <Path d={linePath(points)} fill="none" stroke="#FF6B35" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* Today marker */}
          <Line x1={todayX} y1={PAD_TOP} x2={todayX} y2={bottomY} stroke="#004E89" strokeWidth={1.5} strokeDasharray="3,2" />
          <Circle cx={todayX} cy={points[points.length - 1].y} r={5} fill="#FF6B35" stroke="#fff" strokeWidth={2} />
          <SvgText x={todayX} y={bottomY + 12} textAnchor="middle" fontSize={9} fill="#004E89" fontWeight="bold">Auj.</SvgText>

          {/* Tooltip */}
          {tooltip && (
            <>
              <Line x1={tooltip.x} y1={PAD_TOP} x2={tooltip.x} y2={bottomY} stroke="#004E89" strokeWidth={1} strokeDasharray="2,2" strokeOpacity="0.6" />
              <Circle cx={tooltip.x} cy={tooltip.y} r={5} fill="#004E89" stroke="#fff" strokeWidth={2} />
              <Rect
                x={Math.min(tooltip.x - 32, PAD_LEFT + PLOT_W - 64)}
                y={tooltip.y - 32}
                width={64} height={24}
                rx={6} fill="#004E89"
              />
              <SvgText
                x={Math.min(tooltip.x, PAD_LEFT + PLOT_W - 32)}
                y={tooltip.y - 16}
                textAnchor="middle" fontSize={10} fill="#fff" fontWeight="bold"
              >
                {tooltip.price} {currency}
              </SvgText>
            </>
          )}
        </Svg>

        {tooltip && (
          <View style={[styles.tooltipDate, { left: Math.min(Math.max(tooltip.x - 28, 0), CHART_W - 70) }]}>
            <Text style={styles.tooltipDateText}>{tooltip.date?.slice(5)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.hint}>Appuyez sur le graphique pour voir le prix à une date précise</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  trendDown: { backgroundColor: '#F0FFF4' },
  trendUp: { backgroundColor: '#FFF5F5' },
  trendText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginBottom: 12, gap: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '800', color: '#1A202C' },
  chartWrap: { position: 'relative' },
  tooltipDate: { position: 'absolute', bottom: 0 },
  tooltipDateText: { fontSize: 9, color: '#718096', fontWeight: '600' },
  hint: { fontSize: 10, color: '#A0AEC0', textAlign: 'center', marginTop: 8 },
});
