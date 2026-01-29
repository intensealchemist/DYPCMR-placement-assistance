import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { jobsApi, Job } from '../../api/jobs';
import { Button } from '../../components/Button';
import { RootState } from '../../store';
import { theme } from '../../theme';

export default function AdminJobsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadJobs = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const data = await jobsApi.getJobs({ page: 1 });
      if (data?.results) {
        setJobs(data.results);
      } else if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (error) {
      console.log('Failed to load jobs', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useFocusEffect(
    useCallback(() => {
      loadJobs(false);
    }, [loadJobs])
  );

  if (!user?.is_admin) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Access restricted</Text>
        <Text style={styles.emptySubtitle}>Only admins can manage job postings.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadJobs(false);
  };

  const handleToggleActive = async (job: Job) => {
    setUpdatingId(job.id);
    try {
      const updated = await jobsApi.updateJob(job.id, { active: !job.active });
      setJobs(prev => prev.map(item => (item.id === job.id ? { ...item, ...updated } : item)));
    } catch (error) {
      Alert.alert('Update Failed', 'Could not update job status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (job: Job) => {
    Alert.alert('Delete Job', `Delete ${job.title}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await jobsApi.deleteJob(job.id);
            setJobs(prev => prev.filter(item => item.id !== job.id));
          } catch (error) {
            Alert.alert('Delete Failed', 'Could not delete this job.');
          }
        },
      },
    ]);
  };

  const formatLabel = (value: string) =>
    value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const renderItem = ({ item }: { item: Job }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.featured ? <Text style={styles.featuredBadge}>Featured</Text> : null}
      </View>
      <Text style={styles.company}>{item.company}</Text>
      <View style={styles.metaRow}>
        {(item.job_type_tags && item.job_type_tags.length ? item.job_type_tags : [item.job_type]).map(tag => (
          <Text key={tag} style={styles.metaChip}>
            {formatLabel(tag)}
          </Text>
        ))}
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>{formatLabel(item.apply_type)}</Text>
        <Text style={[styles.metaChip, item.active ? styles.activeChip : styles.inactiveChip]}>
          {item.active ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.metaText}>{item.applications_count} applications</Text>
        <Text style={styles.metaText}>{new Date(item.posted_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionPrimary]}
          onPress={() => navigation.navigate('AdminJobForm', { jobId: item.id })}
        >
          <Text style={styles.actionTextLight}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, item.active ? styles.actionOutline : styles.actionSecondary]}
          onPress={() => handleToggleActive(item)}
          disabled={updatingId === item.id}
        >
          <Text style={item.active ? styles.actionTextPrimary : styles.actionTextLight}>
            {item.active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionDanger]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionTextLight}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Job Postings</Text>
        <Text style={styles.headerSubtitle}>Create and organize placement listings.</Text>
        <Button
          title="Create New Job"
          onPress={() => navigation.navigate('AdminJobForm')}
          style={styles.createButton}
        />
      </View>
      <FlatList
        data={jobs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptySubtitle}>No jobs found. Create your first listing.</Text>
          </View>
        }
      />
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  createButton: {
    marginTop: theme.spacing.md,
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    fontSize: theme.typography.sizes.xs,
  },
  company: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  metaChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.xs,
  },
  activeChip: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  inactiveChip: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  metaText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  actionPrimary: {
    backgroundColor: theme.colors.primary,
  },
  actionSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  actionOutline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  actionDanger: {
    backgroundColor: theme.colors.error,
  },
  actionTextLight: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
  },
  actionTextPrimary: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyList: {
    padding: theme.spacing.xl,
    alignItems: 'center',
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
