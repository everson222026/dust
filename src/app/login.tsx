import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedTextInput as TextInput, ThemedView as View } from '../theme/ThemedComponents';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { goBackOrReplace } from '../lib/navigation';
import {
  signIn,
  signUp,
  startDemoSession,
} from '../storage/storage';
import { isSupabaseConfigured } from '../lib/supabase';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const router = useRouter();
  const { mode: requestedMode } = useLocalSearchParams<{ mode?: string }>();

  const [modeState, setModeState] = useState(() => ({
    routeMode: requestedMode,
    selectedMode: requestedMode === 'register' ? 'register' as Mode : 'login' as Mode,
  }));
  const mode: Mode =
    modeState.routeMode === requestedMode
      ? modeState.selectedMode
      : requestedMode === 'register'
        ? 'register'
        : 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  function changeMode(newMode: Mode) {
    setModeState({ routeMode: requestedMode, selectedMode: newMode });

    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    );
  }

  async function handleGuestAccess() {
    try {
      setLoading(true);
      if (!isSupabaseConfigured()) {
        await startDemoSession();
      }
      router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Não foi possível abrir a visita local',
        error instanceof Error
          ? error.message
          : 'Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha seu e-mail e sua senha.'
      );
      return;
    }

    try {
      setLoading(true);

      const user = await signIn(cleanEmail, password);
      if (!user) {
        Alert.alert(
          'Não foi possível entrar',
          'E-mail ou senha incorretos.'
        );
        return;
      }

      router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o login.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha todos os campos.'
      );
      return;
    }

    if (!validateEmail(cleanEmail)) {
      Alert.alert(
        'E-mail inválido',
        'Digite um e-mail válido.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Senha muito curta',
        'A senha precisa ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Senhas diferentes',
        'As senhas precisam ser iguais.'
      );
      return;
    }

    try {
      setLoading(true);

      const hasSession = await signUp(
        cleanEmail,
        password,
        cleanName
      );

      if (hasSession) {
        router.replace('/home');
      } else {
        Alert.alert(
          'Confirme seu e-mail',
          'Enviamos um link de confirmação. Depois, entre com seu e-mail e senha.'
        );
        changeMode('login');
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar ao Museu"
            style={styles.backButton}
            onPress={() => goBackOrReplace(router, '/perfil')}
          >
            <Ionicons name="arrow-back" size={22} color="#3D0404" />
          </TouchableOpacity>

          <View style={styles.brandArea}>
            <Image
              source={require('../../assets/images/logo-dust.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brandTitle}>
              MUSEU DO INUSITADO
            </Text>

            <Text style={styles.brandSubtitle}>
              Onde nada serve para nada,
              {'\n'}
              mas tudo tem uma história.
            </Text>
          </View>

          <View style={styles.card}>
            {!isSupabaseConfigured() ? (
              <>
                <View style={styles.localBadge}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={15}
                    color="#2F524F"
                  />
                  <Text style={styles.localBadgeText}>
                    VISITA DE DEMONSTRAÇÃO
                  </Text>
                </View>

                <Text style={styles.title}>
                  {requestedMode === 'register'
                    ? 'Cadastro online indisponível'
                    : requestedMode === 'login'
                      ? 'Login online indisponível'
                      : 'Entre sem criar conta'}
                </Text>

                <Text style={styles.subtitle}>
                  {requestedMode
                    ? 'Configure o serviço Supabase para habilitar login e cadastro de contas.'
                    : 'Explore o acervo como visitante. Suas interações ficam salvas somente neste dispositivo.'}
                </Text>

                <View style={styles.localInfo}>
                  <Ionicons
                    name="archive-outline"
                    size={20}
                    color="#2F524F"
                  />
                  <Text style={styles.localInfoText}>
                    Peças e visitantes de exemplo já estão esperando por você.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleGuestAccess}
                  disabled={loading}
                >
                  <Text style={styles.primaryText}>
                    {loading ? 'PREPARANDO O MUSEU...' : 'ENTRAR COMO VISITANTE'}
                  </Text>

                  {!loading && (
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#F2E1C7"
                    />
                  )}
                </TouchableOpacity>

                <Text style={styles.localFootnote}>
                  {requestedMode
                    ? 'A visita de demonstração continua disponível sem conta.'
                    : 'Sem e-mail, senha ou cadastro. Ideal para apresentar o DUST.'}
                </Text>
              </>
            ) : (
              <>

            <Text style={styles.eyebrow}>
              ÁREA DO VISITANTE
            </Text>

            <Text style={styles.title}>
              {mode === 'login'
                ? 'Entrar no Museu'
                : 'Criar conta'}
            </Text>

            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Continue sua jornada pelo acervo.'
                : 'Faça parte do Museu do Inusitado.'}
            </Text>

            <View style={styles.switch}>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  mode === 'login' &&
                    styles.switchActive,
                ]}
                onPress={() =>
                  changeMode('login')
                }
              >
                <Text
                  style={[
                    styles.switchText,
                    mode === 'login' &&
                      styles.switchTextActive,
                  ]}
                >
                  ENTRAR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchButton,
                  mode === 'register' &&
                    styles.switchActive,
                ]}
                onPress={() =>
                  changeMode('register')
                }
              >
                <Text
                  style={[
                    styles.switchText,
                    mode === 'register' &&
                      styles.switchTextActive,
                  ]}
                >
                  CADASTRO
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'register' && (
              <Field
                label="NOME"
                icon="person-outline"
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
                maxLength={60}
              />
            )}

            <Field
              label="E-MAIL"
              icon="mail-outline"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.label}>
              SENHA
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#75624B"
              />

              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#9A8D78"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    value => !value
                  )
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={19}
                  color="#75624B"
                />
              </TouchableOpacity>
            </View>

            {mode === 'register' && (
              <Field
                label="CONFIRMAR SENHA"
                icon="lock-closed-outline"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={
                mode === 'login'
                  ? handleLogin
                  : handleRegister
              }
              disabled={loading || !isSupabaseConfigured()}
            >
              <Text style={styles.primaryText}>
                {loading
                  ? 'AGUARDE...'
                  : mode === 'login'
                    ? 'ENTRAR'
                    : 'CRIAR CONTA'}
              </Text>

              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#F2E1C7"
                />
              )}
            </TouchableOpacity>
              </>
            )}
            {isSupabaseConfigured() && (
              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleGuestAccess}
                disabled={loading}
              >
                <Text style={styles.guestButtonText}>
                  CONTINUAR COMO VISITANTE
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
}: {
  label: string;
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: any;
  maxLength?: number;
}) {
  return (
    <>
      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.inputWrapper}>
        <Ionicons
          name={icon}
          size={19}
          color="#75624B"
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9A8D78"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={maxLength}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E1C7',
  },

  page: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  backButton: {
    alignSelf: 'flex-start',
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  brandArea: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logo: {
    width: 180,
    height: 130,
  },

  brandTitle: {
    color: '#2F524F',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 1,
  },

  brandSubtitle: {
    marginTop: 7,
    color: '#644219',
    textAlign: 'center',
    lineHeight: 21,
    fontSize: 13,
  },

  card: {
    width: '100%',
    maxWidth: 470,
    backgroundColor: '#E3D2B5',
    borderWidth: 1,
    borderColor: '#C5AE8B',
    borderRadius: 18,
    padding: 20,
  },

  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 11,
    borderRadius: 9,
    backgroundColor: '#D6C29D',
  },

  localBadgeText: {
    color: '#2F524F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  localInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: '#F2E1C7',
  },

  localInfoText: {
    flex: 1,
    color: '#644219',
    fontSize: 11,
    lineHeight: 16,
  },

  localFootnote: {
    color: '#776650',
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.65,
  },

  eyebrow: {
    color: '#595626',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  title: {
    marginTop: 5,
    color: '#3D0404',
    fontSize: 29,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: 5,
    color: '#644219',
    fontSize: 12,
  },

  switch: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    padding: 3,
  },

  switchButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },

  switchActive: {
    backgroundColor: '#2F524F',
  },

  switchText: {
    color: '#644219',
    fontSize: 10,
    fontWeight: '900',
  },

  switchTextActive: {
    color: '#F2E1C7',
  },

  label: {
    color: '#595626',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 0.6,
  },

  inputWrapper: {
    minHeight: 48,
    backgroundColor: '#F2E1C7',
    borderWidth: 1,
    borderColor: '#C5AE8B',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    marginLeft: 9,
    color: '#332920',
    fontSize: 13,
  },

  primaryButton: {
    minHeight: 50,
    marginTop: 22,
    backgroundColor: '#3D0404',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  primaryText: {
    color: '#F2E1C7',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginRight: 8,
  },

  guestButton: {
    minHeight: 46,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2F524F',
  },

  guestButtonText: {
    color: '#2F524F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});