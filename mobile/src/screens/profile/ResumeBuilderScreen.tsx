import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch, RootState } from '../../store';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { theme } from '../../theme';
import { uploadResume } from '../../store/slices/jobsSlice';
import { updateProfile } from '../../store/slices/authSlice';

const DRAFT_KEY = 'resume_builder_draft';

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  summary: string;
  education: string;
  experience: string;
  skills: string;
  projects: string;
  links: string;
}

const defaultData: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  headline: '',
  summary: '',
  education: '',
  experience: '',
  skills: '',
  projects: '',
  links: '',
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatBlock = (value: string) => escapeHtml(value).replace(/\n/g, '<br/>');

const listItems = (value: string) =>
  escapeHtml(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<li>${item}</li>`)
    .join('');

const buildResumeHtml = (data: ResumeData) => {
  const summary = data.summary ? `<section><h2>Summary</h2><p>${formatBlock(data.summary)}</p></section>` : '';
  const education = data.education ? `<section><h2>Education</h2><p>${formatBlock(data.education)}</p></section>` : '';
  const experience = data.experience ? `<section><h2>Experience</h2><p>${formatBlock(data.experience)}</p></section>` : '';
  const projects = data.projects ? `<section><h2>Projects</h2><p>${formatBlock(data.projects)}</p></section>` : '';
  const skillsList = data.skills ? `<section><h2>Skills</h2><ul>${listItems(data.skills)}</ul></section>` : '';
  const links = data.links ? `<section><h2>Links</h2><p>${formatBlock(data.links)}</p></section>` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #1f2937; }
          h1 { font-size: 28px; margin-bottom: 4px; }
          h2 { font-size: 16px; margin-bottom: 6px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
          p { margin-top: 0; line-height: 1.6; }
          .headline { font-size: 16px; color: #475569; margin-bottom: 8px; }
          .contact { font-size: 12px; color: #475569; margin-bottom: 20px; }
          section { margin-top: 18px; }
          ul { margin: 6px 0 0 16px; padding: 0; }
          li { margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(data.fullName || 'Your Name')}</h1>
        ${data.headline ? `<div class="headline">${escapeHtml(data.headline)}</div>` : ''}
        <div class="contact">
          ${escapeHtml(data.email || '')}${data.phone ? ` • ${escapeHtml(data.phone)}` : ''}
        </div>
        ${summary}
        ${experience}
        ${education}
        ${projects}
        ${skillsList}
        ${links}
      </body>
    </html>
  `;
};

export default function ResumeBuilderScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem(DRAFT_KEY);
        if (draft) {
          setResumeData((prev) => ({ ...prev, ...JSON.parse(draft) }));
        }
      } catch (error) {
        console.log('Failed to load resume draft', error);
      }
    };

    loadDraft();
  }, []);

  useEffect(() => {
    if (!user) return;
    setResumeData((prev) => ({
      ...prev,
      fullName: prev.fullName || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const resumeHtml = useMemo(() => buildResumeHtml(resumeData), [resumeData]);

  const persistDraft = useCallback(async (data: ResumeData) => {
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (error) {
      console.log('Failed to save resume draft', error);
    }
  }, []);

  const generatePdf = useCallback(async () => {
    if (!resumeData.fullName || !resumeData.email) {
      Alert.alert('Missing info', 'Please add your name and email before generating.');
      return null;
    }

    setIsGenerating(true);
    try {
      const result = await Print.printToFileAsync({ html: resumeHtml });
      setGeneratedUri(result.uri);
      await persistDraft(resumeData);
      return result.uri;
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [resumeData, resumeHtml, persistDraft]);

  const handleShare = async () => {
    if (!generatedUri) {
      Alert.alert('Not ready', 'Generate the PDF first.');
      return;
    }

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(generatedUri);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const uri = generatedUri || (await generatePdf());
      if (!uri) return;

      const formData = new FormData();
      formData.append('resume', {
        uri,
        name: 'resume.pdf',
        type: 'application/pdf',
      } as any);

      const uploadResponse = await dispatch(uploadResume(formData)).unwrap();
      await dispatch(updateProfile({ resume_url: uploadResponse.url })).unwrap();
      Alert.alert('Uploaded', 'Resume uploaded and saved to your profile.');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = async () => {
    setResumeData(defaultData);
    setGeneratedUri(null);
    await AsyncStorage.removeItem(DRAFT_KEY);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Resume Builder</Text>
      <Text style={styles.subtitle}>Generate a clean PDF resume and save it to your profile.</Text>

      <Input
        label="Full Name"
        placeholder="e.g. Priya Sharma"
        value={resumeData.fullName}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, fullName: value }))}
      />
      <Input
        label="Headline"
        placeholder="e.g. Software Engineer"
        value={resumeData.headline}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, headline: value }))}
      />
      <Input
        label="Email"
        placeholder="you@email.com"
        keyboardType="email-address"
        value={resumeData.email}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, email: value }))}
      />
      <Input
        label="Phone"
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        value={resumeData.phone}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, phone: value }))}
      />
      <Input
        label="Summary"
        placeholder="Brief overview of your strengths"
        value={resumeData.summary}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, summary: value }))}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textArea}
      />
      <Input
        label="Experience"
        placeholder="Role, company, impact"
        value={resumeData.experience}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, experience: value }))}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        style={styles.textArea}
      />
      <Input
        label="Education"
        placeholder="Degree, institution, year"
        value={resumeData.education}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, education: value }))}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textArea}
      />
      <Input
        label="Projects"
        placeholder="Notable projects or achievements"
        value={resumeData.projects}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, projects: value }))}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textArea}
      />
      <Input
        label="Skills"
        placeholder="JavaScript, React, Python"
        value={resumeData.skills}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, skills: value }))}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.textArea}
      />
      <Input
        label="Links"
        placeholder="LinkedIn, GitHub, portfolio"
        value={resumeData.links}
        onChangeText={(value) => setResumeData((prev) => ({ ...prev, links: value }))}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.textArea}
      />

      <View style={styles.actions}>
        <Button
          title={isGenerating ? 'Generating...' : 'Generate PDF'}
          onPress={generatePdf}
          isLoading={isGenerating}
        />
        <Button
          title={isUploading ? 'Uploading...' : 'Upload to Profile'}
          onPress={handleUpload}
          isLoading={isUploading}
          variant="secondary"
        />
        <Button
          title="Share PDF"
          onPress={handleShare}
          variant="outline"
        />
        <Button
          title="Clear Draft"
          onPress={handleClear}
          variant="outline"
        />
      </View>

      {generatedUri ? (
        <Text style={styles.helperText}>PDF ready: {generatedUri.split('/').pop()}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  textArea: {
    minHeight: 110,
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  helperText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
});
