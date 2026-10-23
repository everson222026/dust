import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  ThemedIonicons as Ionicons,
  ThemedSafeAreaView as SafeAreaView,
  ThemedText as Text,
  ThemedTextInput as TextInput,
  ThemedView as View,
} from '../theme/SmartThemedComponents';
import { useAppTheme } from '../theme/ThemeContext';
import {
  Conversation,
  getConversations,
  getSession,
  getUsers,
  User,
} from '../storage/storage';

export default function MensagensScreen() {
  const router = useRouter();
  const { isDark, highContrast } = useAppTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const palette = isDark
    ? {
        background: highContrast ? '#11110F' : '#191815',
        card: highContrast ? '#1F1E19' : '#282620',
        input: highContrast ? '#171713' : '#211F1B',
        border: highContrast ? '#716B5E' : '#4A4439',
        text: '#FFFFFF',
        secondary: highContrast ? '#FFFFFF' : '#D0C4B0',
        accent: highContrast ? '#D8FFF2' : '#B9D8D0',
        unread: '#E3B86B',
      }
    : {
        background: '#F2E1C7',
        card: '#E3D2B5',
        input: '#F8EFDF',
        border: highContrast ? '#816A45' : '#C8B58F',
        text: highContrast ? '#24120F' : '#3D0404',
        secondary: highContrast ? '#40270E' : '#644219',
        accent: highContrast ? '#17453F' : '#2F524F',
        unread: '#A61D1D',
      };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = await getSession();
      setCurrentUser(session);
      if (!session) {
        setUsers([]);
        setConversations([]);
        return;
      }

      const [allUsers, inbox] = await Promise.all([
        getUsers(),
        getConversations(session.id),
      ]);
      setUsers(allUsers.filter(person => person.id !== session.id));
      setConversations(inbox);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível abrir suas mensagens.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const normalizedSearch = normalize(search.trim());
  const visibleConversations = useMemo(
    () => conversations.filter(conversation =>
      normalize(
        `${conversation.user.name} ${conversation.user.username} ${conversation.lastMessage.text}`,
      ).includes(normalizedSearch),
    ),
    [conversations, normalizedSearch],
  );
  const visibleContacts = useMemo(
    () => users
      .filter(user => normalize(`${user.name} ${user.username}`).includes(normalizedSearch))
      .slice(0, search.trim() ? 12 : 8),
    [users, normalizedSearch, search],
  );

  function openConversation(person: User) {
    if (!currentUser) {
      router.push({ pathname: '/login', params: { mode: 'login' } });
      return;
    }
    router.push({ pathname: '/mensagens/[id]', params: { id: person.id } });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: palette.secondary }]}>MUSEU DO INUSITADO</Text>
            <Text style={[styles.title, { color: palette.text }]}>Mensagens</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={showContacts ? 'Fechar lista de visitantes' : 'Iniciar uma nova conversa'}
            onPress={() => setShowContacts(value => !value)}
            style={[styles.newMessageButton, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Ionicons name={showContacts ? 'close' : 'create-outline'} size={22} color={palette.accent} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: palette.secondary }]}>Troque histórias e descubra o que mais anda sem serventia por aí.</Text>

        <View style={[styles.search, { backgroundColor: palette.input, borderColor: palette.border }]}>
          <Ionicons name="search-outline" size={18} color={palette.secondary} />
          <TextInput
            accessibilityLabel="Pesquisar conversas e visitantes"
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: palette.text }]}
            placeholder="Pesquisar pessoas ou conversas"
            placeholderTextColor={palette.secondary}
            returnKeyType="search"
          />
          {!!search && (
            <TouchableOpacity accessibilityLabel="Limpar busca" onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={palette.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {currentUser && showContacts && visibleContacts.length > 0 && (
          <View style={styles.contactsSection}>
            <View style={styles.sectionHeading}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Encontrar visitantes</Text>
              <Text style={[styles.sectionHint, { color: palette.secondary }]}>TOQUE PARA CONVERSAR</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contacts}>
              {visibleContacts.map(person => (
                <TouchableOpacity
                  key={person.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Conversar com ${person.name}`}
                  onPress={() => openConversation(person)}
                  style={styles.contact}
                >
                  <Avatar user={person} size={61} borderColor={palette.unread} />
                  <Text numberOfLines={1} style={[styles.contactName, { color: palette.text }]}>{firstName(person.name)}</Text>
                  <Text numberOfLines={1} style={[styles.contactUsername, { color: palette.secondary }]}>@{person.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inboxHeading}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Sua caixa de entrada</Text>
          <Text style={[styles.inboxCount, { color: palette.secondary }]}>{visibleConversations.length} {visibleConversations.length === 1 ? 'conversa' : 'conversas'}</Text>
        </View>

        {loading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={palette.accent} />
            <Text style={[styles.feedbackText, { color: palette.secondary }]}>Abrindo sua correspondência...</Text>
          </View>
        ) : error ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="cloud-offline-outline" size={34} color={palette.secondary} />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>Não foi possível carregar</Text>
            <Text style={[styles.emptyText, { color: palette.secondary }]}>{error}</Text>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: palette.accent }]} onPress={() => void load()}>
              <Text style={[styles.actionText, { color: isDark ? '#191815' : '#F2E1C7' }]}>TENTAR DE NOVO</Text>
            </TouchableOpacity>
          </View>
        ) : !currentUser ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: palette.input }]}>
              <Ionicons name="chatbubbles-outline" size={28} color={palette.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>Entre para conversar</Text>
            <Text style={[styles.emptyText, { color: palette.secondary }]}>Acesse sua conta para trocar mensagens com outros visitantes do Museu.</Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: palette.accent }]}
              onPress={() => router.push({ pathname: '/login', params: { mode: 'login' } })}
            >
              <Text style={[styles.actionText, { color: isDark ? '#191815' : '#F2E1C7' }]}>ENTRAR NA MINHA CONTA</Text>
            </TouchableOpacity>
          </View>
        ) : visibleConversations.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: palette.input }]}>
              <Ionicons name="mail-open-outline" size={28} color={palette.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>{search ? 'Ninguém encontrado' : 'Sua caixa está em silêncio'}</Text>
            <Text style={[styles.emptyText, { color: palette.secondary }]}>{search ? 'Tente outro nome ou termo.' : 'Toque no botão no topo e escolha um visitante para começar uma conversa.'}</Text>
          </View>
        ) : (
          <View style={styles.conversationList}>
            {visibleConversations.map(conversation => (
              <ConversationRow
                key={conversation.user.id}
                conversation={conversation}
                currentUserId={currentUser.id}
                palette={palette}
                onPress={() => openConversation(conversation.user)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ConversationRow({
  conversation,
  currentUserId,
  palette,
  onPress,
}: {
  conversation: Conversation;
  currentUserId: string;
  palette: { text: string; secondary: string; border: string; unread: string };
  onPress: () => void;
}) {
  const fromMe = conversation.lastMessage.senderId === currentUserId;
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.conversationRow}>
      <Avatar user={conversation.user} size={54} borderColor={palette.unread} />
      <View style={styles.conversationCopy}>
        <View style={styles.conversationTopLine}>
          <Text numberOfLines={1} style={[styles.personName, { color: palette.text }]}>{conversation.user.name}</Text>
          <Text style={[styles.time, { color: palette.secondary }]}>{formatTime(conversation.lastMessage.createdAt)}</Text>
        </View>
        <View style={styles.previewLine}>
          <Text numberOfLines={1} style={[styles.preview, { color: palette.secondary, fontWeight: conversation.unreadCount ? '800' : '400' }]}>
            {fromMe ? 'Você: ' : ''}{conversation.lastMessage.text}
          </Text>
          {!!conversation.unreadCount && <View style={[styles.unreadDot, { backgroundColor: palette.unread }]} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Avatar({ user, size, borderColor }: { user: User; size: number; borderColor: string }) {
  return (
    <View style={[styles.avatarRing, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, borderColor }]}>
      {user.photo ? (
        <Image source={{ uri: user.photo }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Ionicons name="person" size={size * 0.46} color="#2F524F" />
        </View>
      )}
    </View>
  );
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function firstName(name: string) {
  return name.split(' ')[0];
}

function formatTime(timestamp: number) {
  const elapsed = Math.max(0, Date.now() - timestamp);
  if (elapsed < 60_000) return 'agora';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} min`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} h`;
  return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 34 },
  header: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { gap: 2 },
  eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1.25 },
  title: { fontSize: 25, fontWeight: '900', letterSpacing: 0.1 },
  newMessageButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  search: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 18, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13 },
  searchInput: { flex: 1, fontSize: 12, paddingVertical: 10 },
  contactsSection: { marginTop: 23 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionTitle: { fontSize: 14, fontWeight: '900' },
  sectionHint: { fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  contacts: { gap: 13, paddingVertical: 2, paddingRight: 8 },
  contact: { width: 68, alignItems: 'center', gap: 3 },
  contactName: { maxWidth: 68, fontSize: 10, fontWeight: '800', marginTop: 2 },
  contactUsername: { maxWidth: 68, fontSize: 8 },
  inboxHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 25, marginBottom: 7 },
  inboxCount: { fontSize: 10 },
  conversationList: { marginTop: 2 },
  conversationRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, padding: 1.5 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#D6C29D' },
  conversationCopy: { flex: 1, minHeight: 58, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C8B58F' },
  conversationTopLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  personName: { flex: 1, fontSize: 12, fontWeight: '900' },
  time: { fontSize: 9 },
  previewLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  preview: { flex: 1, fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  feedback: { minHeight: 170, alignItems: 'center', justifyContent: 'center', gap: 10 },
  feedbackText: { fontSize: 12 },
  emptyCard: { alignItems: 'center', borderWidth: 1, borderRadius: 17, paddingHorizontal: 22, paddingVertical: 28, marginTop: 11 },
  emptyIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 29 },
  emptyTitle: { fontSize: 15, fontWeight: '900', textAlign: 'center', marginTop: 12 },
  emptyText: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  actionButton: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 11, marginTop: 16 },
  actionText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
});
