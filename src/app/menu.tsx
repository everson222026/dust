import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/ThemedComponents';
import { useRouter } from 'expo-router';
import { goBackOrReplace } from '../lib/navigation';
import {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.page}>

        <View style={styles.header}>
          <Text style={styles.title}>
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
              color="#3D0404"
            />
          </TouchableOpacity>
        </View>

        <MenuItem
          icon="home-outline"
          title="Início"
          onPress={() =>
            router.replace('/home')
          }
        />

        <MenuItem
          icon="archive-outline"
          title="Acervo"
          onPress={() =>
            router.push('/acervo')
          }
        />

        <MenuItem
          icon="newspaper-outline"
          title="Feed da comunidade"
          onPress={() =>
            router.push('/feed')
          }
        />

        <MenuItem
          icon="search-outline"
          title="Explorar peças"
          onPress={() =>
            router.push('/explorar')
          }
        />

        <MenuItem
          icon="notifications-outline"
          title="Atividades"
          onPress={() =>
            router.push('/atividades')
          }
        />

        <MenuItem
          icon="add-circle-outline"
          title="Adicionar minha coisa inútil"
          onPress={() =>
            router.push('/criar-publicacao')
          }
        />

        <MenuItem
          icon="person-outline"
          title="Meu perfil"
          onPress={() =>
            router.push('/perfil')
          }
        />

        <MenuItem
          icon="settings-outline"
          title="Configurações"
          onPress={() =>
            router.push('/configuracoes')
          }
        />

      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  title,
  onPress,
}: {
  icon: any;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={23}
        color="#2F524F"
      />

      <Text style={styles.itemText}>
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#644219"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E1C7',
  },

  page: {
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    color: '#3D0404',
    fontSize: 22,
    fontWeight: '900',
  },

  item: {
    minHeight: 62,
    backgroundColor: '#E3D2B5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8B58F',
    marginBottom: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemText: {
    flex: 1,
    color: '#3D0404',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 12,
  },
});