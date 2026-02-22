import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Building2, ClipboardList, Clock, CheckCircle, Wrench, Users, DollarSign, ChevronRight, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { dashboardService } from '@/src/services/dashboardService';
import { getCategoryInfo, PRIORITY_COLORS, STATUS_COLORS } from '@/src/lib/mockData';
import { Colors } from '@/constants/Colors';
import type { DashboardStats, MaintenanceRequest, Job } from '@/src/types';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { user, company, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<MaintenanceRequest[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/(auth)/login'); return; }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [s, r, j] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentRequests(),
        dashboardService.getActiveJobs(),
      ]);
      setStats(s); setRecentRequests(r); setActiveJobs(j);
    } catch (e) { console.error('Dashboard load failed:', e); }
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, []);

  if (loading) {
    return (<SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={Colors.primary[500]} /></View></SafeAreaView>);
  }

  const statCards = [
    { icon: <ClipboardList size={20} color="#f59e0b" />, value: stats?.pendingRequests || 0, label: t('dashboard.pending'), bg: '#f59e0b' },
    { icon: <Wrench size={20} color={Colors.primary[400]} />, value: stats?.activeJobs || 0, label: t('dashboard.activeJobs'), bg: Colors.primary[400] },
    { icon: <CheckCircle size={20} color="#10b981" />, value: stats?.completedToday || 0, label: t('dashboard.completedToday'), bg: '#10b981' },
    { icon: <DollarSign size={20} color="#60a5fa" />, value: `${stats?.monthlySpend || 0}`, label: t('dashboard.monthlySpend'), bg: '#60a5fa' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[400]} />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoIcon}><Building2 size={20} color={Colors.white} /></View>
            <View>
              <Text style={styles.headerTitle}>HandyGo</Text>
              <Text style={styles.headerSubtitle}>{company?.name || 'Management Portal'}</Text>
            </View>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeName}>Welcome, {user?.firstName}!</Text>
          <Text style={styles.welcomeSub}>{stats?.totalRequests || 0} total requests · {stats?.totalHandymen || 0} handymen · {stats?.totalTenants || 0} tenants</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={styles.statCard}>
              {s.icon}
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Handymen Available */}
        <View style={styles.availableBar}>
          <Users size={16} color={Colors.primary[400]} />
          <Text style={styles.availableText}>{stats?.availableHandymen || 0} / {stats?.totalHandymen || 0} handymen available</Text>
        </View>

        {/* Recent Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.recentRequests')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/requests')}>
              <Text style={styles.viewAll}>{t('dashboard.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          {recentRequests.length === 0 ? (
            <Text style={styles.emptyText}>{t('dashboard.noRecentRequests')}</Text>
          ) : (
            recentRequests.map((req) => {
              const cat = getCategoryInfo(req.category);
              return (
                <TouchableOpacity key={req.id} style={styles.requestCard} onPress={() => router.push(`/request/${req.id}`)}>
                  <View style={styles.requestLeft}>
                    <Text style={styles.catIcon}>{cat?.icon}</Text>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestTitle} numberOfLines={1}>{req.description}</Text>
                      <Text style={styles.requestSub}>{req.tenantName} · {req.propertyAddress.split(',')[0]}</Text>
                    </View>
                  </View>
                  <View style={styles.requestRight}>
                    <View style={[styles.priorityBadge, { backgroundColor: (PRIORITY_COLORS[req.priority] || '#666') + '20' }]}>
                      <Text style={[styles.priorityText, { color: PRIORITY_COLORS[req.priority] || '#666' }]}>{req.priority}</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[req.status] || '#666' }]} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Active Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.activeJobsList')}</Text>
          </View>
          {activeJobs.length === 0 ? (
            <Text style={styles.emptyText}>{t('dashboard.noActiveJobs')}</Text>
          ) : (
            activeJobs.map((job) => {
              const cat = getCategoryInfo(job.request.category);
              return (
                <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => router.push(`/request/${job.requestId}`)}>
                  <View style={styles.jobTop}>
                    <Text style={styles.catIcon}>{cat?.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>{job.request.description}</Text>
                      <Text style={styles.jobHandyman}>{job.handymanName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[job.status] || '#666') + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[job.status] || '#666' }]}>{job.status.replace('_', ' ')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate[900] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
  headerSubtitle: { fontSize: 12, color: Colors.gray[400] },
  welcomeCard: { marginHorizontal: 20, padding: 16, backgroundColor: Colors.primary[500] + '15', borderRadius: 16, borderWidth: 1, borderColor: Colors.primary[500] + '30', marginBottom: 16 },
  welcomeName: { fontSize: 18, fontWeight: '600', color: Colors.white },
  welcomeSub: { fontSize: 13, color: Colors.gray[400], marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 20, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: Colors.slate[800], borderRadius: 16, borderWidth: 1, borderColor: Colors.gray[700], padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.white, marginTop: 8 },
  statLabel: { fontSize: 11, color: Colors.gray[400], marginTop: 2 },
  availableBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 20, padding: 12, backgroundColor: Colors.primary[500] + '10', borderRadius: 10 },
  availableText: { fontSize: 13, color: Colors.primary[400] },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray[400], letterSpacing: 0.5 },
  viewAll: { fontSize: 13, color: Colors.primary[400], fontWeight: '500' },
  emptyText: { fontSize: 14, color: Colors.gray[500], textAlign: 'center', paddingVertical: 20 },
  requestCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.slate[800], borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.gray[700] },
  requestLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  catIcon: { fontSize: 20 },
  requestInfo: { flex: 1 },
  requestTitle: { fontSize: 14, fontWeight: '500', color: Colors.white },
  requestSub: { fontSize: 12, color: Colors.gray[400], marginTop: 2 },
  requestRight: { alignItems: 'flex-end', gap: 6 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  jobCard: { backgroundColor: Colors.slate[800], borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.gray[700] },
  jobTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  jobTitle: { fontSize: 14, fontWeight: '500', color: Colors.white },
  jobHandyman: { fontSize: 12, color: Colors.teal[400], marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
