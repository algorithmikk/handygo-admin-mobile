import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { User, Building2, Bell, Globe, ChevronRight, LogOut, HelpCircle } from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user, company, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), 'Are you sure you want to log out?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'A'}{user?.lastName?.charAt(0) || 'M'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          {company && <Text style={styles.companyName}>{company.name}</Text>}
        </View>

        {/* Settings List */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <User size={20} color={Colors.gray[400]} />
              <Text style={styles.settingLabel}>{t('settings.profile')}</Text>
            </View>
            <ChevronRight size={18} color={Colors.gray[500]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Building2 size={20} color={Colors.gray[400]} />
              <Text style={styles.settingLabel}>{t('settings.company')}</Text>
            </View>
            <ChevronRight size={18} color={Colors.gray[500]} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={Colors.gray[400]} />
              <Text style={styles.settingLabel}>{t('settings.notifications')}</Text>
            </View>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.gray[700], true: Colors.primary[500] + '60' }}
              thumbColor={notificationsEnabled ? Colors.primary[500] : Colors.gray[400]} />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
            <View style={styles.settingLeft}>
              <Globe size={20} color={Colors.gray[400]} />
              <Text style={styles.settingLabel}>{t('settings.language')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{i18n.language === 'en' ? 'English' : 'العربية'}</Text>
              <ChevronRight size={18} color={Colors.gray[500]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <HelpCircle size={20} color={Colors.gray[400]} />
              <Text style={styles.settingLabel}>{t('settings.support')}</Text>
            </View>
            <ChevronRight size={18} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.red[400]} />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t('settings.version')} 1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate[900] },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.white },
  profileCard: { marginHorizontal: 20, padding: 24, backgroundColor: Colors.slate[800], borderRadius: 20, borderWidth: 1, borderColor: Colors.gray[700], alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: Colors.primary[400] },
  profileName: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
  profileEmail: { fontSize: 14, color: Colors.gray[400], marginTop: 4 },
  companyName: { fontSize: 13, color: Colors.teal[400], marginTop: 4 },
  section: { marginHorizontal: 20, marginBottom: 20 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.slate[800], borderRadius: 12, padding: 16, marginBottom: 8 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, color: Colors.white },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 14, color: Colors.gray[400] },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, padding: 16, backgroundColor: Colors.red[400] + '15', borderRadius: 12, borderWidth: 1, borderColor: Colors.red[400] + '30' },
  logoutText: { fontSize: 16, fontWeight: '600', color: Colors.red[400] },
  version: { fontSize: 12, color: Colors.gray[600], textAlign: 'center', marginTop: 20 },
});

