import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { Button } from '../../components/Button';
import { theme } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>
            {user?.first_name} {user?.last_name || user?.username}
            </Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
        </View>

        {user?.phone ? (
            <View style={styles.section}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user.phone}</Text>
            </View>
        ) : null}

        <View style={styles.section}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user?.role?.toUpperCase()}</Text>
        </View>

        {user?.is_admin && (
            <Button
                title="Admin Dashboard"
                onPress={() => navigation.navigate('AdminDashboard')}
                style={styles.adminButton}
                variant="secondary"
            />
        )}

        <Button
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
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
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary,
  },
  headerSubtitle: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
  },
  content: {
      padding: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium as any,
  },
  logoutButton: {
    marginTop: theme.spacing.xl,
    borderColor: theme.colors.error,
  },
  adminButton: {
      marginTop: theme.spacing.md,
  },
});
