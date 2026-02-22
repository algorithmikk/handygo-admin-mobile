import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Phone, Mail, CheckCircle, XCircle, MapPin } from 'lucide-react-native';
import { handymanService } from '@/src/services/handymanService';
import { getCategoryInfo } from '@/src/lib/mockData';
import { Colors } from '@/constants/Colors';
import type { Handyman } from '@/src/types';

export default function HandymanDetailScreen() {
  const { handymanId } = useLocalSearchParams<{ handymanId: string }>();
  const { t } = useTranslation();
  const [handyman, setHandyman] = useState<Handyman | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHandyman(); }, [handymanId]);

  const loadHandyman = async () => {
    try {
      const data = await handymanService.getHandyman(handymanId || '');
      setHandyman(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading || !handyman) {
    return (<SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={Colors.primary[500]} /></View></SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('handymen.viewProfile')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{handyman.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{handyman.name}</Text>
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

        {/* Services */}
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

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('handymen.contact')}</Text>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`tel:${handyman.phone}`)}>
            <Phone size={18} color={Colors.primary[400]} />
            <Text style={styles.contactText}>{handyman.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`mailto:${handyman.email}`)}>
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
  profileCard: { marginHorizontal: 20, padding: 24, backgroundColor: Colors.slate[800], borderRadius: 20, borderWidth: 1, borderColor: Colors.gray[700], alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: Colors.primary[400] },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.white },
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
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.slate[800], borderWidth: 1 },
  serviceIcon: { fontSize: 16 },
  serviceLabel: { fontSize: 13, color: Colors.gray[300] },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: Colors.slate[800], borderRadius: 12, marginBottom: 8 },
  contactText: { fontSize: 15, color: Colors.white },
});

