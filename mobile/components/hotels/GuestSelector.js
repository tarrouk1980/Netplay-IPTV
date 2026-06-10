import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GuestSelector({ adults = 2, children = 0, onChange, visible, onClose }) {
  const [a, setA] = useState(adults);
  const [c, setC] = useState(children);

  function apply() {
    onChange && onChange({ adults: a, children: c });
    onClose && onClose();
  }

  function Counter({ label, value, onDec, onInc, min = 0 }) {
    return (
      <View style={styles.counterRow}>
        <View>
          <Text style={styles.counterLabel}>{label}</Text>
        </View>
        <View style={styles.counterControls}>
          <TouchableOpacity style={[styles.counterBtn, value <= min && styles.counterBtnDisabled]} onPress={onDec} disabled={value <= min}>
            <Ionicons name="remove" size={18} color={value <= min ? '#CBD5E0' : '#004E89'} />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{value}</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={onInc}>
            <Ionicons name="add" size={18} color="#004E89" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Voyageurs</Text>

          <Counter label="Adultes" value={a} onDec={() => setA(v => Math.max(1, v - 1))} onInc={() => setA(v => v + 1)} min={1} />
          <Counter label="Enfants (0–17 ans)" value={c} onDec={() => setC(v => Math.max(0, v - 1))} onInc={() => setC(v => v + 1)} min={0} />

          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyBtnText}>Confirmer · {a + c} voyageur{a + c > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A202C', marginBottom: 24 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  counterLabel: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#004E89', alignItems: 'center', justifyContent: 'center' },
  counterBtnDisabled: { borderColor: '#E2E8F0' },
  counterValue: { fontSize: 18, fontWeight: '800', color: '#1A202C', minWidth: 24, textAlign: 'center' },
  applyBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
