import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Phone, Mail, CheckCircle, XCircle, ShieldCheck, ShieldOff, Ban } from 'lucide-react-native';
import { handymanService } from '@/src/services/handymanService';
import { getCategoryInfo } from '@/src/lib/mockData';
import { getHandymanStatusStyle, type VerifyAction } from '@/src/lib/handymanStatus';
import { Colors } from '@/constants/Colors';
import type { Handyman } from '@/src/types';

export default function HandymanDetailScreen() {
  const { handymanId } = useLocalSearchParams<{ handymanId: string }>();
  const { t } = useTranslation();
  const [handyman, setHandyman] = useState<Handyman | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadHandyman(); }, [handymanId]);

  const loadHandyman = async () => {
    try {
      const data = await handymanService.getHandyman(handymanId || '');
      setHandyman(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleVerify = (action: VerifyAction) => {
    const confirmKey = action === 'approve' ? 'handymen.approveConfirm' : action === 'suspend' ? 'handymen.suspendConfirm' : 'handymen.rejectConfirm';
    Alert.alert(t(`handymen.${action}`), t(confirmKey), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          setActionLoading(true);
          try {
            await handymanService.verify(handymanId || '', action);
            Alert.alert(t('common.confirm'), t('handymen.verifySuccess'));
            await loadHandyman();
          } catch (e: any) {
            Alert.alert(t('common.error'), e?.message || t('handymen.verifyError'));
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading || !handyman) {
    return (<SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={Colors.primary[500]} /></View></SafeAreaView>);
  }

  const statusStyle = getHandymanStatusStyle(handyman.status);
  const isPending = (handyman.status || '').toUpperCase() === 'PENDING_VERIFICATION';
  const isSuspended = (handyman.status || '').toUpperCase() === 'SUSPENDED';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('common.back')}>
          <ArrowLeft size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('handymen.viewProfile')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{handyman.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{handyman.name}</Text>
          <View style={[styles.verificationBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.verificationText, { color: statusStyle.color }]}>{t(statusStyle.labelKey)}</Text>
          </View>
          <View style={styles.statusRow}>
            {handyman.available ?
              <><CheckCircle size={14} color={Colors.primary[400]} /><Text style={styles.onlineText}>{t('handymen.online')}</Text></> :
              <><XCircle size={14} color={Colors.gray[500]} /><Text style={styles.offlineText}>{t('handymen.offline')}</Text></>
            }
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.statValue}>{handyman.rating}</Text>
              <Text style={styles.statLabel}>{t('handymen.rating')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <CheckCircle size={18} color={Colors.primary[400]} />
              <Text style={styles.statValue}>{handyman.completedJobs}</Text>
              <Text style={styles.statLabel}>{t('handymen.jobs')}</Text>
            </View>
          </View>
        </View>

        {/* Verification Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('handymen.verification')}</Text>
          <View style={styles.actionRow}>
            {(isPending || isSuspended) && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleVerify('approve')}
                disabled={actionLoading}
                accessibilityRole="button"
                accessibilityLabel={t('handymen.approve')}>
                <ShieldCheck size={18} color={Colors.white} />
                <Text style={styles.actionBtnText}>{t('handymen.approve')}</Text>
              </TouchableOpacity>
            )}
            {!isSuspended && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.suspendBtn]}
                onPress={() => handleVerify('suspend')}
                disabled={actionLoading}
                accessibilityRole="button"
                accessibilityLabel={t('handymen.suspend')}>
                <ShieldOff size={18} color={Colors.white} />
                <Text style={styles.actionBtnText}>{t('handymen.suspend')}</Text>
              </TouchableOpacity>
            )}
            {isPending && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleVerify('reject')}
                disabled={actionLoading}
                accessibilityRole="button"
                accessibilityLabel={t('handymen.reject')}>
                <Ban size={18} color={Colors.white} />
                <Text style={styles.actionBtnText}>{t('handymen.reject')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {actionLoading && <ActivityIndicator size="small" color={Colors.primary[400]} style={{ marginTop: 12 }} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('handymen.services')}</Text>
          <View style={styles.servicesGrid}>
            {handyman.services.map(s => {
              const cat = getCategoryInfo(s);
              return (
                <View key={s} style={[styles.serviceChip, { borderColor: (cat?.color || '#666') + '40' }]}>
                  <Text style={styles.serviceIcon}>{cat?.icon}</Text>
                  <Text style={styles.serviceLabel}>{cat?.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('handymen.contact')}</Text>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`tel:${handyman.phone}`)} accessibilityRole="link" accessibilityLabel={handyman.phone}>
            <Phone size={18} color={Colors.primary[400]} />
            <Text style={styles.contactText}>{handyman.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`mailto:${handyman.email}`)} accessibilityRole="link" accessibilityLabel={handyman.email}>
            <Mail size={18} color={Colors.blue[400]} />
            <Text style={styles.contactText}>{handyman.email}</Text>
          </TouchableOpacity>
        </View>

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
  profileCard: { marginHorizontal: 20, padding: 24, backgroundColor: Colors.slate[800], borderRadius: 14, borderWidth: 1, borderColor: Colors.gray[700], alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: Colors.primary[400] },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.white },
  verificationBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  verificationText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  onlineText: { fontSize: 13, color: Colors.primary[400] },
  offlineText: { fontSize: 13, color: Colors.gray[500] },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.gray[700], width: '100%' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: Colors.white },
  statLabel: { fontSize: 12, color: Colors.gray[400] },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.gray[700] },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.gray[400], marginBottom: 12, letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 14, flex: 1, minWidth: '45%', minHeight: 48, justifyContent: 'center' },
  approveBtn: { backgroundColor: Colors.primary[600] },
  suspendBtn: { backgroundColor: Colors.amber[500] },
  rejectBtn: { backgroundColor: Colors.red[500] },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.slate[800], borderWidth: 1 },
  serviceIcon: { fontSize: 16 },
  serviceLabel: { fontSize: 13, color: Colors.gray[300] },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: Colors.slate[800], borderRadius: 14, borderWidth: 1, borderColor: Colors.gray[700], marginBottom: 8 },
  contactText: { fontSize: 15, color: Colors.white },
});
