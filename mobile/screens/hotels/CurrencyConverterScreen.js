import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native';

const CURRENCIES = ['TND', 'MAD', 'DZD', 'EUR', 'USD'];

const CURRENCY_NAMES = {
  TND: 'Dinar Tunisien',
  MAD: 'Dirham Marocain',
  DZD: 'Dinar Algérien',
  EUR: 'Euro',
  USD: 'Dollar Américain',
};

const CURRENCY_FLAGS = {
  TND: '🇹🇳',
  MAD: '🇲🇦',
  DZD: '🇩🇿',
  EUR: '🇪🇺',
  USD: '🇺🇸',
};

// Taux de change (base TND)
const RATES_FROM_TND = {
  TND: 1,
  MAD: 3.50,
  DZD: 40.0,
  EUR: 0.30,
  USD: 0.32,
};

function convert(amount, from, to) {
  if (!amount || isNaN(parseFloat(amount))) return '';
  const amountNum = parseFloat(amount);
  const inTND = amountNum / RATES_FROM_TND[from];
  const result = inTND * RATES_FROM_TND[to];
  return result.toFixed(2);
}

function getRate(from, to) {
  return (RATES_FROM_TND[to] / RATES_FROM_TND[from]).toFixed(4);
}

const LAST_UPDATE = '10 juin 2026 — 09:00';

export default function CurrencyConverterScreen({ navigation }) {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('TND');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const converted = convert(amount, fromCurrency, toCurrency);

  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Convertisseur de devises</Text>
          <Text style={styles.headerSub}>Maghreb • Europe • Monde</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Carte principale */}
        <View style={styles.card}>
          {/* Montant */}
          <Text style={styles.label}>Montant</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="Entrez un montant"
            placeholderTextColor="#555"
          />

          {/* Devise source */}
          <Text style={styles.label}>De</Text>
          <TouchableOpacity
            style={styles.currencySelector}
            onPress={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}
          >
            <Text style={styles.currencyFlag}>{CURRENCY_FLAGS[fromCurrency]}</Text>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{fromCurrency}</Text>
              <Text style={styles.currencyName}>{CURRENCY_NAMES[fromCurrency]}</Text>
            </View>
            <Text style={styles.chevron}>{showFromPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showFromPicker && (
            <View style={styles.picker}>
              {CURRENCIES.filter(c => c !== fromCurrency).map(c => (
                <TouchableOpacity
                  key={c}
                  style={styles.pickerItem}
                  onPress={() => { setFromCurrency(c); setShowFromPicker(false); }}
                >
                  <Text style={styles.pickerFlag}>{CURRENCY_FLAGS[c]}</Text>
                  <Text style={styles.pickerCode}>{c}</Text>
                  <Text style={styles.pickerName}>{CURRENCY_NAMES[c]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Bouton swap */}
          <TouchableOpacity style={styles.swapBtn} onPress={swapCurrencies}>
            <Text style={styles.swapText}>⇅ Inverser</Text>
          </TouchableOpacity>

          {/* Devise cible */}
          <Text style={styles.label}>Vers</Text>
          <TouchableOpacity
            style={styles.currencySelector}
            onPress={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}
          >
            <Text style={styles.currencyFlag}>{CURRENCY_FLAGS[toCurrency]}</Text>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{toCurrency}</Text>
              <Text style={styles.currencyName}>{CURRENCY_NAMES[toCurrency]}</Text>
            </View>
            <Text style={styles.chevron}>{showToPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showToPicker && (
            <View style={styles.picker}>
              {CURRENCIES.filter(c => c !== toCurrency).map(c => (
                <TouchableOpacity
                  key={c}
                  style={styles.pickerItem}
                  onPress={() => { setToCurrency(c); setShowToPicker(false); }}
                >
                  <Text style={styles.pickerFlag}>{CURRENCY_FLAGS[c]}</Text>
                  <Text style={styles.pickerCode}>{c}</Text>
                  <Text style={styles.pickerName}>{CURRENCY_NAMES[c]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Résultat */}
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Résultat</Text>
            <Text style={styles.resultValue}>
              {converted ? `${converted} ${toCurrency}` : '—'}
            </Text>
            <Text style={styles.resultRate}>
              1 {fromCurrency} = {getRate(fromCurrency, toCurrency)} {toCurrency}
            </Text>
          </View>

          {/* Dernière mise à jour */}
          <Text style={styles.updateText}>Dernière mise à jour : {LAST_UPDATE}</Text>
        </View>

        {/* Contexte voyageur */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Exemples utiles</Text>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleIcon}>🏖</Text>
            <View>
              <Text style={styles.exampleLabel}>1 nuit à Djerba</Text>
              <Text style={styles.exampleValue}>250 TND = {convert('250', 'TND', 'EUR')} EUR = {convert('250', 'TND', 'USD')} USD</Text>
            </View>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleIcon}>🕌</Text>
            <View>
              <Text style={styles.exampleLabel}>1 nuit à Marrakech</Text>
              <Text style={styles.exampleValue}>875 MAD = {convert('875', 'MAD', 'TND')} TND = {convert('875', 'MAD', 'EUR')} EUR</Text>
            </View>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleIcon}>🌊</Text>
            <View>
              <Text style={styles.exampleLabel}>1 nuit à Alger</Text>
              <Text style={styles.exampleValue}>12 000 DZD = {convert('12000', 'DZD', 'TND')} TND = {convert('12000', 'DZD', 'EUR')} EUR</Text>
            </View>
          </View>
        </View>

        {/* Tableau des taux */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tableau de tous les taux</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>De / Vers</Text>
            {CURRENCIES.map(c => (
              <Text key={c} style={[styles.tableCell, styles.tableCellHeader]}>{c}</Text>
            ))}
          </View>
          {CURRENCIES.map(from => (
            <View key={from} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellRowHeader]}>
                {CURRENCY_FLAGS[from]} {from}
              </Text>
              {CURRENCIES.map(to => (
                <Text key={to} style={[styles.tableCell, from === to && styles.tableCellSame]}>
                  {from === to ? '—' : getRate(from, to)}
                </Text>
              ))}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#111118',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  label: {
    color: '#8E8E9A',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#333',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  currencyName: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 1,
  },
  chevron: {
    color: '#8E8E9A',
    fontSize: 12,
  },
  picker: {
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  pickerFlag: {
    fontSize: 20,
    marginRight: 10,
  },
  pickerCode: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    width: 40,
  },
  pickerName: {
    color: '#8E8E9A',
    fontSize: 12,
  },
  swapBtn: {
    alignSelf: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 8,
  },
  swapText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  resultBox: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  resultLabel: {
    color: '#8E8E9A',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    color: '#27AE60',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  resultRate: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 4,
  },
  updateText: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  exampleIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  exampleLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  exampleValue: {
    color: '#8E8E9A',
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  tableCell: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellHeader: {
    color: '#8E8E9A',
    fontWeight: '700',
    fontSize: 10,
  },
  tableCellRowHeader: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'left',
  },
  tableCellSame: {
    color: '#333',
  },
});
