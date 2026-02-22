import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search, Star, Phone, CheckCircle, XCircle } from 'lucide-react-native';
import { handymanService } from '@/src/services/handymanService';
import { getCategoryInfo } from '@/src/lib/mockData';
import { Colors } from '@/constants/Colors';
import type { Handyman } from '@/src/types';

export default function HandymenScreen() {
  const { t } = useTranslation();
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [search, setSearch] = useState('');
  const [showOnline, setShowOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHandymen(); }, []);

  const loadHandymen = async () => {
    try {
      const data = await handymanService.getHandymen();
      setHandymen(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadHandymen(); setRefreshing(false); }, []);

  const filtered = handymen.filter(h => {
    if (showOnline && !h.available) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onlineCount = handymen.filter(h => h.available).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('handymen.title')}</Text>
        <Text style={styles.headerCount}>{onlineCount}/{handymen.length} online</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={Colors.gray[400]} />
        <TextInput style={styles.searchInput} placeholder={t('handymen.search')} placeholderTextColor={Colors.gray[500]}
          value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleChip, !showOnline && styles.toggleActive]} onPress={() => setShowOnline(false)}>
          <Text style={[styles.toggleText, !showOnline && styles.toggleTextActive]}>All ({handymen.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleChip, showOnline && styles.toggleActive]} onPress={() => setShowOnline(true)}>
          <Text style={[styles.toggleText, showOnline && styles.toggleTextActive]}>{t('handymen.online')} ({onlineCount})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary[500]} /></View>
      ) : (
        <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[400]} />}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>{t('handymen.noHandymen')}</Text>
          ) : (
            filtered.map(h => (
              <TouchableOpacity key={h.id} style={styles.card} onPress={() => router.push(`/handyman/${h.id}`)}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{h.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{h.name}</Text>
                      {h.available ?
                        <View style={styles.onlineDot}><CheckCircle size={14} color={Colors.primary[400]} /></View> :
                        <View style={styles.offlineDot}><XCircle size={14} color={Colors.gray[500]} /></View>
                      }
                    </View>
                    <View style={styles.ratingRow}>
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <Text style={styles.ratingText}>{h.rating}</Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.jobsText}>{h.completedJobs} jobs</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.phoneBtn} onPress={() => {}}>
                    <Phone size={16} color={Colors.primary[400]} />
                  </TouchableOpacity>
                </View>
                <View style={styles.services}>
                  {h.services.map(s => {
                    const cat = getCategoryInfo(s);
                    return (
                      <View key={s} style={[styles.serviceChip, { borderColor: (cat?.color || '#666') + '40' }]}>
                        <Text style={styles.serviceIcon}>{cat?.icon}</Text>
                        <Text style={styles.serviceLabel}>{cat?.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
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
  headerCount: { fontSize: 13, color: Colors.primary[400] },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14, height: 44, backgroundColor: Colors.slate[800], borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[700], gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.white },
  toggleRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 8 },
  toggleChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.slate[800], borderWidth: 1, borderColor: Colors.gray[700] },
  toggleActive: { backgroundColor: Colors.primary[500] + '20', borderColor: Colors.primary[500] },
  toggleText: { fontSize: 13, color: Colors.gray[400], fontWeight: '500' },
  toggleTextActive: { color: Colors.primary[400] },
  list: { flex: 1 },
  emptyText: { fontSize: 15, color: Colors.gray[500], textAlign: 'center', paddingVertical: 48 },
  card: { marginHorizontal: 20, marginBottom: 10, padding: 14, backgroundColor: Colors.slate[800], borderRadius: 14, borderWidth: 1, borderColor: Colors.gray[700] },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary[400] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.white },
  onlineDot: {},
  offlineDot: {},
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 12, color: Colors.gray[400] },
  dot: { color: Colors.gray[500] },
  jobsText: { fontSize: 12, color: Colors.gray[400] },
  phoneBtn: { padding: 10, backgroundColor: Colors.primary[500] + '15', borderRadius: 10 },
  services: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  serviceChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.slate[700], borderWidth: 1 },
  serviceIcon: { fontSize: 14 },
  serviceLabel: { fontSize: 11, color: Colors.gray[300] },
});

