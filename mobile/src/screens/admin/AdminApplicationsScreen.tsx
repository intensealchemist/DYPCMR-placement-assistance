import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { jobsApi } from '../../api/jobs';
import { theme } from '../../theme';

interface Application {
    id: number;
    job_title: string;
    job_company: string;
    name: string;
    email: string;
    status: string;
    resume_url?: string;
    applied_at: string;
    source: string;
}

export default function AdminApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await jobsApi.getApplications();
      // data might be paginated { count, next, previous, results } or just list depending on View.
      // ListAPIView usually paginates. ApplicationListView uses PageNumberPagination default.
      // So data.results is likely.
      if (data.results) {
          setApplications(data.results);
      } else if (Array.isArray(data)) {
          setApplications(data);
      }
    } catch (error) {
      console.log('Failed to load applications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Application }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.jobTitle}>{item.job_title}</Text>
        <Text style={styles.company}>{item.job_company}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Applicant:</Text>
        <Text style={styles.value}>{item.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{item.email}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.row}>
          <Text style={styles.date}>{new Date(item.applied_at).toLocaleDateString()}</Text>
      </View>

      {item.resume_url ? (
          <TouchableOpacity 
            style={styles.resumeButton}
            onPress={() => Linking.openURL(item.resume_url!)}
          >
              <Text style={styles.resumeText}>View Resume</Text>
          </TouchableOpacity>
      ) : null}
    </View>
  );

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return theme.colors.text.secondary;
          case 'reviewed': return theme.colors.primary;
          case 'shortlisted': return theme.colors.success;
          case 'rejected': return theme.colors.error;
          case 'hired': return theme.colors.accent;
          default: return theme.colors.text.primary;
      }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
      marginBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.xs,
  },
  jobTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
  },
  company: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
  },
  label: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
  },
  value: {
      color: theme.colors.text.primary,
      fontWeight: theme.typography.weights.medium as any,
      fontSize: theme.typography.sizes.sm,
  },
  status: {
      fontWeight: 'bold',
  },
  date: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
  },
  resumeButton: {
      marginTop: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.secondary,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
  },
  resumeText: {
      color: theme.colors.text.light,
      fontSize: theme.typography.sizes.sm,
  },
});
