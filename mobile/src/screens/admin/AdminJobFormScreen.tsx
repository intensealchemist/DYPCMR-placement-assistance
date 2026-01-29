import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { jobsApi, Job } from '../../api/jobs';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { RootState } from '../../store';
import { theme } from '../../theme';

type JobType = 'full_time' | 'part_time' | 'internship' | 'contract' | 'remote';
type ApplyType = 'google_form' | 'email' | 'in_app' | 'external';

interface FormState {
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  job_type: JobType;
  job_type_tags: JobType[];
  salary_min: string;
  salary_max: string;
  experience_required: string;
  skills_required: string;
  apply_type: ApplyType;
  apply_target: string;
  deadline: string;
  active: boolean;
  featured: boolean;
  push_on_create: boolean;
}

const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
];

const APPLY_TYPES: { label: string; value: ApplyType }[] = [
  { label: 'In-App', value: 'in_app' },
  { label: 'Google Form', value: 'google_form' },
  { label: 'Email', value: 'email' },
  { label: 'External Link', value: 'external' },
];

const defaultFormState: FormState = {
  title: '',
  company: '',
  description: '',
  requirements: '',
  location: '',
  job_type: 'full_time' as JobType,
  job_type_tags: ['full_time'],
  salary_min: '',
  salary_max: '',
  experience_required: '',
  skills_required: '',
  apply_type: 'google_form' as ApplyType,
  apply_target: '',
  deadline: '',
  active: true,
  featured: false,
  push_on_create: false,
};

