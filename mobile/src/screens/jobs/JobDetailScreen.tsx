import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobDetail, applyToJob, uploadResume, confirmApplication } from '../../store/slices/jobsSlice';
import { AppDispatch, RootState } from '../../store';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { theme } from '../../theme';
import * as DocumentPicker from 'expo-document-picker';

type Props = {
  route: any;
  navigation: any;
};

export default function JobDetailScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedJob: job, isLoading } = useSelector((state: RootState) => state.jobs);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    resume_url: user?.resume_url || '',
    cover_letter: '',
  });

  useEffect(() => {
    dispatch(fetchJobDetail(jobId));
  }, [jobId]);

  const handleApply = async () => {
    if (!job) return;

    if (job.apply_type === 'in_app') {
      setShowApplicationForm(true);
    } else {
      try {
        const response = await dispatch(applyToJob({
          jobId: job.id,
          data: applicationData.resume_url ? { resume_url: applicationData.resume_url } : undefined,
        })).unwrap();
        
        if (response.redirect_url) {
          await Linking.openURL(response.redirect_url);
        }

        if (response.application_id) {
          setTimeout(() => {
            Alert.alert(
              'Confirm submission',
              'Did you complete the external application?',
              [
                {
                  text: 'Skip',
                  style: 'cancel',
                },
                {
                  text: 'No',
                  onPress: async () => {
                    try {
                      await dispatch(confirmApplication({
                        applicationId: response.application_id,
                        submission_status: 'abandoned',
                      })).unwrap();
                    } catch (confirmError) {
                      Alert.alert('Error', 'Failed to update application status');
                    }
                  },
                },
                {
                  text: 'Yes',
                  onPress: async () => {
                    try {
                      await dispatch(confirmApplication({
                        applicationId: response.application_id,
                        submission_status: 'submitted',
                      })).unwrap();
                    } catch (confirmError) {
                      Alert.alert('Error', 'Failed to update application status');
                    }
                  },
                },
              ]
            );
          }, 500);
        }

        Alert.alert('Success', response.message || 'Application recorded');
      } catch (error: any) {
        Alert.alert('Error', error || 'Failed to apply');
      }
    }
  };

  const handlePickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Upload logic
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'application/pdf',
            } as any);

            const uploadResponse = await dispatch(uploadResume(formData)).unwrap();
            setApplicationData(prev => ({ ...prev, resume_url: uploadResponse.url }));
            Alert.alert('Success', 'Resume uploaded successfully');
        } catch (error: any) {
             Alert.alert('Error', 'Failed to upload resume');
        } finally {
            setIsUploading(false);
        }
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const handleSubmitApplication = async () => {
    if (!applicationData.name || !applicationData.email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (!applicationData.resume_url) {
        Alert.alert('Error', 'Please upload a resume or provide a URL');
        return;
    }

    try {
      await dispatch(applyToJob({ 
        jobId: job!.id, 
        data: applicationData 
      })).unwrap();
      
      Alert.alert('Success', 'Application submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowApplicationForm(false);
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to submit application');
    }
  };

  if (isLoading && !isUploading && !job) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!job) return null;

  if (showApplicationForm) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.formContent}>
        <Text style={styles.formTitle}>Application for {job.title}</Text>

        <Input
          placeholder="Full Name *"
          value={applicationData.name}
          onChangeText={(value) => setApplicationData(prev => ({ ...prev, name: value }))}
          label="Full Name"
        />

        <Input
          placeholder="Email *"
          value={applicationData.email}
          onChangeText={(value) => setApplicationData(prev => ({ ...prev, email: value }))}
          keyboardType="email-address"
          label="Email Address"
        />

        <Input
          placeholder="Phone"
          value={applicationData.phone}
          onChangeText={(value) => setApplicationData(prev => ({ ...prev, phone: value }))}
          keyboardType="phone-pad"
          label="Phone Number"
        />

        <View style={styles.resumeContainer}>
            <Text style={styles.label}>Resume</Text>
            {applicationData.resume_url ? (
                <View style={styles.resumePreview}>
                    <Text style={styles.resumeText} numberOfLines={1}>
                        {applicationData.resume_url.split('/').pop()}
                    </Text>
                    <TouchableOpacity onPress={() => setApplicationData(prev => ({...prev, resume_url: ''}))}>
                         <Text style={{color: theme.colors.error}}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
            <Button
                title={isUploading ? "Uploading..." : "Upload Resume (PDF/Doc)"}
                onPress={handlePickResume}
                variant="secondary"
                isLoading={isUploading}
                style={{marginTop: theme.spacing.sm}}
            />
             <Text style={styles.helperText}>Or enter URL below manually</Text>
        </View>

        <Input
          placeholder="Resume URL"
          value={applicationData.resume_url}
          onChangeText={(value) => setApplicationData(prev => ({ ...prev, resume_url: value }))}
          label="Resume URL (Auto-filled after upload)"
        />

        <Input
          placeholder="Cover Letter"
          value={applicationData.cover_letter}
          onChangeText={(value) => setApplicationData(prev => ({ ...prev, cover_letter: value }))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          label="Cover Letter"
          style={styles.textArea}
        />

        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            onPress={() => setShowApplicationForm(false)}
            variant="outline"
            style={{flex: 1}}
          />
          <View style={{width: 10}} />
          <Button
            title="Submit"
            onPress={handleSubmitApplication}
            isLoading={isLoading}
            style={{flex: 1}}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.company}</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{job.location}</Text>
          <Text style={styles.meta}>•</Text>
          <Text style={styles.meta}>{job.job_type.replace('_', ' ').toUpperCase()}</Text>
        </View>
        
        <Text style={styles.salary}>{job.salary_range}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Description</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      {job.requirements && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.description}>{job.requirements}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {job.applications_count} people have applied
        </Text>
        <Text style={styles.footerText}>
          Posted on {new Date(job.posted_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.applyContainer}>
        {job.apply_type !== 'in_app' && (
          <View style={styles.externalResumeCard}>
            <Text style={styles.sectionTitle}>Attach Resume (Optional)</Text>
            <Text style={styles.externalHelper}>
              Uploading a resume will include a link in email applies and keep it available for admins.
            </Text>
            {applicationData.resume_url ? (
              <View style={styles.resumePreview}>
                <Text style={styles.resumeText} numberOfLines={1}>
                  {applicationData.resume_url.split('/').pop()}
                </Text>
                <TouchableOpacity onPress={() => setApplicationData(prev => ({ ...prev, resume_url: '' }))}>
                  <Text style={{ color: theme.colors.error }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <Button
              title={isUploading ? 'Uploading...' : 'Upload Resume (PDF/Doc)'}
              onPress={handlePickResume}
              variant="secondary"
              isLoading={isUploading}
            />
            <Input
              placeholder="Resume URL (optional)"
              value={applicationData.resume_url}
              onChangeText={(value) => setApplicationData(prev => ({ ...prev, resume_url: value }))}
              label="Resume URL"
              style={{ marginTop: theme.spacing.sm }}
            />
          </View>
        )}
        <Button
          title="Apply Now"
          onPress={handleApply}
          size="lg"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  company: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  meta: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  salary: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  footerText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  applyContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  externalResumeCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  externalHelper: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  formContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  formTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  textArea: {
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
  resumeContainer: {
      marginBottom: theme.spacing.md,
  },
  label: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
  },
  resumePreview: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
  },
  resumeText: {
      flex: 1,
      marginRight: 10,
      color: theme.colors.text.primary,
  },
  helperText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
  },
});
