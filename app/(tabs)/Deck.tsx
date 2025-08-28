import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../hooks/FavoritesContext';
import { useViewed } from '../../hooks/ViewedContext';

const { width: SCREEN_W } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(320, SCREEN_W - 48);

export default function DeckImages() {
  // ✅ Hooks movidos para DENTRO do componente
  const [cards, setCards] = useState<any[]>([]);
  const fav = useFavorites();
  const { viewed } = useViewed();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCard, setModalCard] = useState<any>(null);

  // ✅ useEffect para buscar os dados, DENTRO do componente
  useEffect(() => {
    fetch('https://kurousagin.github.io/rollet-images/card.json')
      .then(res => res.json())
      .then(data => setCards(data));
  }, []); // O array vazio garante que isso rode apenas uma vez

  // Corrige para contar apenas cartas visualizadas que existem no baralho atual
  const total = cards.length;
  const progresso = viewed.filter(v => {
    if (typeof v === 'object' && v !== null && 'uri' in v) {
      return cards.some(c => c.src === v.uri);
    }
    return false;
  }).length;

  // Não há 'return' condicional aqui, então a estrutura está correta
  return (
    <LinearGradient colors={['#0b1020', '#0f1724']} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={styles.title}>Cartas Visualizadas</Text>
          <Text style={{ color: '#ffd166', fontWeight: 'bold', marginBottom: 10 }}>
            Progresso: {progresso} / {total}
          </Text>
          {progresso === 0 ? (
            <Text style={{ color: '#fff', fontSize: 16, marginTop: 32 }}>
              Nenhuma carta foi visualizada ainda{"\n"}Gire a roleta para começar!
            </Text>
          ) : progresso === total ? (
            <Text style={{ color: '#06d6a0', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Parabéns! Você visualizou todas as cartas!</Text>
          ) : null}
          <View style={{ flex: 1 }}>
            <Animated.FlatList
              data={viewed.filter((v, i, arr) => {
                if (typeof v === 'object' && v !== null && 'uri' in v) {
                  return arr.findIndex(x => typeof x === 'object' && x !== null && 'uri' in x && x.uri === v.uri) === i;
                }
                return arr.findIndex(x => x === v) === i;
              })}
              keyExtractor={(item) => {
                if (typeof item === 'object' && item !== null && 'uri' in item && item.uri) return item.uri;
                return String(item);
              }}
              numColumns={3}
              contentContainerStyle={{ gap: 16 }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item, index }) => (
                <View style={{ marginBottom: 16, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => { setModalCard(item); setModalVisible(true); }}>
                    <Image source={item} style={{ width: 90, height: 135, borderRadius: 10, borderWidth: 2, borderColor: '#ffd166' }} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    // ...existing code...
                  style={{ marginTop: 6, backgroundColor: '#ffd166', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}
                  onPress={() => {
                    fav.isFavorite(item) ? fav.removeFavorite(item) : fav.addFavorite(item);
                  }}
                >
                  <Text style={{ color: '#222', fontSize: 16 }}>
                    {fav.isFavorite(item) ? '★' : '☆'} Favoritar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 18, color: '#fff' },

  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelGradient: {
    width: '100%',
    height: '100%',
    borderRadius: WHEEL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  rings: {
    position: 'absolute',
    width: '86%',
    height: '86%',
    borderRadius: (WHEEL_SIZE * 0.86) / 2,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.04)',
  },

  centerGlow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff9aa2',
    shadowColor: '#ff9aa2',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 6,
  },

  segmentLabel: {
    position: 'absolute',
    width: 56,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  pointer: {
    position: 'absolute',
    top: -18,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  pointerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#e94560',
    shadowColor: '#e94560',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  button: { borderRadius: 24, marginBottom: 24, overflow: 'hidden', elevation: 6 },
  buttonGradient: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  modalContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e94560',
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  fullscreenImage: {
    width: Math.min(SCREEN_W * 0.85, 760),
    height: Math.min(SCREEN_W * 0.85 * 1.4, 1100),
    borderRadius: 12,
  },
  cardLabel: { color: '#fff', marginTop: 12, fontWeight: '700' },

  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 48,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { color: '#fff', fontSize: 20, fontWeight: '700' },

  confettiContainer: {
    position: 'absolute',
    top: SCREEN_W / 2 - 80,
    left: (SCREEN_W - WHEEL_SIZE) / 2,
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    zIndex: 6,
    overflow: 'visible',
  },
  confettiDot: {
    position: 'absolute',
  },
});
