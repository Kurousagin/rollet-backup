
import React from 'react';
import { FlatList, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../hooks/FavoritesContext';


const Favorites = () => {
  const { favorites } = useFavorites();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalCard, setModalCard] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simula carregamento (substitua por lógica real se necessário)
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [favorites]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <Image source={require('../../assets/images/splash-icon.png')} style={{ width: 80, height: 80, marginBottom: 24 }} />
          <Text style={{ color: '#ffd166', fontSize: 22, fontWeight: 'bold' }}>Carregando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>Cartas Favoritas</Text>
        {favorites.length === 0 ? (
          <Text style={{ color: '#fff', fontSize: 16 }}>Nenhuma carta favoritada ainda.</Text>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(_, idx) => String(idx)}
            numColumns={2}
            contentContainerStyle={{ gap: 16 }}
            renderItem={({ item }) => (
              <View style={{ margin: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { setModalCard(item); setModalVisible(true); }}>
                  <Image source={item} style={{ width: 120, height: 180, borderRadius: 12, borderWidth: 2, borderColor: '#ffd166' }} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
        {/* Modal para tela cheia */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 2 }} onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 32, color: '#fff' }}>✕</Text>
            </TouchableOpacity>
            {modalCard && (
              <Image source={modalCard} style={{ width: 320, height: 480, borderRadius: 16, borderWidth: 3, borderColor: '#ffd166' }} resizeMode="contain" />
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Favorites;
