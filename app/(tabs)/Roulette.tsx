import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTickets } from '../../hooks/TicketsContext';
import { useViewed } from '../../hooks/ViewedContext';

const { width: SCREEN_W } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(320, SCREEN_W - 48);

type Card = { src: string; rare: boolean };

export default function Roulette() {
  const { tickets, addTickets } = useTickets();
  const { addViewed, isViewed } = useViewed();
  
  const [cards, setCards] = useState<Card[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // Lógica simplificada: um único estado para guardar as cartas ganhas (1 ou 5)
  const [wonCards, setWonCards] = useState<Card[]>([]);
  
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetch('https://kurousagin.github.io/rollet-images/card.json')
      .then(res => res.json())
      .then((data: Card[]) => setCards(data));
  }, []);

  // Adiciona as cartas ao "viewed" quando o modal abre
  useEffect(() => {
    if (modalVisible && wonCards.length > 0) {
      wonCards.forEach(card => {
        const cardSource = { uri: card.src };
        if (!isViewed(cardSource)) {
          addViewed(cardSource);
        }
      });
    }
  }, [modalVisible, wonCards]);

  const pickWeightedCard = useCallback(() => {
    const weights = cards.map(card => (card.rare ? 0.2 : 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      if ((rand -= weights[i]) <= 0) return cards[i];
    }
    return cards[0]; // Fallback
  }, [cards]);

  const startSpinAnimation = (duration: number, onComplete: () => void) => {
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(onComplete);
  };

  const spinRoulette = useCallback(() => {
    if (spinning || cards.length === 0 || tickets < 5) return;
    addTickets(-5);
    setSpinning(true);
    const chosenCard = pickWeightedCard();
    startSpinAnimation(4000, () => {
      setWonCards([chosenCard]);
      setModalVisible(true);
      setSpinning(false);
    });
  }, [spinning, cards, tickets]);

  const spinRouletteFive = useCallback(() => {
    if (spinning || cards.length === 0 || tickets < 25) return;
    addTickets(-25);
    setSpinning(true);
    const results: Card[] = Array.from({ length: 5 }, pickWeightedCard);
    startSpinAnimation(4000, () => {
      setWonCards(results);
      setModalVisible(true);
      setSpinning(false);
    });
  }, [spinning, cards, tickets]);

  const closeModal = () => {
    setModalVisible(false);
    // Pequeno atraso para a animação do modal terminar antes de limpar os dados
    setTimeout(() => setWonCards([]), 300);
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * 8}deg`],
  });

  if (!cards.length) {
    return (
      <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.gradient}>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.loadingText}>Carregando Recursos...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Sorteio do Comitê</Text>
          <View style={styles.ticketContainer}>
            <Text style={styles.ticketIcon}>🎟️</Text>
            <Text style={styles.ticketText}>{tickets}</Text>
          </View>
          
          <View style={styles.wheelWrapper}>
            <View style={styles.pointer} />
            <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
              <LinearGradient colors={['#4d0e0e', '#3b0c0c']} style={styles.wheelGradient}>
                <Text style={styles.wheelCenterStar}>★</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[styles.button, (spinning || tickets < 5) && styles.disabledButton]} 
            onPress={spinRoulette}
            disabled={spinning || tickets < 5}
          >
            <Text style={styles.buttonText}>Girar (5 Tickets)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, (spinning || tickets < 25) && styles.disabledButton]} 
            onPress={spinRouletteFive}
            disabled={spinning || tickets < 25}
          >
            <Text style={styles.buttonText}>Girar 5x (25 Tickets)</Text>
          </TouchableOpacity>

          <Modal visible={modalVisible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.modalOverlay}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
              <View style={styles.modalContent}>
                {wonCards.length > 1 ? (
                  <SwipeableCards cards={wonCards} onClose={closeModal} />
                ) : (
                  wonCards.length === 1 && (
                    <View style={styles.modalCard}>
                      <Image source={{ uri: wonCards[0].src }} style={styles.fullscreenImage} resizeMode="contain" />
                    </View>
                  )
                )}
                <TouchableOpacity style={styles.closeButton} onPress={closeModal} accessibilityLabel="Fechar">
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SwipeableCards({ cards, onClose }: { cards: Card[], onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
    onPanResponderMove: Animated.event([null, { dy: position.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -100) { // Limiar de arraste
        Animated.timing(position, {
          toValue: { x: 0, y: -SCREEN_W * 2 }, // Joga para bem longe
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          position.setValue({ x: 0, y: 0 });
          setIndex(i => i + 1);
        });
      } else {
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      }
    },
  }), [position, index]);

  useEffect(() => {
    if (index >= cards.length) {
      setTimeout(onClose, 250); // Fecha automaticamente ao final
    }
  }, [index]);
  
  return (
    <View style={styles.cardStackContainer}>
      {cards.map((card, i) => {
        if (i < index) return null; // Não renderiza cartas já vistas
        if (i > index + 2) return null; // Otimização: renderiza só as próximas 2
        
        const isCurrent = i === index;
        
        const cardStyle = isCurrent ? {
          transform: position.getTranslateTransform()
        } : {
          transform: [{ scale: 1 - (i - index) * 0.1 }],
          top: (i - index) * 15,
        };

        return (
          <Animated.View
            key={card.src + i}
            {...(isCurrent ? panResponder.panHandlers : {})}
            style={[styles.modalCard, styles.cardStackItem, cardStyle]}
          >
            <Image source={{ uri: card.src }} style={styles.fullscreenImage} resizeMode="contain" />
            {isCurrent && <Text style={styles.cardInstruction}>Arraste para cima</Text>}
          </Animated.View>
        );
      }).reverse() // Inverte para a carta do topo aparecer na frente
    }
    </View>
  );
}

// --- ESTILOS TEMÁTICOS ---
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#ffeb3b', fontSize: 22, fontWeight: 'bold' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5,
  },
  ticketContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#ffeb3b', marginBottom: 24,
  },
  ticketIcon: { fontSize: 24, marginRight: 10 },
  ticketText: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  
  // Roleta
  wheelWrapper: { width: WHEEL_SIZE, height: WHEEL_SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  wheel: { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2, justifyContent: 'center', alignItems: 'center' },
  wheelGradient: { width: '100%', height: '100%', borderRadius: WHEEL_SIZE / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 8, borderColor: '#212121' },
  wheelCenterStar: { color: '#c0392b', fontSize: WHEEL_SIZE / 2.5, textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5 },
  pointer: {
    position: 'absolute', top: -10, zIndex: 10,
    width: 0, height: 0,
    backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 30,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#ffeb3b',
  },

  // Botões
  button: {
    backgroundColor: '#ffeb3b', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14,
    marginVertical: 10, elevation: 5, borderWidth: 2, borderColor: '#212121', width: '90%',
  },
  buttonText: { color: '#6d1616', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  disabledButton: { opacity: 0.6 },
  
  // Modal e Cartas
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardStackContainer: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  cardStackItem: { position: 'absolute' },
  modalCard: {
    backgroundColor: '#3b0c0c', borderRadius: 20, padding: 14,
    alignItems: 'center', borderWidth: 2, borderColor: '#ffeb3b'
  },
  fullscreenImage: {
    width: Math.min(SCREEN_W * 0.75, 300),
    height: Math.min(SCREEN_W * 0.75 * 1.5, 450),
    borderRadius: 12,
  },
  cardInstruction: { color: '#ffeb3b', marginTop: 12, fontSize: 16, fontWeight: 'bold' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
});