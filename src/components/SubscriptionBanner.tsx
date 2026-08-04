import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react-native';
import { billingService, type SubscriptionInfo } from '@/src/services/billingService';
import { Colors } from '@/constants/Colors';

/**
 * Read-only subscription status banner for admin ops.
 */
export function SubscriptionBanner() {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    billingService.getSubscription().then(setSubscription).catch(() => {
      setSubscription({ active: false, status: 'none' });
    });
  }, []);

  if (!subscription || subscription.active) return null;

  const statusKey = (subscription.status || 'none').toLowerCase().replace(/ /g, '_');
  const statusLabel = t(`billing.status.${statusKey}`);

  return (
    <View style={styles.banner} accessibilityRole="text" accessibilityLabel={t('billing.bannerLabel')}>
      <CreditCard size={18} color={Colors.amber[400]} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('billing.inactiveTitle')}</Text>
        <Text style={styles.subtitle}>{t('billing.inactiveSubtitle', { status: statusLabel })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    backgroundColor: Colors.amber[500] + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.amber[500] + '40',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: Colors.amber[400] },
  subtitle: { fontSize: 12, color: Colors.gray[400], marginTop: 4, lineHeight: 18 },
});
