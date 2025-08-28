import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useFavorites } from '../../hooks/FavoritesContext';
import { useViewed } from '../../hooks/ViewedContext';

import { SafeAreaView } from 'react-native-safe-area-context';

// --- TIPAGEM PARA AS CARTAS ---
// Boa prática: definir um tipo para os objetos que vêm da API
type Card = {
  src: string;
  rare: boolean;
};

// --- TIPAGEM PARA OS ITENS VISUALIZADOS ---
type ViewedItem = {
  uri: string;
};



export default function DeckImages() {
  // Corrigido: usa o tipo 'Card' em vez de 'any'
  const [cards, setCards] = useState<Card[]>([]);
  const { viewed, clearViewed } = useViewed();
  const fav = useFavorites();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCard, setModalCard] = useState<ViewedItem | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    fetch('https://kurousagin.github.io/rollet-images/card.json')
      .then(res => res.json())
      .then((data: Card[]) => setCards(data)); // Adiciona a tipagem aos dados recebidos
  }, []);

  const clearDeck = () => {
    clearViewed();
    setConfirmVisible(false);
  };

  // Corrigido: adiciona o tipo 'ViewedItem' ao parâmetro 'item'
  const handleFavoritePress = (item: ViewedItem) => {
    const cardUri = item.uri;
    if (fav.isFavorite(cardUri)) {
      fav.removeFavorite(cardUri);
    } else {
      fav.addFavorite(cardUri);
    }
  };

  // Mapeia todas as cartas do álbum, marcando se foram vistas
  const viewedUris = viewed
    .map(v => (typeof v === 'object' && v !== null && 'uri' in v ? v.uri : null))
    .filter((uri): uri is string => typeof uri === 'string');

  // Cria lista de cartas do álbum, marcando se cada uma foi vista (normalização)
  const normalize = (str: string) => str.trim().toLowerCase();
  const normalizedViewed = viewedUris.map(normalize);
  const deckCards = cards.map(card => ({
    ...card,
    viewed: normalizedViewed.includes(normalize(card.src))
  }));

  const total = cards.length > 0 ? cards.length : 1;
  const progresso = deckCards.filter(card => card.viewed).length;
  const progressPercent = (progresso / total) * 100;

  return (
    <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>NOSSO Álbum</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Progresso: {progresso} / {total}</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
          {progresso === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>O arquivo está vazio, camarada.</Text>
              <Text style={styles.emptyStateText}>Vá para a roleta cumprir sua parte!</Text>
            </View>
          ) : progresso === total && (
            <Text style={styles.winText}>Álbum completo! A história foi registrada para a glória do Partido!</Text>
          )}
          <FlatList
            data={deckCards}
            keyExtractor={(item) => item.src}
            numColumns={3}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                {item.viewed ? (
                  <>
                    <TouchableOpacity onPress={() => { setModalCard({ uri: item.src }); setModalVisible(true); }}>
                      <Image source={{ uri: item.src }} style={styles.cardImage} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => handleFavoritePress({ uri: item.src })}
                    >
                      <Text style={styles.favoriteButtonText}>
                        {fav.isFavorite(item.src) ? '★' : '☆'} Condecorar
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }]}> 
                    <Text style={{ color: '#888', fontSize: 32 }}>?</Text>
                  </View>
                )}
              </View>
            )}
          />

          <TouchableOpacity onPress={() => setConfirmVisible(true)} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Expurgar Arquivos</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={confirmVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Revisão Histórica</Text>
              <Text style={styles.confirmText}>Tem certeza que deseja apagar todos os registros do álbum?</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity onPress={clearDeck} style={[styles.confirmButton, styles.confirmButtonYes]}>
                  <Text style={styles.confirmButtonText}>Sim, Expurgar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.confirmButton, styles.confirmButtonNo]}>
                  <Text style={styles.confirmButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.fullscreenModal}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            {modalCard && (
              <Image source={modalCard} style={styles.fullscreenImage} resizeMode="contain" />
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Estilos (sem alterações)
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', padding: 16 },
  title: {
    fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5,
  },
  progressContainer: { width: '100%', marginBottom: 20 },
  progressText: { color: '#fff', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  progressBarBackground: { height: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 6 },
  progressBarFill: { height: '100%', backgroundColor: '#8bc34a', borderRadius: 6 },
  grid: { paddingBottom: 80 },
  cardContainer: { margin: 8, alignItems: 'center' },
  cardImage: {
    width: 100, height: 150, borderRadius: 10, borderWidth: 2, borderColor: '#212121',
    backgroundColor: '#333'
  },
  favoriteButton: {
    marginTop: 8, backgroundColor: '#ffeb3b', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, elevation: 3,
  },
  favoriteButtonText: { color: '#6d1616', fontSize: 14, fontWeight: 'bold' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateText: { color: '#f0f0f0', fontSize: 18, textAlign: 'center', lineHeight: 24 },
  winText: { color: '#8bc34a', fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  clearButton: {
    position: 'absolute', bottom: 20, backgroundColor: '#c0392b',
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, elevation: 5,
  },
  clearButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
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
  fullscreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '95%', height: '80%', borderRadius: 16 },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
});