import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- DADOS DAS CARTAS (agora com emojis temáticos) ---
// ★ (Estrela Vermelha)
// 🐻 (Meme "Nosso" Urso)
// 🥔 (Batata, um meme comum sobre a economia)
// 📕 (O Livro Vermelho / O Capital)
const cardData = ['★', '🐻', '🥔', '📕', '★', '🐻', '🥔', '📕'];

const MAX_MOVES = 12;

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- COMPONENTE CARTA (revertido para usar Texto/Emoji) ---
function Card({ onPress, card, isFlipped, isMatched }: { onPress: () => void; card: string; isFlipped: boolean; isMatched: boolean }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFlipped || isMatched ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, isMatched]);

  const frontInterpolate = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <TouchableOpacity onPress={onPress} disabled={isFlipped || isMatched}>
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: frontInterpolate }] }]}>
          {/* O verso da carta foi mantido, mas você pode mudar o emoji se quiser */}
          <Text style={styles.cardBackText}>☭</Text>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardFront, isMatched && styles.matched, { transform: [{ rotateY: backInterpolate }] }]}>
          {/* AQUI a mudança principal: <Text> no lugar de <Image> */}
          <Text style={styles.cardText}>{card}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

// --- COMPONENTE PRINCIPAL DO JOGO ---
export default function MiniMemoryGame({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  const [cards, setCards] = useState(shuffle([...cardData]));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');

  const resetGame = () => {
    setCards(shuffle([...cardData]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameState('playing');
  };

  const handleFlip = (idx: number) => {
    if (flipped.length < 2 && !flipped.includes(idx)) {
      setFlipped(f => [...f, idx]);
    }
  };
  
  // Lógica para verificar os pares (revertida para comparar strings)
  useEffect(() => {
    if (flipped.length === 2) {
      setTimeout(() => setMoves(m => m + 1), 500);
      const [i, j] = flipped;
      if (cards[i] === cards[j]) { // Compara o emoji (string)
        setMatched(m => [...m, i, j]);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (matched.length === cardData.length) {
      setGameState('won');
      setTimeout(onWin, 1500);
    } else if (moves >= MAX_MOVES && matched.length < cardData.length) {
      setGameState('lost');
    }
  }, [matched, moves]);
  
  const renderGameState = () => {
    if (gameState === 'start') {
      return <>
        <Text style={styles.title}>Memória do Proletariado</Text>
        <Text style={styles.instructions}>Encontre os pares corretos em menos de {MAX_MOVES} movimentos!</Text>
        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>Começar a Luta</Text>
        </TouchableOpacity>
      </>;
    }
    
    if (gameState === 'won' || gameState === 'lost') {
      const isWinner = gameState === 'won';
      return <>
        <Text style={styles.title}>{isWinner ? '🎉 Vitória do Povo! 🎉' : ' A Luta Continua '}</Text>
        <Text style={isWinner ? styles.winText : styles.loseText}>
          {isWinner ? 'Você uniu os símbolos e ganhou 1 ticket! 🎟️' : `Você excedeu os ${MAX_MOVES} movimentos.`}
        </Text>
        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>Jogar Novamente</Text>
        </TouchableOpacity>
      </>;
    }

    return <>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Movimentos</Text>
        <Text style={styles.statsValue}>{moves} / {MAX_MOVES}</Text>
      </View>
      <View style={styles.grid}>
        {cards.map((card, idx) => (
          <Card
            key={idx} // A chave pode voltar a ser o índice
            card={card}
            isFlipped={flipped.includes(idx)}
            isMatched={matched.includes(idx)}
            onPress={() => handleFlip(idx)}
          />
        ))}
      </View>
    </>;
  };

  return (
    <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.container}>
      {renderGameState()}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Recuar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16, textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5 },
  instructions: { fontSize: 18, color: '#f0f0f0', marginBottom: 24, textAlign: 'center' },
  statsContainer: { marginBottom: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ffeb3b' },
  statsText: { fontSize: 16, color: '#ddd', fontWeight: '600' },
  statsValue: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 280 },
  cardContainer: { width: 60, height: 80, margin: 5 },
  card: { width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 2, borderColor: '#212121', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  cardBack: { backgroundColor: '#ffeb3b' },
  cardBackText: { fontSize: 32, color: '#9a1e1e', fontWeight: 'bold' },
  cardFront: { backgroundColor: '#f0f0f0' },
  cardText: { fontSize: 36 }, // Estilo para o emoji
  matched: { backgroundColor: '#8bc34a', borderColor: '#556b2f' },
  winText: { fontSize: 20, color: '#8bc34a', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  loseText: { fontSize: 20, color: '#ff9800', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  button: { backgroundColor: '#ffeb3b', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginVertical: 10, elevation: 5 },
  buttonText: { color: '#6d1616', fontSize: 18, fontWeight: 'bold' },
  backButton: { position: 'absolute', bottom: 40, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
});