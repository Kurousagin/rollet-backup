import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useViewed } from '../../hooks/ViewedContext';

const { width: SCREEN_W } = Dimensions.get('window');

const WHEEL_SIZE = Math.min(320, SCREEN_W - 48);

export default function DeckImages() {
  // 1. DECLARAÇÃO DE TODOS OS HOOKS
  const [cards, setCards] = useState<Array<{ src: string; rare: boolean }>>([]);
  const { addViewed, isViewed } = useViewed();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // ✅ Garanta que começa como false

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pointerPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetch('https://kurousagin.github.io/rollet-images/card.json')
      .then(res => res.json())
      .then(data => setCards(data));
  }, []);

  useEffect(() => {
    if (modalVisible && selectedCard !== null && cards[selectedCard]) {
      const cardObj = cards[selectedCard];
      const cardSource = { uri: cardObj.src };
      if (!isViewed(cardSource)) {
        addViewed(cardSource);
      }
    }
  }, [modalVisible, selectedCard, cards, addViewed, isViewed]);

  const confetti = useMemo(
    () =>
      new Array(18).fill(0).map(() => ({
        x: Math.random() * 200 - 100,
        delay: Math.random() * 250,
        duration: 800 + Math.random() * 600,
        size: 6 + Math.random() * 8,
        color: ['#e94560', '#ffd166', '#06d6a0', '#118ab2'][
          Math.floor(Math.random() * 4)
        ],
      })),
    []
  );

  const spinRoulette = useCallback(() => {
    if (spinning || cards.length === 0) return;
    setSpinning(true);
    setShowConfetti(false); // ✅ Garante que o confete não está visível ao iniciar a roleta

    const weights = cards.map(card => (card.rare ? 0.2 : 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let chosen = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) {
        chosen = i;
        break;
      }
    }

    const currentSegmentAngle = 360 / cards.length;
    const fullRotations = 5 + Math.floor(Math.random() * 3);
    const targetAngle = 360 * fullRotations - (chosen * currentSegmentAngle);

    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1, // Ajuste para 1 para a interpolação funcionar com `rotate`
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // ✅ Ao terminar de girar, o confete NÃO aparece. Ele só aparece ao fechar o MODAL.
      setSelectedCard(chosen);
      setModalVisible(true);
      setSpinning(false);
      // setShowConfetti(false); // Removido, pois o confete só aparece ao fechar o modal
    });
  }, [spinning, cards, spinAnim]);

  // 2. LÓGICA E VARIÁVEIS
  const segments = cards.length;
  const segmentAngle = segments > 0 ? 360 / segments : 0;

  const labels = useMemo(() => {
    return Array.from({ length: segments }, (_, i) => {
      const angle = i * segmentAngle;
      const rad = (angle * Math.PI) / 180;
      return {
        i,
        angle,
        x: Math.sin(rad) * (WHEEL_SIZE / 2 - 40),
        y: -Math.cos(rad) * (WHEEL_SIZE / 2 - 40),
      };
    });
  }, [segments, segmentAngle]);

  const pointerScale = pointerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  
  const rotate = spinAnim.interpolate({
    inputRange: [0, 1], // Input range deve ser 0 a 1 para a animação do `spinAnim`
    outputRange: ['0deg', `${360 * 8}deg`] // Animação de várias voltas
  });

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
    setShowConfetti(true); // ✅ Confete aparece AQUI
    setTimeout(() => setShowConfetti(false), 1800); // E desaparece depois de 1.8 segundos
  };

  // 3. RETORNO CONDICIONAL (ESTADO DE LOADING)
  if (!cards.length) {
    return (
      <LinearGradient colors={['#0b1020', '#0f1724']} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Carregando cartas...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // 4. RETORNO PRINCIPAL DO COMPONENTE
  return (
    <LinearGradient colors={['#0b1020', '#0f1724']} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Roleta de Cartas</Text>
          <View style={styles.wheelWrapper}>
            <Animated.View
              style={[styles.pointer, { transform: [{ scale: pointerScale }] }]}
              pointerEvents="none"
            >
              <View style={styles.pointerInner} />
            </Animated.View>
            <Animated.View
              style={[styles.wheel, { transform: [{ rotate }] }]}
            >
              <LinearGradient colors={['#1f1b2e', '#261a3a']} style={styles.wheelGradient}>
                <View style={styles.rings} />
                <View style={styles.centerGlow} />
                {labels.map((lab) => (
                  <View
                    key={lab.i}
                    style={[
                      styles.segmentLabel,
                      {
                        left: WHEEL_SIZE / 2 + lab.x - 28,
                        top: WHEEL_SIZE / 2 + lab.y - 10,
                        transform: [{ rotate: `${lab.angle}deg` }],
                      },
                    ]}
                  >
                    <Text style={styles.segmentLabelText}>{`Carta ${lab.i + 1}`}</Text>
                  </View>
                ))}
              </LinearGradient>
            </Animated.View>
          </View>
          <TouchableOpacity
            style={[styles.button, spinning && { opacity: 0.6 }]}
            onPress={spinRoulette}
            disabled={spinning}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#e94560', '#0f3460']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>{spinning ? 'Girando...' : 'Girar Roleta'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Modal visible={modalVisible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBackground} onPress={closeModal} />
              <View style={styles.modalContent}>
                {selectedCard !== null && cards[selectedCard] && (
                  <LinearGradient colors={['#e94560', '#ffffff', '#0f3460']} style={styles.modalCard}>
                    <Pressable onPress={closeModal} style={{ alignItems: 'center' }}>
                      <Image source={{ uri: cards[selectedCard].src }} style={styles.fullscreenImage} resizeMode="contain" />
                    </Pressable>
                  </LinearGradient>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={closeModal} accessibilityLabel="Fechar">
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {showConfetti && (
            <View style={styles.confettiContainer} pointerEvents="none">
              {confetti.map((c, idx) => {
                const a = new Animated.Value(0);
                Animated.timing(a, {
                  toValue: 1,
                  duration: c.duration,
                  delay: c.delay,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }).start();
                const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [0, -220 - Math.random() * 60] });
                const opacity = a.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 0.9, 0] });
                const translateX = c.x;
                const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] });
                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.confettiDot,
                      {
                        left: WHEEL_SIZE / 2 + translateX,
                        backgroundColor: c.color,
                        width: c.size,
                        height: c.size,
                        borderRadius: c.size / 2,
                        transform: [{ translateY }, { scale }],
                        opacity,
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}
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
    width: Math.min(SCREEN_W * 0.85, 320),
    height: Math.min(SCREEN_W * 0.85 * 1.5, 480),
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
    zIndex: 3,
  },
  closeButtonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
    overflow: 'visible',
  },
  confettiDot: {
    position: 'absolute',
  },
});
