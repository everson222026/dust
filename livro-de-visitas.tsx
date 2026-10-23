import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText as Text, ThemedTextInput as TextInput } from '../theme/ThemedComponents';
import { useMuseumAudio } from '../components/museum/MuseumAudioProvider';
import { GuestbookEntry, getGuestbookEntries, signGalleryGuestbook } from '../storage/museumFeatures';
import { getSession } from '../storage/storage';
import { useMuseumPalette } from '../theme/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';

export default function GuestbookScreen() {
  const router = useRouter();
  const palette = useMuseumPalette();
  const { playEffect } = useMuseumAudio();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [visitorName, setVisitorName] = useState('Visitante');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [items, user] = await Promise.all([getGuestbookEntries(), getSession()]);
      setEntries(items);
      if (user) setVisitorName(user.name);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível abrir o livro agora.');
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function sign() {
    if (sending) return;
    setSending(true);
    try {
      setEntries(await signGalleryGuestbook(message));
      setMessage('');
      setError('');
      playEffect('chime');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível deixar sua assinatura.');
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: palette.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={[styles.back, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <Ionicons name="arrow-back" size={20} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.heading}>
          <Text style={[styles.eyebrow, { color: palette.accent }]}>MEMÓRIA DA VISITA</Text>
          <Text style={[styles.title, { color: palette.text }]}>Livro de visitas</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <>
            <View style={[styles.book, { backgroundColor: palette.surface, borderColor: palette.gold }]}>
              <View style={[styles.bookSpine, { backgroundColor: palette.accent }]} />
              <View style={styles.bookInside}>
                <Ionicons name="book-outline" size={22} color={palette.gold} />
                <Text style={[styles.bookTitle, { color: palette.text }]}>Uma lembrança da sua visita</Text>
                <Text style={[styles.bookText, { color: palette.secondary }]}>Deixe uma frase, uma impressão ou a história de um objeto que ficou com você.</Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Escreva com sua própria voz…"
                  placeholderTextColor={palette.muted}
                  multiline
                  maxLength={360}
                  textAlignVertical="top"
                  style={[styles.input, { backgroundColor: palette.background, borderColor: palette.border, color: palette.text }]}
                />
                <View style={styles.signRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.signedBy, { color: palette.secondary }]}>ASSINA</Text>
                    <Text numberOfLines={1} style={[styles.signature, { color: palette.wine }]}>{visitorName}</Text>
                  </View>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Assinar o livro de visitas" disabled={sending} onPress={() => { void sign(); }} style={[styles.signButton, { backgroundColor: palette.accent, opacity: sending ? 0.6 : 1 }]}>
                    <Ionicons name="create-outline" size={16} color={palette.background} />
                    <Text style={[styles.signButtonText, { color: palette.background }]}>{sending ? 'REGISTRANDO' : 'ASSINAR'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.counter, { color: palette.muted }]}>{message.length}/360 · {isSupabaseConfigured() ? 'Livro coletivo da galeria' : 'Livro de demonstração neste aparelho'}</Text>
              </View>
            </View>
            {!!error && <Text style={[styles.error, { color: palette.wine }]}>{error}</Text>}
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Quem já passou por aqui</Text>
          </>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: palette.secondary }]}>A primeira página ainda está em branco. Sua assinatura pode inaugurá-la.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.entry, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={[styles.entrySeal, { backgroundColor: palette.accentSoft }]}>
              <Ionicons name="create-outline" size={15} color={palette.accent} />
            </View>
            <View style={styles.entryCopy}>
              <Text style={[styles.entryMessage, { color: palette.text }]}>{item.message}</Text>
              <View style={styles.entryMeta}>
                <Text style={[styles.entryName, { color: palette.wine }]}>— {item.authorName}</Text>
                <Text style={[styles.entryDate, { color: palette.muted }]}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 18, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, height: 40, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, alignItems: 'center' },
  eyebrow: { fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontFamily: 'serif', fontSize: 22, fontWeight: '700', marginTop: 2 },
  list: { paddingHorizontal: 17, paddingTop: 15, paddingBottom: 36 },
  book: { minHeight: 270, borderWidth: 1.5, borderRadius: 14, flexDirection: 'row', overflow: 'hidden' },
  bookSpine: { width: 9 },
  bookInside: { flex: 1, padding: 15 },
  bookTitle: { fontFamily: 'serif', fontSize: 17, fontWeight: '700', marginTop: 7 },
  bookText: { fontSize: 11, lineHeight: 17, marginTop: 5 },
  input: { minHeight: 82, maxHeight: 130, borderWidth: 1, borderRadius: 9, padding: 11, marginTop: 12, fontSize: 12, lineHeight: 18 },
  signRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  signedBy: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  signature: { fontFamily: 'serif', fontStyle: 'italic', fontSize: 14, marginTop: 2 },
  signButton: { minHeight: 39, paddingHorizontal: 12, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  signButtonText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  counter: { textAlign: 'right', fontSize: 8, marginTop: 8 },
  sectionTitle: { fontFamily: 'serif', fontSize: 17, fontWeight: '700', marginTop: 21, marginBottom: 10 },
  empty: { fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 24 },
  entry: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  entrySeal: { width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  entryCopy: { flex: 1, marginLeft: 10 },
  entryMessage: { fontFamily: 'serif', fontSize: 13, lineHeight: 20 },
  entryMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  entryName: { fontSize: 10, fontStyle: 'italic', fontWeight: '700' },
  entryDate: { fontSize: 9 },
  error: { fontSize: 10, marginTop: 9 },
});
