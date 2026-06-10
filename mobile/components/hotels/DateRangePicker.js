import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // Monday=0
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

export default function DateRangePicker({ checkIn, checkOut, onChange, visible, onClose }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState('in'); // 'in' | 'out'
  const [tempIn, setTempIn] = useState(checkIn || toDateStr(today));
  const [tempOut, setTempOut] = useState(checkOut || toDateStr(new Date(Date.now() + 86400000)));

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function selectDate(day) {
    const d = new Date(year, month, day);
    if (d < today) return;
    const str = toDateStr(d);
    if (selecting === 'in') {
      setTempIn(str);
      const out = new Date(d);
      out.setDate(out.getDate() + 1);
      setTempOut(toDateStr(out));
      setSelecting('out');
    } else {
      if (str <= tempIn) {
        setTempOut(tempIn);
        setTempIn(str);
      } else {
        setTempOut(str);
      }
      setSelecting('in');
    }
  }

  function apply() {
    onChange && onChange({ checkIn: tempIn, checkOut: tempOut });
    onClose && onClose();
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  function getDateStyle(day) {
    if (!day) return {};
    const str = toDateStr(new Date(year, month, day));
    const isIn = str === tempIn;
    const isOut = str === tempOut;
    const inRange = str > tempIn && str < tempOut;
    const isPast = new Date(year, month, day) < today;
    return { isIn, isOut, inRange, isPast };
  }

  const nights = tempIn && tempOut ? Math.max(1, Math.round((new Date(tempOut) - new Date(tempIn)) / 86400000)) : 1;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Selector tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, selecting === 'in' && styles.tabActive]} onPress={() => setSelecting('in')}>
              <Text style={styles.tabLabel}>ARRIVÉE</Text>
              <Text style={[styles.tabDate, selecting === 'in' && styles.tabDateActive]}>{new Date(tempIn).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</Text>
            </TouchableOpacity>
            <View style={styles.tabDivider}>
              <Ionicons name="arrow-forward" size={16} color="#A0AEC0" />
              <Text style={styles.tabNights}>{nights} nuit{nights > 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity style={[styles.tab, selecting === 'out' && styles.tabActive]} onPress={() => setSelecting('out')}>
              <Text style={styles.tabLabel}>DÉPART</Text>
              <Text style={[styles.tabDate, selecting === 'out' && styles.tabDateActive]}>{new Date(tempOut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</Text>
            </TouchableOpacity>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color="#004E89" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color="#004E89" />
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
          </View>

          {/* Calendar grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              const { isIn, isOut, inRange, isPast } = getDateStyle(day);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.cell, inRange && styles.cellRange, (isIn || isOut) && styles.cellSelected, isPast && styles.cellPast]}
                  onPress={() => day && !isPast && selectDate(day)}
                  disabled={!day || isPast}
                >
                  {day ? <Text style={[styles.cellText, (isIn || isOut) && styles.cellTextSelected, isPast && styles.cellTextPast]}>{day}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyBtnText}>Confirmer les dates</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tab: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0' },
  tabActive: { borderColor: '#FF6B35', backgroundColor: '#FFF5F0' },
  tabLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '700', letterSpacing: 0.5 },
  tabDate: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginTop: 4 },
  tabDateActive: { color: '#FF6B35' },
  tabDivider: { alignItems: 'center', paddingHorizontal: 10, gap: 3 },
  tabNights: { fontSize: 11, color: '#718096' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { padding: 8, backgroundColor: '#F7FAFC', borderRadius: 10 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, color: '#A0AEC0', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  cellRange: { backgroundColor: '#FFF5F0', borderRadius: 0 },
  cellSelected: { backgroundColor: '#FF6B35', borderRadius: 20 },
  cellPast: { opacity: 0.3 },
  cellText: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  cellTextSelected: { color: '#fff', fontWeight: '800' },
  cellTextPast: { color: '#A0AEC0' },
  applyBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
