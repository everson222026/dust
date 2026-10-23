import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText as Text, ThemedTextInput as TextInput } from '../theme/ThemedComponents';
import { useMuseumAudio } from '../components/museum/MuseumAudioProvider';
import { Post, getPosts, getSession } from '../storage/storage';
import { CollectionRoom, createCollectionRoom, getCollectionRooms, togglePostInRoom } from '../storage/museumFeatures';
import { useMuseumPalette } from '../theme/ThemeContext';

export default function CuradoriaScreen() {
  const router = useRouter();
  const palette = useMuseumPalette();
  const { playEffect } = useMuseumAudio();
  const [rooms, setRooms] = useState<CollectionRoom[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const visitor = await getSession();
      if (!visitor) {
        router.replace('/login');
        return;
      }
      const [roomList, postList] = await Promise.all([getCollectionRooms(), getPosts()]);
      setRooms(roomList);
      setPosts(postList);
      setSelectedRoomId(current => current || roomList[0]?.id || '');
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível abrir sua curadoria.');
    }
  }, [router]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const selectedRoom = rooms.find(room => room.id === selectedRoomId);
  const curatedPosts = posts.filter(post => selectedRoom?.postIds.includes(post.id));

  async function saveRoom() {
    try {
      const nextRooms = await createCollectionRoom(roomName);
      setRooms(nextRooms);
      setSelectedRoomId(nextRooms[0]?.id ?? '');
      setRoomName('');
      setCreating(false);
      playEffect('chime');
    } catch (reason) {
      Alert.alert('Sua nova sala', reason instanceof Error ? reason.message : 'Não foi possível criar a sala.');
    }
  }

  async function toggle(postId: string) {
    try {
      setRooms(await togglePostInRoom(selectedRoomId, postId));
      playEffect('chime');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar a sala.');
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Ionicons name="arrow-back" size={20} color={palette.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: palette.accent }]}>SUA EXPOSIÇÃO PARTICULAR</Text>
            <Text style={[styles.title, { color: palette.text }]}>Curadoria</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Criar sala de exposição" onPress={() => setCreating(value => !value)} style={[styles.iconButton, { backgroundColor: palette.accentSoft, borderColor: palette.border }]}>
            <Ionicons name={creating ? 'close' : 'add'} size={22} color={palette.accent} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.intro, { color: palette.secondary }]}>Guarde ideias, objetos e publicações em salas que contam a sua própria história.</Text>

        {creating && (
          <View style={[styles.createPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Abrir uma nova sala</Text>
            <TextInput value={roomName} onChangeText={setRoomName} placeholder="Ex.: Objetos que quase funcionam" placeholderTextColor={palette.muted} maxLength={36} style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.background }]} />
            <TouchableOpacity accessibilityRole="button" onPress={() => { void saveRoom(); }} style={[styles.primaryButton, { backgroundColor: palette.accent }]}>
              <Text style={[styles.primaryButtonText, { color: palette.background }]}>CRIAR SALA</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Salas de exposição</Text>
          <Text style={[styles.count, { color: palette.muted }]}>{rooms.length} salas</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rooms}>
          {rooms.map((room, index) => {
            const active = room.id === selectedRoomId;
            return (
              <TouchableOpacity key={room.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => { setSelectedRoomId(room.id); playEffect('chime'); }} style={[styles.roomCard, { backgroundColor: active ? palette.accentSoft : palette.surface, borderColor: active ? palette.gold : palette.border }]}>
                <View style={styles.roomTop}>
                  <Ionicons name={index === 0 ? 'heart-outline' : index === 1 ? 'construct-outline' : 'sparkles-outline'} size={18} color={active ? palette.accent : palette.muted} />
                  <Text style={[styles.roomCount, { color: palette.secondary }]}>{room.postIds.length} peças</Text>
                </View>
                <Text numberOfLines={2} style={[styles.roomTitle, { color: palette.text }]}>{room.title}</Text>
                <Text numberOfLines={2} style={[styles.roomDescription, { color: palette.secondary }]}>{room.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!!selectedRoom && (
          <View style={[styles.selectedBanner, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <Ionicons name="albums-outline" size={19} color={palette.gold} />
            <View style={{ flex: 1, marginLeft: 9 }}>
              <Text style={[styles.selectedTitle, { color: palette.text }]}>{selectedRoom.title}</Text>
              <Text style={[styles.selectedDescription, { color: palette.secondary }]}>{curatedPosts.length ? `${curatedPosts.length} peça${curatedPosts.length === 1 ? '' : 's'} nesta sala` : 'Ainda sem peças. Escolha algo no acervo abaixo.'}</Text>
            </View>
          </View>
        )}

        {!!error && <Text style={[styles.error, { color: palette.wine }]}>{error}</Text>}

        {curatedPosts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, styles.collectionHeading, { color: palette.text }]}>Obras nesta sala</Text>
            {curatedPosts.map(post => <CuratedPost key={post.id} post={post} palette={palette} selected onPress={() => { void toggle(post.id); }} />)}
          </>
        )}

        <Text style={[styles.sectionTitle, styles.collectionHeading, { color: palette.text }]}>Escolha peças do acervo</Text>
        <Text style={[styles.helper, { color: palette.secondary }]}>Toque em uma peça para incluir ou retirar da sala selecionada.</Text>
        {posts.map(post => <CuratedPost key={`all-${post.id}`} post={post} palette={palette} selected={Boolean(selectedRoom?.postIds.includes(post.id))} onPress={() => { void toggle(post.id); }} />)}
      </ScrollView>
    </View>
  );
}

function CuratedPost({ post, palette, selected, onPress }: { post: Post; palette: ReturnType<typeof useMuseumPalette>; selected: boolean; onPress: () => void }) {
  const image = post.image?.trim() || 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=500&q=80';
  return (
    <View style={[styles.postRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Image source={{ uri: image }} resizeMode="cover" style={styles.postImage} />
      <View style={styles.postCopy}>
        <Text numberOfLines={2} style={[styles.postTitle, { color: palette.text }]}>{post.title}</Text>
        <Text numberOfLines={1} style={[styles.postAuthor, { color: palette.secondary }]}>{post.authorName} · {post.category}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${selected ? 'Retirar' : 'Adicionar'} ${post.title} ${selected ? 'da' : 'à'} sala`} onPress={onPress} style={[styles.postAction, { backgroundColor: selected ? palette.accentSoft : palette.accent }]}>
        <Ionicons name={selected ? 'checkmark' : 'add'} size={19} color={selected ? palette.accent : palette.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { padding: 18, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  iconButton: { width: 40, height: 40, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { alignItems: 'center', flex: 1 },
  eyebrow: { fontSize: 8, fontWeight: '800', letterSpacing: 1.3 },
  title: { fontFamily: 'serif', fontSize: 25, fontWeight: '700', marginTop: 2 },
  intro: { fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 360, alignSelf: 'center', marginBottom: 17 },
  createPanel: { padding: 13, borderWidth: 1, borderRadius: 14, marginBottom: 16 },
  input: { minHeight: 45, borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, marginTop: 10, fontSize: 12 },
  primaryButton: { minHeight: 41, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  primaryButtonText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontFamily: 'serif', fontSize: 17, fontWeight: '700' },
  count: { fontSize: 10 },
  rooms: { gap: 9, paddingBottom: 3, paddingRight: 12 },
  roomCard: { width: 168, minHeight: 117, borderWidth: 1, borderRadius: 14, padding: 12 },
  roomTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomCount: { fontSize: 9 },
  roomTitle: { fontFamily: 'serif', fontWeight: '700', fontSize: 14, marginTop: 11 },
  roomDescription: { fontSize: 9, lineHeight: 13, marginTop: 4 },
  selectedBanner: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginTop: 14 },
  selectedTitle: { fontSize: 12, fontWeight: '800' },
  selectedDescription: { fontSize: 10, marginTop: 3 },
  collectionHeading: { marginTop: 22, marginBottom: 8 },
  helper: { fontSize: 10, marginTop: -3, marginBottom: 10 },
  postRow: { minHeight: 73, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 8 },
  postImage: { width: 53, height: 53, borderRadius: 8, backgroundColor: '#D6C29D' },
  postCopy: { flex: 1, marginHorizontal: 10 },
  postTitle: { fontFamily: 'serif', fontWeight: '700', fontSize: 12 },
  postAuthor: { fontSize: 9, marginTop: 4 },
  postAction: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 11, marginTop: 10 },
});
