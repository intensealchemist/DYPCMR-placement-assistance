import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../../components/Button';
import { theme } from '../../theme';

export default function AdminDashboardScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage Job Placement</Text>
      </View>

      <View style={styles.content}>
        <Button
          title="View All Applications"
          onPress={() => navigation.navigate('AdminApplications')}
          style={styles.card}
          variant="secondary"
        />
        
        {/* Placeholder for future features */}
         <Button
          title="Manage Jobs (Coming Soon)"
          disabled
          style={styles.card}
          variant="outline"
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
});
