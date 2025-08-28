import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- COMPONENTE PARA O FEEDBACK DE "+1" FLUTUANTE ---
const PlusOne = ({ onComplete }: { onComplete: () => void }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(onComplete);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.Text style={[styles.plusOne, { transform: [{ translateY }], opacity }]}>
      +1
    </Animated.Text>
  );
};

export default function MiniTapGame({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [ticketsWon, setTicketsWon] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  
  // Animações
  const [showTicketAlert, setShowTicketAlert] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapAnim = useRef(new Animated.Value(1)).current;
  const [plusOnes, setPlusOnes] = useState<{ id: number }[]>([]);

  // Efeito para o cronômetro
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('finished');
      if (ticketsWon > 0) {
        // A função onWin pode ser chamada aqui se a vitória for baseada em tickets
      }
      return;
    }
    const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [gameState, timeLeft, ticketsWon]);

  // Efeito para a animação do alerta de ticket
  useEffect(() => {
    if (showTicketAlert) {
      fadeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ]).start(() => setShowTicketAlert(false));
    }
  }, [showTicketAlert]);

  const handleTap = () => {
    // Animação de feedback do botão
    tapAnim.setValue(0.9);
    Animated.spring(tapAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    // Adiciona um "+1" flutuante
    const newPlusOne = { id: Math.random() };
    setPlusOnes(p => [...p, newPlusOne]);

    setCount(currentCount => {
      const newCount = currentCount + 1;
      if (newCount > 0 && newCount % 60 === 0) {
        onWin(); // Chama a função para dar o ticket
        setTicketsWon(prevTickets => prevTickets + 1);
        setShowTicketAlert(true);
      }
      return newCount;
    });
  };

  const handleStart = () => {
    setCount(0);
    setTimeLeft(20);
    setTicketsWon(0);
    setGameState('playing');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'start':
        return (
          <>
            <Text style={styles.title}>Produção Frenética</Text>
            <Text style={styles.instructions}>Bata a meta de produção para a glória do Partido!</Text>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Iniciar Produção</Text>
            </TouchableOpacity>
          </>
        );
      
      case 'finished':
        return (
          <>
            <Text style={styles.title}>Fim do Turno</Text>
            <Text style={styles.finalScore}>Produção Total: {count} unidades</Text>
            {ticketsWon > 0 ? (
              <Text style={styles.winText}>Meta batida! Você ganhou {ticketsWon} ticket{ticketsWon > 1 ? 's' : ''} 🎟️</Text>
            ) : (
              <Text style={styles.loseText}>A produção foi baixa. O Partido está desapontado.</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Novo Turno</Text>
            </TouchableOpacity>
          </>
        );

      case 'playing':
        return (
          <>
            <View style={styles.hud}>
              <Text style={styles.hudText}>Produção: {count}</Text>
              <Text style={styles.hudText}>Tickets: {ticketsWon}</Text>
              <Text style={styles.hudText}>Tempo: {timeLeft}s</Text>
            </View>
            <View>
              <Animated.View style={{ transform: [{ scale: tapAnim }] }}>
                <TouchableOpacity style={styles.tapButton} onPress={handleTap} activeOpacity={0.9}>
                  <Text style={styles.tapText}>☭</Text>
                </TouchableOpacity>
              </Animated.View>
              {plusOnes.map(p => (
                <PlusOne key={p.id} onComplete={() => setPlusOnes(ones => ones.filter(o => o.id !== p.id))} />
              ))}
            </View>
          </>
        );
    }
  };

  return (
    <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.container}>
      {/* Alerta de ticket ganho */}
      {showTicketAlert && (
        <Animated.View style={[styles.ticketAlert, { opacity: fadeAnim }]}>
          <Text style={styles.ticketAlertText}>+1 Ticket do Povo! 🎟️</Text>
        </Animated.View>
      )}

      {renderGameState()}

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Recuar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16, textAlign: 'center' },
  instructions: { fontSize: 18, color: '#f0f0f0', marginBottom: 24, textAlign: 'center' },
  
  hud: {
    position: 'absolute',
    top: -200,
    width: '110%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 10,
  },
  hudText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  tapButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ffeb3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 4,
    borderColor: '#212121',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  tapText: {
    color: '#9a1e1e',
    fontSize: 90,
    fontWeight: 'bold',
  },
  plusOne: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15, // Centraliza
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffeb3b',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },

  button: {
    backgroundColor: '#ffeb3b',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginVertical: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#6d1616',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  finalScore: { fontSize: 24, color: '#fff', marginVertical: 16, fontWeight: 'bold' },
  winText: { fontSize: 20, color: '#8bc34a', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  loseText: { fontSize: 20, color: '#ff9800', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  
  ticketAlert: {
    position: 'absolute',
    top: '15%',
    backgroundColor: '#8bc34a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  ticketAlertText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: { position: 'absolute', bottom: 40, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
});