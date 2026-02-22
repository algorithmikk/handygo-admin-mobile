import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Phone, Mail } from 'lucide-react-native';
import { MOCK_TENANTS } from '@/src/lib/mockData';
import { Colors } from '@/constants/Colors';
import type { Tenant } from '@/src/types';

export default function TenantsScreen() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    // Will integrate with real API later
    setTenants(MOCK_TENANTS);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadTenants(); setRefreshing(false); }, []);

  const filtered = tenants.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.propertyAddress || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tenants.title')}</Text>
        <Text style={styles.headerCount}>{tenants.length} tenants</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={Colors.gray[400]} />
        <TextInput style={styles.searchInput} placeholder={t('tenants.search')} placeholderTextColor={Colors.gray[500]}
          value={search} onChangeText={setSearch} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary[500]} /></View>
      ) : (
        <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[400]} />}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>{t('tenants.noTenants')}</Text>
          ) : (
            filtered.map(tenant => (
              <View key={tenant.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{tenant.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{tenant.name}</Text>
                    {tenant.unit && <Text style={styles.unit}>Unit {tenant.unit}</Text>}
                  </View>
                </View>
                <View style={styles.addressRow}>
                  <MapPin size={14} color={Colors.gray[500]} />
                  <Text style={styles.addressText}>{tenant.propertyAddress}</Text>
                </View>
                <View style={styles.contactRow}>
                  <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${tenant.phone}`)}>
                    <Phone size={14} color={Colors.primary[400]} />
                    <Text style={styles.contactText}>{tenant.phone}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`mailto:${tenant.email}`)}>
                    <Mail size={14} color={Colors.blue[400]} />
                    <Text style={styles.contactText}>{tenant.email}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate[900] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.white },
  headerCount: { fontSize: 13, color: Colors.gray[400] },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 14, height: 44, backgroundColor: Colors.slate[800], borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[700], gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.white },
  list: { flex: 1 },
  emptyText: { fontSize: 15, color: Colors.gray[500], textAlign: 'center', paddingVertical: 48 },
  card: { marginHorizontal: 20, marginBottom: 10, padding: 16, backgroundColor: Colors.slate[800], borderRadius: 14, borderWidth: 1, borderColor: Colors.gray[700] },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.blue[500] + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: Colors.blue[400] },
  name: { fontSize: 16, fontWeight: '600', color: Colors.white },
  unit: { fontSize: 12, color: Colors.gray[400], marginTop: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  addressText: { fontSize: 13, color: Colors.gray[400], flex: 1 },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: Colors.slate[700], borderRadius: 8, flex: 1 },
  contactText: { fontSize: 11, color: Colors.gray[300], flex: 1 },
});

