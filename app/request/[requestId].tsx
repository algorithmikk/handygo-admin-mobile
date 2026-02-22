import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Clock, Phone, User, Tag, AlertTriangle, CheckCircle, Wrench } from 'lucide-react-native';
import { requestService } from '@/src/services/requestService';
import { handymanService } from '@/src/services/handymanService';
import { getCategoryInfo, PRIORITY_COLORS, STATUS_COLORS } from '@/src/lib/mockData';
import { Colors } from '@/constants/Colors';
import type { MaintenanceRequest, Handyman, RequestPriority } from '@/src/types';

export default function RequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { t } = useTranslation();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);

  useEffect(() => { loadData(); }, [requestId]);

  const loadData = async () => {
    try {
      const [req, hm] = await Promise.all([
        requestService.getRequest(requestId || ''),
        handymanService.getAvailableHandymen(),
      ]);
      setRequest(req);
      setHandymen(hm);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAssign = async (handymanId: string) => {
    await requestService.assignHandyman(requestId || '', handymanId);
    Alert.alert('Success', 'Handyman assigned successfully');
    setShowAssign(false);
    await loadData();
  };

  const handlePriorityChange = (priority: RequestPriority) => {
    Alert.alert('Change Priority', `Set priority to ${priority}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        await requestService.updatePriority(requestId || '', priority);
        await loadData();
      }},
    ]);
  };

  if (loading || !request) {
    return (<SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={Colors.primary[500]} /></View></SafeAreaView>);
  }

  const cat = getCategoryInfo(request.category);
  const timeAgo = () => {
    const mins = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('requests.requestDetails')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Status & Priority */}
        <View style={styles.topRow}>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[request.status] || '#666') + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[request.status] || '#666' }]}>{request.status.replace('_', ' ')}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: (PRIORITY_COLORS[request.priority] || '#666') + '20' }]}>
            <AlertTriangle size={12} color={PRIORITY_COLORS[request.priority] || '#666'} />
            <Text style={[styles.priorityText, { color: PRIORITY_COLORS[request.priority] || '#666' }]}>{request.priority}</Text>
          </View>
        </View>

        {/* Category & Description */}
        <View style={styles.card}>
          <View style={styles.catRow}>
            <Text style={styles.catIcon}>{cat?.icon}</Text>
            <Text style={styles.catLabel}>{cat?.label}</Text>
            {request.estimatedCost && <Text style={styles.cost}>AED {request.estimatedCost}</Text>}
          </View>
          <Text style={styles.description}>{request.description}</Text>
          <View style={styles.metaRow}>
            <Clock size={14} color={Colors.gray[400]} />
            <Text style={styles.metaText}>{timeAgo()} · {new Date(request.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Tenant Info */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('requests.tenant')}</Text>
          <View style={styles.infoRow}>
            <User size={16} color={Colors.gray[400]} />
            <Text style={styles.infoText}>{request.tenantName}</Text>
          </View>
          <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${request.tenantPhone}`)}>
            <Phone size={16} color={Colors.primary[400]} />
            <Text style={[styles.infoText, { color: Colors.primary[400] }]}>{request.tenantPhone}</Text>
          </TouchableOpacity>
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.gray[400]} />
            <Text style={styles.infoText}>{request.propertyAddress || 'No address provided'}</Text>
          </View>
        </View>

        {/* Assigned Handyman */}
        {request.assignedHandymanName && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>{t('requests.assignedTo')}</Text>
            <View style={styles.assignedRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{request.assignedHandymanName.charAt(0)}</Text></View>
              <Text style={styles.assignedName}>{request.assignedHandymanName}</Text>
              <CheckCircle size={16} color={Colors.primary[400]} />
            </View>
          </View>
        )}

        {/* Actions */}
        {request.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.assignBtn} onPress={() => setShowAssign(!showAssign)}>
              <Wrench size={16} color={Colors.white} />
              <Text style={styles.assignBtnText}>{t('requests.assignHandyman')}</Text>
            </TouchableOpacity>

            {/* Priority buttons */}
            <Text style={styles.changePriorityLabel}>{t('requests.changePriority')}</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'urgent'] as RequestPriority[]).map(p => (
                <TouchableOpacity key={p} style={[styles.prioBtn, { backgroundColor: (PRIORITY_COLORS[p]) + '20', borderColor: PRIORITY_COLORS[p] + '40' }]}
                  onPress={() => handlePriorityChange(p)}>
                  <Text style={[styles.prioBtnText, { color: PRIORITY_COLORS[p] }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Handyman Selection */}
        {showAssign && (
          <View style={styles.handymenList}>
            <Text style={styles.sectionLabel}>{t('requests.selectHandyman')}</Text>
            {handymen.map(h => (
              <TouchableOpacity key={h.id} style={styles.handymanCard} onPress={() => handleAssign(h.id)}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{h.name.charAt(0)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.handymanName}>{h.name}</Text>
                  <Text style={styles.handymanSub}>⭐ {h.rating} · {h.completedJobs} jobs</Text>
                </View>
                <Text style={styles.selectText}>Select</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate[900] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.white },
  scrollView: { flex: 1 },
  topRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 8, marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priorityText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  card: { marginHorizontal: 20, marginBottom: 12, padding: 16, backgroundColor: Colors.slate[800], borderRadius: 16, borderWidth: 1, borderColor: Colors.gray[700] },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catIcon: { fontSize: 22 },
  catLabel: { fontSize: 16, fontWeight: '600', color: Colors.white },
  cost: { fontSize: 16, fontWeight: '600', color: Colors.primary[400], marginLeft: 'auto' },
  description: { fontSize: 15, color: Colors.gray[300], lineHeight: 22, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: Colors.gray[400] },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.gray[400], letterSpacing: 0.5, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { fontSize: 14, color: Colors.gray[300], flex: 1 },
  assignedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary[400] },
  assignedName: { fontSize: 15, fontWeight: '600', color: Colors.white, flex: 1 },
  actions: { marginHorizontal: 20, marginBottom: 16 },
  assignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: Colors.primary[500], borderRadius: 12, marginBottom: 16 },
  assignBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  changePriorityLabel: { fontSize: 12, fontWeight: '700', color: Colors.gray[400], letterSpacing: 0.5, marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  prioBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  prioBtnText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  handymenList: { marginHorizontal: 20 },
  handymanCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.slate[800], borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[700], marginBottom: 8 },
  handymanName: { fontSize: 15, fontWeight: '600', color: Colors.white },
  handymanSub: { fontSize: 12, color: Colors.gray[400], marginTop: 2 },
  selectText: { fontSize: 13, fontWeight: '600', color: Colors.primary[400] },
});
