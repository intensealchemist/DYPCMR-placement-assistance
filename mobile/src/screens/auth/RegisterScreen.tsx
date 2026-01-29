import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { theme } from '../../theme';
import { Logo } from '../../components/Logo';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.username || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await dispatch(register(formData)).unwrap();
      Alert.alert(
        'Success',
        'Registration successful! Please log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', JSON.stringify(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo width={220} />
          <Text style={styles.title}>Create Account</Text>
        </View>

        <Input
          placeholder="Email *"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          label="Email Address"
        />

        <Input
          placeholder="Username *"
          value={formData.username}
          onChangeText={(value) => handleChange('username', value)}
          autoCapitalize="none"
          label="Username"
        />

        <View style={styles.row}>
            <View style={styles.half}>
                <Input
                    placeholder="First Name"
                    value={formData.first_name}
                    onChangeText={(value) => handleChange('first_name', value)}
                    label="First Name"
                />
            </View>
            <View style={styles.half}>
                <Input
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChangeText={(value) => handleChange('last_name', value)}
                    label="Last Name"
                />
            </View>
        </View>

        <Input
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          keyboardType="phone-pad"
          label="Phone Number"
        />

        <Input
          placeholder="Password *"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry
          autoCapitalize="none"
          label="Password"
        />

        <Input
          placeholder="Confirm Password *"
          value={formData.password_confirm}
          onChangeText={(value) => handleChange('password_confirm', value)}
          secureTextEntry
          autoCapitalize="none"
          label="Confirm Password"
        />

        <Button
          title="Sign Up"
          onPress={handleRegister}
          isLoading={isLoading}
          style={styles.button}
        />

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.sm,
  },
  linkButton: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  half: {
      width: '48%',
  },
});
