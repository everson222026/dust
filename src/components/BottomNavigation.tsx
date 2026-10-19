import { ThemedIonicons as Ionicons, ThemedText as Text, ThemedView as View } from '../theme/ThemedComponents';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

const items = [
  { route: '/acervo', label: 'Museu', icon: 'business-outline' as const, activeIcon: 'business' as const },
  { route: '/explorar', label: 'Explorar', icon: 'search-outline' as const, activeIcon: 'search' as const },
  { route: '/criar-publicacao', label: '', icon: 'add' as const, activeIcon: 'add' as const },
  { route: '/atividades', label: 'Atividades', icon: 'notifications-outline' as const, activeIcon: 'notifications' as const },
  { route: '/perfil', label: 'Perfil', icon: 'person-outline' as const, activeIcon: 'person' as const },
] as const;

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {items.map(item => {
        const isCreate = item.route === '/criar-publicacao';
        const active =
          pathname === item.route ||
          (item.route === '/acervo' &&
            (pathname === '/home' ||
              pathname.startsWith('/publicacao/') ||
              pathname.startsWith('/comentarios/'))) ||
          (item.route === '/perfil' &&
            (pathname.startsWith('/perfil') ||
              pathname.startsWith('/configuracoes') ||
              pathname.startsWith('/salvos') ||
              pathname.startsWith('/seguidores') ||
              pathname.startsWith('/usuario/')));

        return (
          <TouchableOpacity
            key={item.route}
            accessibilityRole="button"
            accessibilityLabel={isCreate ? 'Publicar uma peça' : item.label}
            accessibilityState={{ selected: active }}
            style={[styles.item, isCreate && styles.createItem]}
            onPress={() => router.replace(item.route)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, isCreate && styles.createIconWrap]}>
              <Ionicons
                name={active && !isCreate ? item.activeIcon : item.icon}
                size={isCreate ? 43 : 31}
                color={isCreate ? '#49351A' : '#D5AC62'}
              />
            </View>
            {!isCreate && (
              <Text style={styles.label}>{item.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#49351A',
    paddingHorizontal: 4,
  },
  darkContainer: {
    backgroundColor: '#302516',
  },
  item: {
    position: 'relative',
    flex: 1,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  createItem: {
    flex: 1.1,
  },
  iconWrap: {
    minWidth: 38,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#D5AC62',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
