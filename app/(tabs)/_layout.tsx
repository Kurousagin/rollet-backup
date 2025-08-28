import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { FavoritesProvider } from '../../hooks/FavoritesContext';
import { TicketsProvider } from '../../hooks/TicketsContext';
import { ViewedProvider } from '../../hooks/ViewedContext';
export default function Layout() {
  return (
    <TicketsProvider>
      <ViewedProvider>
        <FavoritesProvider>
          <Tabs
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: { backgroundColor: '#1a1a2e' },
              tabBarActiveTintColor: '#ffd166',
              tabBarInactiveTintColor: '#fff',
              tabBarIcon: ({ color, size }) => {
                if (route.name === 'Deck') {
                  return <Ionicons name="albums" size={size} color={color} />;
                }
                if (route.name === 'Game') {
                  return <Ionicons name="game-controller" size={size} color={color} />;
                }
                if (route.name === 'Roulette') {
                  return <Ionicons name="sparkles" size={size} color={color} />;
                }
                if (route.name === 'Favorites') {
                  return <Ionicons name="star" size={size} color={color} />;
                }
                return null;
              },
            })}
          />
        </FavoritesProvider>
      </ViewedProvider>
    </TicketsProvider>
  );
}