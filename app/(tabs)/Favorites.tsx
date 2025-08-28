import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../hooks/FavoritesContext';

type Card = { src: string; rare: boolean };

function Favorites() {
  const fav = useFavorites();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false); // Estado para o modal de confirmação

  useEffect(() => {
    fetch('https://kurousagin.github.io/rollet-images/card.json')
      .then(res => res.json())
      .then((data: Card[]) => {
        setCards(data);
        setLoading(false);
      });
  }, []);

  const favoriteCards: Card[] = fav.favorites
    .map(uri => cards.find(card => card.src === uri))
    .filter((card): card is Card => !!card); // Garante que só Cards definidos entram

  const handleClearFavorites = () => {
    fav.favorites.forEach(uri => fav.removeFavorite(uri));
    setConfirmVisible(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.loadingContainer}>
        <Image source={require('../../assets/images/splash-icon.png')} style={styles.loadingIcon} />
        <Text style={styles.loadingText}>Carregando Heróis...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Heróis do Partido</Text>

          {favoriteCards.length > 0 ? (
            <FlatList
              data={favoriteCards}
              keyExtractor={item => item.src}
              numColumns={2}
              contentContainerStyle={styles.grid}
              ListFooterComponent={ // Botão aparece no final da lista
                <TouchableOpacity onPress={() => setConfirmVisible(true)} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Revogar Medalhas</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                  <TouchableOpacity onPress={() => { setModalCard(item); setModalVisible(true); }}>
                    <Image source={{ uri: item.src }} style={styles.cardImage} />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>Nenhum herói foi condecorado ainda.</Text>
              <Text style={styles.emptyStateText}>A luta continua!</Text>
            </View>
          )}
        </View>

        {/* Modal de Confirmação */}
        <Modal
          visible={confirmVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Atenção, Camarada!</Text>
              <Text style={styles.confirmText}>Tem certeza que deseja revogar todas as condecorações? Esta ação não pode ser desfeita.</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity onPress={handleClearFavorites} style={[styles.confirmButton, styles.confirmButtonYes]}>
                  <Text style={styles.confirmButtonText}>Sim, Revogar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.confirmButton, styles.confirmButtonNo]}>
                  <Text style={styles.confirmButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para Tela Cheia */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.fullscreenModal}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            {modalCard && (
              <Image source={{ uri: modalCard.src }} style={styles.fullscreenImage} resizeMode="contain" />
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

// --- ESTILOS TEMÁTICOS ---
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  title: {
    fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5,
  },
  
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingIcon: { width: 80, height: 80, marginBottom: 24 },
  loadingText: { color: '#ffeb3b', fontSize: 22, fontWeight: 'bold' },

  // Grid e Cartas
  grid: { paddingHorizontal: 10 },
  cardContainer: { margin: 8, alignItems: 'center', width: 120 },
  cardImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#ffeb3b', // Borda dourada para destacar
    backgroundColor: '#333',
  },

  // Estado Vazio
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyStateText: { color: '#f0f0f0', fontSize: 18, textAlign: 'center', lineHeight: 24 },
  
  // Botão de Limpar
  clearButton: {
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: '#c0392b',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 5,
  },
  clearButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Modal de Confirmação
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmModal: {
    backgroundColor: '#3b0c0c', width: '100%', borderRadius: 16, padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: '#ffeb3b'
  },
  confirmTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16 },
  confirmText: { fontSize: 16, color: '#f0f0f0', textAlign: 'center', marginBottom: 24 },
  confirmActions: { flexDirection: 'row' },
  confirmButton: { flex: 1, borderRadius: 8, padding: 12, marginHorizontal: 8, alignItems: 'center' },
  confirmButtonYes: { backgroundColor: '#c0392b' },
  confirmButtonNo: { backgroundColor: '#8bc34a' },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Modal de Tela Cheia
  fullscreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '95%', height: '80%', borderRadius: 16 },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
});

export default Favorites;