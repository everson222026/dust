import { useRouter } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { goBackOrReplace } from '../lib/navigation';
import { useAppTheme } from '../theme/ThemeContext';
import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/SmartThemedComponents';
import { useMuseumAudio } from '../components/museum/MuseumAudioProvider';

export default function MenuScreen() {
  const router = useRouter();
  const { palette: museumPalette } = useAppTheme();
  const { playEffect } = useMuseumAudio();

  const palette = {
    background: museumPalette.background,
    card: museumPalette.surface,
    border: museumPalette.border,
    text: museumPalette.text,
    secondary: museumPalette.secondary,
  };
  const go = (route: Parameters<typeof router.push>[0]) => { playEffect('chime'); router.push(route); };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.page}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>
            MENU
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
            onPress={() => goBackOrReplace(router, '/home')}
          >
            <Ionicons
              name="close"
              size={26}
              color={palette.text}
            />
          </TouchableOpacity>
        </View>

        <MenuItem icon="home-outline" title="Início" color={palette} onPress={() => { playEffect('chime'); router.replace('/home'); }} />
        <MenuItem icon="archive-outline" title="Acervo" color={palette} onPress={() => go('/acervo')} />
        <MenuItem icon="newspaper-outline" title="Feed da comunidade" color={palette} onPress={() => go('/feed')} />
        <MenuItem icon="search-outline" title="Explorar peças" color={palette} onPress={() => go('/explorar')} />
        <MenuItem icon="notifications-outline" title="Atividades" color={palette} onPress={() => go('/atividades')} />
        <MenuItem icon="chatbubble-ellipses-outline" title="Mensagens" color={palette} onPress={() => go('/mensagens')} />
        <MenuItem icon="albums-outline" title="Curadoria pessoal" color={palette} onPress={() => go('/curadoria')} />
        <MenuItem icon="book-outline" title="Livro de visitas" color={palette} onPress={() => go('/livro-de-visitas')} />
        <MenuItem icon="add-circle-outline" title="Adicionar minha coisa inútil" color={palette} onPress={() => go('/criar-publicacao')} />
        <MenuItem icon="person-outline" title="Meu perfil" color={palette} onPress={() => go('/perfil')} />

        {/* Novas opções solicitadas */}
        <MenuItem icon="information-circle-outline" title="Sobre o aplicativo" color={palette} onPress={() => go('/sobre')} />
        <MenuItem icon="document-text-outline" title="Termos de uso" color={palette} onPress={() => go('/termos')} />

        <MenuItem icon="settings-outline" title="Configurações" color={palette} onPress={() => go('/configuracoes')} />

      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  title,
  color,
  onPress,
}: {
  icon: any;
  title: string;
  color: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: color.card, borderColor: color.border }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={23}
        color="#2F524F"
      />

      <Text style={[styles.itemText, { color: color.text }]}>
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={color.secondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  item: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 12,
  },
});
