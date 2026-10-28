import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de ter instalado o @expo/vector-icons

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const router = useRouter();

  const handleLogin = () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Preencha todos os campos para continuar.');
      return;
    }

    setIsLoading(true);

    // Simulando uma requisição de autenticação de 1.5 segundos
    setTimeout(() => {
      setIsLoading(false);
      // Aqui entraria sua lógica real de login (Firebase, API, etc.)
      router.replace('/dashboard'); // Redireciona para a rota interna do app
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <View style={styles.headerContainer}>
        <View style={styles.logoIcon}>
          <Ionicons name="flash" size={32} color="#38bdf8" />
        </View>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Faça login para acessar sua conta</Text>
      </View>

      <View style={styles.formContainer}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#f87171" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#94a3b8" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Não tem uma conta? </Text>
        <TouchableOpacity>
          <Text style={styles.signupText}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Tom elegante de azul escuro (Slate)
    justifyContent: 'space-between',
    padding: 24,
  },
  headerContainer: {
    marginTop: 60,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  formContainer: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    height: 56,
    backgroundColor: '#0284c7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#0369a1',
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signupText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
});