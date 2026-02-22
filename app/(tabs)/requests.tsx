import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Clock, AlertTriangle } from 'lucide-react-native';
import { requestService } from '@/src/services/requestService';
import { getCategoryInfo, PRIORITY_COLORS, STATUS_COLORS } from '@/src/lib/mockData';
import { Colors } from '@/constants/Colors';
import type { MaintenanceRequest, RequestStatus } from '@/src/types';

const FILTERS: { key: RequestStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

export default function RequestsScreen() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, [filter]);

  const loadRequests = async () => {
    try {
      const data = await requestService.getRequests(filter === 'all' ? undefined : filter);
      setRequests(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadRequests(); setRefreshing(false); }, [filter]);

  const filtered = requests.filter(r =>
    !search || r.description.toLowerCase().includes(search.toLowerCase()) || r.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('requests.title')}</Text>
        <Text style={styles.headerCount}>{filtered.length} requests</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color={Colors.gray[400]} />
        <TextInput style={styles.searchInput} placeholder={t('requests.search')} placeholderTextColor={Colors.gray[500]}
          value={search} onChangeText={setSearch} />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersContent}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterActive]} onPress={() => { setFilter(f.key); setLoading(true); }}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary[500]} /></View>
      ) : (
        <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[400]} />}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <AlertTriangle size={32} color={Colors.gray[600]} />
              <Text style={styles.emptyText}>{t('requests.noRequests')}</Text>
            </View>
          ) : (
            filtered.map(req => {
              const cat = getCategoryInfo(req.category);
              return (
                <TouchableOpacity key={req.id} style={styles.card} onPress={() => router.push(`/request/${req.id}`)}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.catIcon}>{cat?.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{req.description}</Text>
                        <Text style={styles.cardTenant}>{req.tenantName}</Text>
                      </View>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: (PRIORITY_COLORS[req.priority] || '#666') + '20' }]}>
                      <Text style={[styles.priorityText, { color: PRIORITY_COLORS[req.priority] || '#666' }]}>{req.priority}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottom}>
                    <View style={styles.cardMeta}>
                      <MapPin size={12} color={Colors.gray[500]} />
                      <Text style={styles.metaText} numberOfLines={1}>{(req.propertyAddress || 'No address').split(',')[0]}</Text>
                    </View>
                    <View style={styles.cardMeta}>
                      <Clock size={12} color={Colors.gray[500]} />
                      <Text style={styles.metaText}>{timeAgo(req.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[req.status] || '#666') + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[req.status] || '#666' }]}>{req.status.replace('_', ' ')}</Text>
                    </View>
                  </View>
                  {req.assignedHandymanName && (
                    <Text style={styles.assignedText}>→ {req.assignedHandymanName}</Text>
                  )}
                </TouchableOpacity>
              );
            })
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
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14, height: 44, backgroundColor: Colors.slate[800], borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[700], gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.white },
  filtersRow: { maxHeight: 44, marginBottom: 12 },
  filtersContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.slate[800], borderWidth: 1, borderColor: Colors.gray[700] },
  filterActive: { backgroundColor: Colors.primary[500] + '20', borderColor: Colors.primary[500] },
  filterText: { fontSize: 13, color: Colors.gray[400], fontWeight: '500' },
  filterTextActive: { color: Colors.primary[400] },
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.gray[500] },
  card: { marginHorizontal: 20, marginBottom: 10, padding: 14, backgroundColor: Colors.slate[800], borderRadius: 14, borderWidth: 1, borderColor: Colors.gray[700] },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  catIcon: { fontSize: 20 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: Colors.white },
  cardTenant: { fontSize: 12, color: Colors.gray[400], marginTop: 1 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.gray[500] },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 'auto' },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  assignedText: { fontSize: 12, color: Colors.teal[400], marginTop: 8 },
});

