// src/screens/CloudSyncScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import {
  getCloudSyncSettings,
  updateCloudSyncSettings,
  performFullSync,
  getLastSyncTimestamp,
  initializeCloudSync,
} from '../utils/cloudSync';
import { SyncIcon, WifiIcon, ClockIcon, CloudIcon } from '../components/AppIcons';

const CloudSyncScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    autoSync: false,
    syncOnWifi: true,
    syncInterval: 'daily',
    lastSynced: null,
  });
  const [lastSyncDate, setLastSyncDate] = useState(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
    checkMigrationStatus();
  }, [user]);

  const checkMigrationStatus = async () => {
    try {
      const result = await initializeCloudSync();
      if (!result.success) {
        if (result.needsMigration) {
          setNeedsMigration(true);
          setErrorMessage(result.message || 'SQL migrations need to be run in Supabase dashboard.');
        } else if (result.message) {
          setErrorMessage(result.message);
        }
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const loadSettings = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'You need to be logged in to use cloud sync.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    setLoading(true);
    try {
      const syncSettings = await getCloudSyncSettings(user.id);
      setSettings(syncSettings);

      const lastSync = await getLastSyncTimestamp(user.id);
      if (lastSync) {
        setLastSyncDate(new Date(lastSync));
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
      Alert.alert('Error', 'Failed to load sync settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (value) => {
    try {
      const updatedSettings = { ...settings, enabled: value };
      setSettings(updatedSettings);
      await updateCloudSyncSettings(user.id, updatedSettings);

      if (value) {
        Alert.alert(
          'Cloud Sync Enabled',
          'Your collections will now be synced to the cloud. Would you like to perform an initial sync now?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Sync Now', onPress: handleSyncNow },
          ]
        );
      }
    } catch (error) {
      console.error('Error updating sync settings:', error);
      Alert.alert('Error', 'Failed to update sync settings');
    }
  };

  const handleToggleAutoSync = async (value) => {
    try {
      const updatedSettings = { ...settings, autoSync: value };
      setSettings(updatedSettings);
      await updateCloudSyncSettings(user.id, updatedSettings);
    } catch (error) {
      console.error('Error updating auto sync setting:', error);
      Alert.alert('Error', 'Failed to update auto sync setting');
    }
  };

  const handleToggleSyncOnWifi = async (value) => {
    try {
      const updatedSettings = { ...settings, syncOnWifi: value };
      setSettings(updatedSettings);
      await updateCloudSyncSettings(user.id, updatedSettings);
    } catch (error) {
      console.error('Error updating sync on wifi setting:', error);
      Alert.alert('Error', 'Failed to update sync on wifi setting');
    }
  };

  const handleSyncIntervalChange = async (interval) => {
    try {
      const updatedSettings = { ...settings, syncInterval: interval };
      setSettings(updatedSettings);
      await updateCloudSyncSettings(user.id, updatedSettings);
    } catch (error) {
      console.error('Error updating sync interval:', error);
      Alert.alert('Error', 'Failed to update sync interval');
    }
  };

  const handleSyncNow = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'You need to be logged in to sync.');
      return;
    }

    setSyncing(true);
    try {
      const result = await performFullSync(user.id);
      
      if (result.success) {
        Alert.alert('Success', result.message);
        // Update last sync date
        const lastSync = await getLastSyncTimestamp(user.id);
        if (lastSync) {
          setLastSyncDate(new Date(lastSync));
        }
      } else {
        Alert.alert('Sync Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Error', 'Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSyncDate = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (needsMigration) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Cloud Sync Setup Required
            </Text>
            
            <View style={styles.migrationMessageContainer}>
              <CloudIcon color={colors.danger} size={40} style={styles.migrationIcon} />
              <Text style={[styles.migrationTitle, { color: colors.danger }]}>
                Database Setup Needed
              </Text>
              <Text style={[styles.migrationText, { color: colors.textSecondary }]}>
                {errorMessage || 'The Supabase database tables for cloud sync have not been set up yet.'}
              </Text>
              <Text style={[styles.migrationText, { color: colors.textSecondary }]}>
                Please follow these steps:
              </Text>
              <View style={styles.migrationSteps}>
                <Text style={[styles.migrationStep, { color: colors.text }]}>
                  1. Log in to your Supabase dashboard
                </Text>
                <Text style={[styles.migrationStep, { color: colors.text }]}>
                  2. Go to the SQL Editor section
                </Text>
                <Text style={[styles.migrationStep, { color: colors.text }]}>
                  3. Copy and paste the SQL migration script from:
                </Text>
                <Text style={[styles.migrationCode, { backgroundColor: colors.background }]}>
                  supabase/migrations/20250621_initialize_cloud_sync.sql
                </Text>
                <Text style={[styles.migrationStep, { color: colors.text }]}>
                  4. Run the script to create the necessary tables
                </Text>
                <Text style={[styles.migrationStep, { color: colors.text }]}>
                  5. Return to this screen and try again
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.syncButton, { backgroundColor: colors.primary }]}
              onPress={checkMigrationStatus}
            >
              <SyncIcon color="#FFFFFF" size={20} style={styles.buttonIcon} />
              <Text style={styles.syncButtonText}>Check Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Cloud Sync
          </Text>
          
          <View style={styles.lastSyncContainer}>
            <Text style={[styles.lastSyncLabel, { color: colors.textSecondary }]}>
              Last synced:
            </Text>
            <Text style={[styles.lastSyncValue, { color: colors.text }]}>
              {formatLastSyncDate(lastSyncDate)}
            </Text>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Enable Cloud Sync
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Sync your collections across devices
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.enabled ? colors.card : colors.card}
            />
          </View>
          
          {settings.enabled && (
            <>
              <View style={styles.optionRow}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    Auto Sync
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Automatically sync in the background
                  </Text>
                </View>
                <Switch
                  value={settings.autoSync}
                  onValueChange={handleToggleAutoSync}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={settings.autoSync ? colors.card : colors.card}
                />
              </View>
              
              {settings.autoSync && (
                <>
                  <View style={styles.optionRow}>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionText, { color: colors.text }]}>
                        Sync on Wi-Fi Only
                      </Text>
                      <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                        Only sync when connected to Wi-Fi
                      </Text>
                    </View>
                    <Switch
                      value={settings.syncOnWifi}
                      onValueChange={handleToggleSyncOnWifi}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={settings.syncOnWifi ? colors.card : colors.card}
                    />
                  </View>
                  
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Sync Interval
                  </Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.intervalButton,
                      settings.syncInterval === 'hourly' && { 
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary 
                      },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => handleSyncIntervalChange('hourly')}
                  >
                    <ClockIcon 
                      color={settings.syncInterval === 'hourly' ? colors.primary : colors.textSecondary} 
                      size={20} 
                    />
                    <Text style={[
                      styles.intervalText,
                      { color: settings.syncInterval === 'hourly' ? colors.primary : colors.text }
                    ]}>
                      Hourly
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.intervalButton,
                      settings.syncInterval === 'daily' && { 
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary 
                      },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => handleSyncIntervalChange('daily')}
                  >
                    <ClockIcon 
                      color={settings.syncInterval === 'daily' ? colors.primary : colors.textSecondary} 
                      size={20} 
                    />
                    <Text style={[
                      styles.intervalText,
                      { color: settings.syncInterval === 'daily' ? colors.primary : colors.text }
                    ]}>
                      Daily
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.intervalButton,
                      settings.syncInterval === 'weekly' && { 
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary 
                      },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => handleSyncIntervalChange('weekly')}
                  >
                    <ClockIcon 
                      color={settings.syncInterval === 'weekly' ? colors.primary : colors.textSecondary} 
                      size={20} 
                    />
                    <Text style={[
                      styles.intervalText,
                      { color: settings.syncInterval === 'weekly' ? colors.primary : colors.text }
                    ]}>
                      Weekly
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.primary }]}
                onPress={handleSyncNow}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <SyncIcon color="#FFFFFF" size={20} style={styles.buttonIcon} />
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <CloudIcon color={colors.primary} size={24} style={styles.infoIcon} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            About Cloud Sync
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Cloud sync allows you to access your collections from multiple devices and ensures your data is safely backed up.
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Your data is securely stored in the cloud
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Changes made on one device will sync to all your devices
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • If you lose your device, your collections are safe
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • You must be logged in to use cloud sync
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  lastSyncContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lastSyncLabel: {
    fontSize: 16,
  },
  lastSyncValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  intervalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  intervalText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  infoIcon: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  migrationMessageContainer: {
    alignItems: 'center',
    padding: 16,
  },
  migrationIcon: {
    marginBottom: 16,
  },
  migrationTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  migrationText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  migrationSteps: {
    alignSelf: 'stretch',
    marginTop: 8,
    marginBottom: 16,
  },
  migrationStep: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  migrationCode: {
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    marginBottom: 16,
  },
});

export default CloudSyncScreen;