export default function AdminJobFormScreen({ navigation, route }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const jobId = route?.params?.jobId as number | undefined;
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(!!jobId);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = useMemo(() => !!jobId, [jobId]);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      setIsLoading(true);
      try {
        const job: Job = await jobsApi.getJobDetail(jobId);
        const incomingTags = Array.isArray(job.job_type_tags) && job.job_type_tags.length
          ? (job.job_type_tags.filter(Boolean) as JobType[])
          : [];
        const primaryJobType = (job.job_type || incomingTags[0] || 'full_time') as JobType;
        const jobTypeTags = incomingTags.length
          ? (Array.from(new Set(incomingTags)) as JobType[])
          : [primaryJobType];
        setFormData({
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          requirements: job.requirements || '',
          location: job.location || '',
          job_type: jobTypeTags[0],
          job_type_tags: jobTypeTags,
          salary_min: job.salary_min ? String(job.salary_min) : '',
          salary_max: job.salary_max ? String(job.salary_max) : '',
          experience_required: job.experience_required || '',
          skills_required: job.skills_required || '',
          apply_type: (job.apply_type || 'google_form') as ApplyType,
          apply_target: job.apply_target || '',
          deadline: job.deadline ? job.deadline.split('T')[0] : '',
          active: job.active ?? true,
          featured: job.featured ?? false,
          push_on_create: job.push_on_create ?? false,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to load job details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  if (!user?.is_admin) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Access restricted</Text>
        <Text style={styles.emptySubtitle}>Only admins can manage job postings.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleJobTypeTag = (value: JobType) => {
    setFormData(prev => {
      const isSelected = prev.job_type_tags.includes(value);
      let nextTags: JobType[];

      if (isSelected) {
        if (prev.job_type_tags.length === 1) {
          nextTags = prev.job_type_tags;
        } else {
          nextTags = prev.job_type_tags.filter(tag => tag !== value);
        }
      } else {
        const remaining = prev.job_type_tags.filter(tag => tag !== value);
        nextTags = [value, ...remaining];
      }

      if (!nextTags.length) {
        nextTags = [value];
      }

      return {
        ...prev,
        job_type_tags: Array.from(new Set(nextTags)) as JobType[],
        job_type: (Array.from(new Set(nextTags)) as JobType[])[0],
      };
    });
  };

  const parseRawText = (text: string) => {
    const cleaned = text
      .replace(/\r/g, '')
      .replace(/[\u2013\u2014]/g, '-')
      .trim();
    const lines = cleaned
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => !/^\+\d+$/.test(line));
    const lowerText = cleaned.toLowerCase();

    const labelMatches = (line: string, label: string) => {
      const safeLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${safeLabel}\\s*[:\\-]\\s*(.+)$`, 'i');
      const match = line.match(regex);
      return match ? match[1].trim() : '';
    };

    const findLabelValue = (labels: string[]) => {
      for (const line of lines) {
        for (const label of labels) {
          const value = labelMatches(line, label);
          if (value) return value;
        }
      }
      return '';
    };

    const labelPrefixes = [
      'position',
      'job title',
      'title',
      'role',
      'company',
      'organization',
      'employer',
      'location',
      'business vertical',
      'job type',
      'type',
      'job description',
      'description',
      'responsibilities',
      'roles & responsibilities',
      'requirements',
      'skills & qualifications',
      'skills',
      'qualifications',
      'eligibility',
      'good to have',
      'key details',
      'key hiring streams',
      'key hiring streams and opportunities',
      'application process',
      'experience',
      'salary',
      'ctc',
      'package',
      'apply',
      'apply link',
      'apply here',
      'deadline',
      'last date',
      'apply by',
    ];

    const isLabelLine = (line: string) => {
      const normalized = line.toLowerCase();
      return labelPrefixes.some(label => normalized.startsWith(label) && /[:\-]/.test(normalized));
    };

    const findMostRepeatedLine = () => {
      const counts = new Map<string, { value: string; count: number }>();
      for (const line of lines) {
        if (line.length > 60) continue;
        if (/^https?:\/\//i.test(line)) continue;
        if (isLabelLine(line)) continue;
        if (/^(dear|thanks|regards|note)\b/i.test(line)) continue;
        const normalized = line.toLowerCase();
        const current = counts.get(normalized);
        if (current) {
          current.count += 1;
        } else {
          counts.set(normalized, { value: line, count: 1 });
        }
      }

      let bestValue = '';
      let bestCount = 0;
      counts.forEach(entry => {
        if (entry.count > bestCount) {
          bestCount = entry.count;
          bestValue = entry.value;
        }
      });

      return bestCount >= 2 ? bestValue : '';
    };

    const findSectionValue = (labels: string[]) => {
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        for (const label of labels) {
          const value = labelMatches(line, label);
          if (value || line.toLowerCase().startsWith(label)) {
            const sectionLines = [value || line.replace(new RegExp(`^${label}`, 'i'), '').replace(/[:\-]/, '').trim()];
            for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
              if (isLabelLine(lines[nextIndex])) break;
              sectionLines.push(lines[nextIndex]);
            }
            return sectionLines.filter(Boolean).join('\n');
          }
        }
      }
      return '';
    };

    const urlMatch = cleaned.match(/https?:\/\/[^\s)]+/i);
    const emailMatch = cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

    const detectJobType = (): JobType | '' => {
      if (lowerText.includes('intern')) return 'internship' as JobType;
      if (lowerText.includes('part time') || lowerText.includes('part-time')) return 'part_time' as JobType;
      if (lowerText.includes('contract')) return 'contract' as JobType;
      if (lowerText.includes('remote')) return 'remote' as JobType;
      if (lowerText.includes('full time') || lowerText.includes('full-time')) return 'full_time' as JobType;
      return '';
    };

    const primaryJobType = detectJobType();

    const detectApplyType = (targetUrl?: string, targetEmail?: string) => {
      if (lowerText.includes('in-app') || lowerText.includes('in app')) return 'in_app' as ApplyType;
      if (targetUrl) {
        if (/forms\.gle|docs\.google\.com\/forms/i.test(targetUrl)) return 'google_form' as ApplyType;
        return 'external' as ApplyType;
      }
      if (targetEmail) return 'email' as ApplyType;
      return '';
    };

    const parseSalaryRange = () => {
      const lpaRange = cleaned.match(
        /(₹?\s*\d+(?:\.\d+)?)\s*(?:-|to)\s*(₹?\s*\d+(?:\.\d+)?)\s*(lpa|lakhs?|lakh|per annum)/i
      );
      if (lpaRange) {
        const minValue = lpaRange[1].replace(/₹/g, '').trim();
        const maxValue = lpaRange[2].replace(/₹/g, '').trim();
        return {
          salary_min: String(Math.round(parseFloat(minValue) * 100000)),
          salary_max: String(Math.round(parseFloat(maxValue) * 100000)),
        };
      }

      const lpaSingle = cleaned.match(/(\d+(?:\.\d+)?)\s*(lpa|lakhs?)/i);
      if (lpaSingle) {
        const value = String(Math.round(parseFloat(lpaSingle[1]) * 100000));
        return { salary_min: value, salary_max: '' };
      }

      const currencyRange = cleaned.match(/₹\s*([\d,]+)\s*(?:-|to)\s*₹?\s*([\d,]+)/i);
      if (currencyRange) {
        return {
          salary_min: currencyRange[1].replace(/,/g, ''),
          salary_max: currencyRange[2].replace(/,/g, ''),
        };
      }

      return { salary_min: '', salary_max: '' };
    };

    const experienceMatch = cleaned.match(
      /(\d+\s*(?:-|to)\s*\d+\s*(?:years?|months?)|\d+\+?\s*(?:years?|months?))/i
    );

    const firstLine = lines[0] || '';
    const introCompanyMatch = firstLine.match(/^([A-Z][A-Za-z0-9&.,()' ]{2,})\s+is\s+/);
    const companyFromIntro = introCompanyMatch ? introCompanyMatch[1].trim() : '';
    const repeatedCompany = findMostRepeatedLine();

    const titleFromLabel = findLabelValue(['position', 'job title', 'title', 'role']);
    const titleFromSentence = /(?:hiring for|opening for|looking for)\s+([^\n.]+)/i.exec(cleaned)?.[1] || '';
    const titleFromLine = lines.find(line => line.length <= 60) || '';
    const titleGuess = titleFromLabel || titleFromSentence || titleFromLine;

    const normalizeTitle = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return '';
      if (trimmed.length > 80) return '';
      if (/hiring|freshers|roles|opportunities/i.test(trimmed) && trimmed.split(' ').length > 6) {
        return '';
      }
      return trimmed;
    };

    const rolesHighlight =
      findSectionValue(['targeted roles', 'key hiring streams and opportunities', 'specialized roles']) ||
      findLabelValue(['targeted roles', 'key hiring streams', 'specialized roles']);

    let parsedTitle =
      normalizeTitle(titleFromLabel) ||
      normalizeTitle(titleFromSentence) ||
      normalizeTitle(titleFromLine) ||
      (rolesHighlight ? 'Multiple Roles' : '');

    let parsedCompany =
      findLabelValue(['company', 'organization', 'employer']) || repeatedCompany || companyFromIntro;
    if (!parsedCompany && titleGuess.includes(' at ')) {
      const [titlePart, companyPart] = titleGuess.split(' at ');
      parsedTitle = titlePart.trim();
      parsedCompany = companyPart.trim();
    }
    if (!parsedCompany && titleGuess.includes('@')) {
      const [titlePart, companyPart] = titleGuess.split('@');
      parsedTitle = titlePart.trim();
      parsedCompany = companyPart.trim();
    }

    const locationSentenceMatch =
      cleaned.match(/(?:cities|locations)\s+like\s+([^\.\n]+)/i) ||
      cleaned.match(/locations?:\s*([^\n]+)/i);
    const parsedLocation =
      findLabelValue(['location', 'place', 'city']) || locationSentenceMatch?.[1]?.trim() ||
      (lowerText.includes('remote') ? 'Remote' : '');
    const descriptionBlock = findSectionValue([
      'roles & responsibilities',
      'responsibilities',
      'job description',
      'description',
    ]);
    const detailBlock = findSectionValue([
      'key details',
      'key hiring streams and opportunities',
      'application process',
    ]);
    const parsedDescription =
      [descriptionBlock, detailBlock].filter(Boolean).join('\n\n') ||
      lines.slice(0, 6).join('\n');
    const parsedRequirements =
      findSectionValue([
        'skills & qualifications',
        'requirements',
        'qualifications',
        'eligibility',
        'good to have',
      ]) || '';
    const parsedSkills = findSectionValue(['skills']) || rolesHighlight || '';
    const parsedApplyTarget = urlMatch?.[0] || emailMatch?.[0] || findLabelValue(['apply', 'apply link', 'apply here']);
    const parsedApplyType = detectApplyType(parsedApplyTarget, emailMatch?.[0]);
    const parsedDeadline = findLabelValue(['deadline', 'last date', 'apply by']);

    return {
      title: parsedTitle?.trim(),
      company: parsedCompany?.trim(),
      location: parsedLocation?.trim(),
      job_type: primaryJobType || undefined,
      job_type_tags: primaryJobType ? [primaryJobType] : undefined,
      description: parsedDescription?.trim(),
      requirements: parsedRequirements?.trim(),
      skills_required: parsedSkills?.trim(),
      experience_required: experienceMatch?.[0]?.trim(),
      apply_target: parsedApplyTarget?.trim(),
      apply_type: parsedApplyType || undefined,
      deadline: parsedDeadline?.trim(),
      ...parseSalaryRange(),
    };
  };

  const handleAutofill = () => {
    if (!rawText.trim()) {
      Alert.alert('Paste job text', 'Add the raw job description to auto-fill fields.');
      return;
    }

    const parsed = parseRawText(rawText) as Record<string, any>;
    const { job_type: parsedTypeRaw, job_type_tags: parsedTagsRaw, ...parsedRest } = parsed;

    setFormData(prev => {
      const next: FormState = { ...prev };

      Object.entries(parsedRest).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          (next as Record<string, any>)[key] = value;
        }
      });

      const parsedTags = Array.isArray(parsedTagsRaw)
        ? (parsedTagsRaw.filter((tag): tag is JobType => JOB_TYPES.some(option => option.value === tag)) as JobType[])
        : undefined;
      const parsedType = parsedTypeRaw ? (parsedTypeRaw as JobType) : undefined;

      if (parsedTags && parsedTags.length) {
        const unique = Array.from(new Set(parsedTags)) as JobType[];
        next.job_type_tags = unique;
      } else if (parsedType) {
        const remaining = next.job_type_tags.filter(tag => tag !== parsedType);
        next.job_type_tags = [parsedType, ...remaining];
      }

      if (!next.job_type_tags.length) {
        next.job_type_tags = [next.job_type];
      }

      next.job_type = next.job_type_tags[0];

      return next;
    });
  };

  const validateForm = () => {
    if (!formData.title || !formData.company || !formData.description) {
      Alert.alert('Missing Info', 'Title, company, and description are required.');
      return false;
    }

    if (!formData.apply_target && formData.apply_type !== 'in_app') {
      Alert.alert('Missing Info', 'Please provide an apply target for this job.');
      return false;
    }

    if (formData.apply_type === 'email' && !formData.apply_target.includes('@')) {
      Alert.alert('Invalid Email', 'Please provide a valid email address.');
      return false;
    }

    if (
      (formData.apply_type === 'google_form' || formData.apply_type === 'external') &&
      formData.apply_target &&
      !formData.apply_target.startsWith('http')
    ) {
      Alert.alert('Invalid URL', 'Apply link must start with http:// or https://');
      return false;
    }

    if (!formData.job_type_tags || formData.job_type_tags.length === 0) {
      Alert.alert('Missing Info', 'Select at least one job type.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const applyTarget =
      formData.apply_type === 'in_app' && !formData.apply_target
        ? 'in_app'
        : formData.apply_target;

    const payload = {
      title: formData.title,
      company: formData.company,
      description: formData.description,
      requirements: formData.requirements || undefined,
      location: formData.location || undefined,
      job_type: formData.job_type,
      salary_min: formData.salary_min ? Number(formData.salary_min) : undefined,
      salary_max: formData.salary_max ? Number(formData.salary_max) : undefined,
      experience_required: formData.experience_required || undefined,
      skills_required: formData.skills_required || undefined,
      apply_type: formData.apply_type,
      apply_target: applyTarget,
      deadline: formData.deadline || undefined,
      active: formData.active,
      featured: formData.featured,
      push_on_create: formData.push_on_create,
      job_type_tags: Array.from(new Set(formData.job_type_tags)),
    };

    setIsSaving(true);
    try {
      if (isEditMode && jobId) {
        await jobsApi.updateJob(jobId, payload);
      } else {
        await jobsApi.createJob(payload);
      }
      Alert.alert('Success', `Job ${isEditMode ? 'updated' : 'created'} successfully.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Save Failed', 'Unable to save job. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderOptionGroup = (
    options: { label: string; value: string }[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.optionRow}>
      {options.map(option => {
        const isSelected = option.value === selected;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionChip, isSelected && styles.optionChipActive]}
            onPress={() => onSelect(option.value)}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderJobTypeOptions = () => (
    <View style={styles.optionRow}>
      {JOB_TYPES.map(option => {
        const isSelected = formData.job_type_tags.includes(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionChip, isSelected && styles.optionChipActive]}
            onPress={() => toggleJobTypeTag(option.value)}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Quick Paste</Text>
      <Text style={styles.helperText}>
        Paste the raw placement notice below and tap “Auto-Fill Fields”. Review and adjust before saving.
      </Text>
      <Input
        label="Raw Job Text"
        placeholder="Paste the full job description here"
        value={rawText}
        onChangeText={setRawText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        style={styles.rawTextArea}
      />
      <View style={styles.rawActions}>
        <Button title="Auto-Fill Fields" onPress={handleAutofill} style={styles.rawButton} />
        <Button
          title="Clear"
          variant="outline"
          onPress={() => setRawText('')}
          style={styles.rawButton}
        />
      </View>

      <Text style={styles.sectionTitle}>Job Details</Text>
      <Input
        label="Job Title"
        placeholder="e.g. Software Engineer"
        value={formData.title}
        onChangeText={(value) => updateField('title', value)}
      />
      <Input
        label="Company"
        placeholder="e.g. TCS"
        value={formData.company}
        onChangeText={(value) => updateField('company', value)}
      />
      <Input
        label="Location"
        placeholder="City, State or Remote"
        value={formData.location}
        onChangeText={(value) => updateField('location', value)}
      />

      <Text style={styles.fieldLabel}>Job Types</Text>
      <Text style={styles.helperText}>
        Select all applicable job types. The first selected tag is shown as the primary type.
      </Text>
      {renderJobTypeOptions()}

      <Input
        label="Description"
        placeholder="Role overview, responsibilities"
        value={formData.description}
        onChangeText={(value) => updateField('description', value)}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        style={styles.textArea}
      />
      <Input
        label="Requirements"
        placeholder="Key requirements and qualifications"
        value={formData.requirements}
        onChangeText={(value) => updateField('requirements', value)}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textArea}
      />

      <Text style={styles.sectionTitle}>Compensation & Skills</Text>
      <View style={styles.row}>
        <Input
          label="Min Salary"
          placeholder="e.g. 350000"
          value={formData.salary_min}
          onChangeText={(value) => updateField('salary_min', value)}
          keyboardType="numeric"
          containerStyle={styles.half}
        />
        <Input
          label="Max Salary"
          placeholder="e.g. 600000"
          value={formData.salary_max}
          onChangeText={(value) => updateField('salary_max', value)}
          keyboardType="numeric"
          containerStyle={styles.half}
        />
      </View>
      <Input
        label="Experience Required"
        placeholder="e.g. 0-2 years"
        value={formData.experience_required}
        onChangeText={(value) => updateField('experience_required', value)}
      />
      <Input
        label="Skills (comma separated)"
        placeholder="React, Django, SQL"
        value={formData.skills_required}
        onChangeText={(value) => updateField('skills_required', value)}
      />

      <Text style={styles.sectionTitle}>Application Setup</Text>
      <Text style={styles.fieldLabel}>Apply Type</Text>
      {renderOptionGroup(APPLY_TYPES, formData.apply_type, (value) =>
        updateField('apply_type', value as ApplyType)
      )}

      <Input
        label={formData.apply_type === 'email' ? 'Apply Email' : 'Apply Link'}
        placeholder={
          formData.apply_type === 'email'
            ? 'careers@example.com'
            : 'https://forms.gle/...'
        }
        value={formData.apply_target}
        onChangeText={(value) => updateField('apply_target', value)}
      />
      {formData.apply_type === 'in_app' ? (
        <Text style={styles.helperText}>
          For in-app applications you can leave the apply target empty and it will default to
          “in_app”.
        </Text>
      ) : null}
      <Input
        label="Deadline (optional)"
        placeholder="YYYY-MM-DD"
        value={formData.deadline}
        onChangeText={(value) => updateField('deadline', value)}
      />

      <Text style={styles.sectionTitle}>Visibility & Alerts</Text>
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleLabel}>Active Listing</Text>
          <Text style={styles.toggleHint}>Show this job to students.</Text>
        </View>
        <Switch
          value={formData.active}
          onValueChange={(value) => updateField('active', value)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleLabel}>Featured</Text>
          <Text style={styles.toggleHint}>Highlight on the jobs feed.</Text>
        </View>
        <Switch
          value={formData.featured}
          onValueChange={(value) => updateField('featured', value)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleLabel}>Push Notification</Text>
          <Text style={styles.toggleHint}>Notify users when published.</Text>
        </View>
        <Switch
          value={formData.push_on_create}
          onValueChange={(value) => updateField('push_on_create', value)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title={isEditMode ? 'Update Job' : 'Create Job'}
          onPress={handleSave}
          isLoading={isSaving}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
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
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  optionTextActive: {
    color: theme.colors.text.light,
  },
  textArea: {
    minHeight: 110,
  },
  rawTextArea: {
    minHeight: 140,
  },
  rawActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  rawButton: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  half: {
    flex: 1,
  },
  helperText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  toggleLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
    color: theme.colors.text.primary,
  },
  toggleHint: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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
