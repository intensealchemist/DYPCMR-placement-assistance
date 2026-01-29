import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { Button } from '../../components/Button';
import { RootState } from '../../store';
import { theme } from '../../theme';
import { Logo } from '../../components/Logo';

export default function AdminDashboardScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user?.is_admin) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Access restricted</Text>
        <Text style={styles.emptySubtitle}>Only admins can access this dashboard.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Logo width={200} />
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage Job Placement</Text>
      </View>

      <View style={styles.content}>
        <Button
          title="Manage Job Postings"
          onPress={() => navigation.navigate('AdminJobs')}
          style={styles.card}
          variant="primary"
        />
        <Button
          title="View All Applications"
          onPress={() => navigation.navigate('AdminApplications')}
          style={styles.card}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
      marginBottom: theme.spacing.md,
      height: 80, // Taller buttons for dashboard
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});
