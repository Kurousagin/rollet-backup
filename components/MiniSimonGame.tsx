import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- SÍMBOLOS TEMÁTICOS (em vez de cores) ---
const symbols = [
  { key: 'martelo', emoji: '🔨', color: '#c0392b' }, // Trabalhadores
  { key: 'foice', emoji: '🌾', color: '#f1c40f' }, // Camponeses
  { key: 'estrela', emoji: '★', color: '#e74c3c' }, // O Partido
  { key: 'livro', emoji: '📕', color: '#3498db' }, // A Teoria
];

const WIN_SEQUENCE_LENGTH = 5;

// Função para tocar a sequência de forma assíncrona
const playSequence = async (sequence: typeof symbols, setActiveButton: (key: string | null) => void) => {
  for (const symbol of sequence) {
    await new Promise(resolve => setTimeout(resolve, 250)); // Pausa antes de acender
    setActiveButton(symbol.key);
    await new Promise(resolve => setTimeout(resolve, 500)); // Duração que o botão fica aceso
    setActiveButton(null);
  }
};

export default function MiniSimonGame({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  const [sequence, setSequence] = useState<typeof symbols>([]);
  const [playerSequence, setPlayerSequence] = useState<typeof symbols>([]);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  // Estados do jogo: start, computerTurn, playerTurn, lost, won
  const [gameState, setGameState] = useState<'start' | 'computerTurn' | 'playerTurn' | 'lost' | 'won'>('start');

  const startGame = () => {
    setSequence([symbols[Math.floor(Math.random() * symbols.length)]]);
    setPlayerSequence([]);
    setGameState('computerTurn');
  };
  
  // Efeito que controla o turno do computador
  useEffect(() => {
    if (gameState === 'computerTurn') {
      setTimeout(async () => {
        await playSequence(sequence, setActiveButton);
        setGameState('playerTurn');
      }, 1000); // Pequeno delay antes de começar a mostrar a sequência
    }
  }, [gameState, sequence]);
  
  const handlePlayerPress = (pressedSymbol: typeof symbols[0]) => {
    if (gameState !== 'playerTurn') return;
    
    const newPlayerSequence = [...playerSequence, pressedSymbol];
    setPlayerSequence(newPlayerSequence);
    
    // Verifica se o último clique está correto
    if (newPlayerSequence[newPlayerSequence.length - 1].key !== sequence[newPlayerSequence.length - 1].key) {
      setGameState('lost');
      return;
    }
    
    // Se o jogador completou a sequência
    if (newPlayerSequence.length === sequence.length) {
      // Se atingiu o tamanho para vencer
      if (sequence.length >= WIN_SEQUENCE_LENGTH) {
        setGameState('won');
        setTimeout(onWin, 1500);
      } else {
        // Adiciona um novo passo e passa para o turno do computador
        setPlayerSequence([]);
        setSequence([...sequence, symbols[Math.floor(Math.random() * symbols.length)]]);
        setGameState('computerTurn');
      }
    }
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'start':
        return (
          <View style={styles.centerView}>
            <Text style={styles.title}>O Partido Ordena</Text>
            <Text style={styles.instructions}>Memorize a sequência de ordens e repita-a sem erros.</Text>
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Aceitar a Missão</Text>
            </TouchableOpacity>
          </View>
        );

      case 'lost':
      case 'won':
        const isWinner = gameState === 'won';
        return (
          <View style={styles.centerView}>
            <Text style={styles.title}>{isWinner ? '🎉 Glória ao Partido! 🎉' : ' TRAIDOR! '}</Text>
            <Text style={isWinner ? styles.winText : styles.loseText}>
              {isWinner ? `Você completou a sequência de ${WIN_SEQUENCE_LENGTH} ordens e ganhou 1 ticket!` : 'Você falhou em seguir as ordens. Tente novamente.'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Nova Missão</Text>
            </TouchableOpacity>
          </View>
        );
      
      default: // computerTurn ou playerTurn
        let message = '';
        if (gameState === 'computerTurn') message = 'O Partido está ordenando... Memorize!';
        if (gameState === 'playerTurn') message = 'Sua vez, camarada. Repita a ordem!';
        
        return (
          <View style={styles.centerView}>
            <Text style={styles.info}>Sequência: {sequence.length}</Text>
            <Text style={styles.instructions}>{message}</Text>
            <View style={styles.simonGrid}>
              {symbols.map((symbol, index) => {
                const isActive = activeButton === symbol.key;
                return (
                  <TouchableOpacity
                    key={symbol.key}
                    style={[
                      styles.simonButton,
                      { backgroundColor: symbol.color },
                      index < 2 ? { marginBottom: 10 } : {},
                      index % 2 === 0 ? { marginRight: 10 } : {},
                      isActive && styles.activeButton,
                    ]}
                    onPress={() => handlePlayerPress(symbol)}
                    disabled={gameState !== 'playerTurn'}
                  >
                    <Text style={styles.simonButtonText}>{symbol.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
    }
  };

  return (
    <LinearGradient colors={['#2c3e50', '#34495e', '#2c3e50']} style={styles.container}>
      {renderGameState()}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Recuar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerView: { width: '100%', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16, textAlign: 'center' },
  instructions: { fontSize: 18, color: '#ecf0f1', marginBottom: 24, textAlign: 'center', minHeight: 50 },
  info: { fontSize: 24, color: '#fff', marginBottom: 10, fontWeight: 'bold' },

  simonGrid: {
    width: 250,
    height: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  simonButton: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  simonButtonText: {
    fontSize: 48,
  },
  activeButton: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
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
    color: '#2c3e50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  winText: { fontSize: 20, color: '#8bc34a', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  loseText: { fontSize: 20, color: '#e74c3c', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  backButton: { position: 'absolute', bottom: 40, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
});