import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/SmartThemedComponents';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import PublicationCard from '../components/PublicationCard';
import { goBackOrReplace } from '../lib/navigation';
import { getSavedPosts, getSession, Post } from '../storage/storage';
import { useAppTheme } from '../theme/ThemeContext';

export default function SalvosScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setMessage('');
      const user = await getSession();
      if (!user) {
        router.replace('/login');
        return;
      }
      setPosts(await getSavedPosts(user.id));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os itens salvos.'
      );
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Voltar ao perfil"
            onPress={() => goBackOrReplace(router, '/perfil')}
          >
            <Ionicons name="arrow-back" size={22} color={palette.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.text }]}>ITENS SALVOS</Text>
          <View style={styles.spacer} />
        </View>
        <Text style={[styles.subtitle, { color: palette.secondary }]}>
          Um cantinho para guardar as peças que você quer revisitar.
        </Text>

        {message ? (
          <Text style={styles.empty}>{message}</Text>
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={43} color={palette.accent} />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>Sua vitrine está vazia</Text>
            <Text style={[styles.empty, { color: palette.secondary }]}>
              Toque no marcador de uma peça para guardá-la aqui.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: palette.accent, borderColor: palette.gold }]}
              onPress={() => router.push('/acervo')}
            >
              <Text style={[styles.buttonText, { color: palette.background }]}>EXPLORAR O ACERVO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {posts.map(post => (
              <PublicationCard
                key={post.id}
                post={post}
                onPostRemoved={postId => setPosts(current => current.filter(item => item.id !== postId))}
                onPostUpdated={updated => setPosts(current => current.map(item => item.id === updated.id ? updated : item))}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2E1C7' },
  page: { flexGrow: 1, padding: 18, paddingBottom: 40 },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: '#3D0404', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  spacer: { width: 22 },
  subtitle: { color: '#644219', fontSize: 12, lineHeight: 18, marginTop: 8 },
  list: { marginTop: 17 },
  emptyState: { flex: 1, minHeight: 330, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 },
  emptyTitle: { color: '#3D0404', fontSize: 16, fontWeight: '900', marginTop: 10 },
  empty: { color: '#644219', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 },
  button: { marginTop: 17, borderRadius: 9, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 11 },
  buttonText: { fontSize: 12, fontWeight: '900' },
});
