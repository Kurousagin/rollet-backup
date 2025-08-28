import { Redirect } from 'expo-router';

export default function AppIndex() {
  // Redireciona para a aba Deck
  return <Redirect href="/(tabs)/Deck" />;
}
