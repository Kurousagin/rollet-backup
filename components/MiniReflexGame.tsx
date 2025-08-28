import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

function getRandomDelay() {
  return 1500 + Math.random() * 2000;
}

export default function MiniReflexGame({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  // --- ESTADOS ---
  // Adicionado o estado 'tooSlow' para quem demorar para clicar
  const [gameState, setGameState] = useState<'start' | 'waiting' | 'ready' | 'tooSoon' | 'tooSlow' | 'finished'>('start');
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);

  // --- REFS ---
  // Ref para guardar o ID do timer e poder cancelá-lo
  const reactionTimerRef = useRef<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // --- ANIMAÇÕES ---
  useEffect(() => {
    if (gameState === 'waiting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [gameState]);

  // --- LÓGICA DO JOGO ---
  useEffect(() => {
    let waitTimer: number;

    if (gameState === 'waiting' && tries < 5) {
      waitTimer = setTimeout(() => {
        setGameState('ready');
      }, getRandomDelay());
    }

    // NOVO: Timer de reação de 1 segundo
    if (gameState === 'ready') {
      reactionTimerRef.current = setTimeout(() => {
        setGameState('tooSlow'); // Se o tempo acabar, o jogador foi lento demais
      }, 1000); // 1 segundo de limite
    }

    // Limpeza de todos os timers
    return () => {
      clearTimeout(waitTimer);
      if (reactionTimerRef.current) {
        clearTimeout(reactionTimerRef.current);
      }
    };
  }, [gameState, tries]);

  const startGame = () => {
    setScore(0);
    setTries(0);
    setGameState('waiting');
  };

  const advanceToNextTry = () => {
    const nextTries = tries + 1;
    setTries(nextTries);
    if (nextTries >= 5) {
      // Verifica a vitória ao finalizar as 5 tentativas
      if (score >= 3) {
        onWin();
      }
      setGameState('finished');
    } else {
      setGameState('waiting'); // Prepara para a próxima rodada
    }
  };

  const handleTap = () => {
    // Se clicar antes da hora
    if (gameState === 'waiting') {
      setGameState('tooSoon');
      return;
    }

    // Se clicar a tempo
    if (gameState === 'ready') {
      // Cancela o timer de "lento demais" porque o jogador acertou
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      
      setScore(s => s + 1);
      advanceToNextTry(); // Avança para a próxima tentativa (ou finaliza)
    }
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'start':
        return (
          <>
            <Text style={styles.title}>Reflexo Rápido</Text>
            <Text style={styles.instructions}>Clique no botão quando ficar verde. Seja rápido, mas não se precipite!</Text>
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Iniciar Treinamento</Text>
            </TouchableOpacity>
          </>
        );

      case 'waiting':
      case 'ready':
        const isReady = gameState === 'ready';
        return (
          <>
            <Text style={styles.info}>Pontos: {score}</Text>
            <Text style={styles.info}>Tentativa: {tries + 1} / 5</Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.reflexButton, isReady ? styles.readyButton : styles.waitingButton]}
                onPress={handleTap}
              >
                <Text style={styles.reflexButtonText}>{isReady ? 'AGORA!' : 'Aguarde o Sinal...'}</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        );

      case 'tooSoon':
      case 'tooSlow':
        const isTooSoon = gameState === 'tooSoon';
        return (
          <>
            <Text style={styles.title}>{isTooSoon ? '💥 PRECIPITADO! 💥' : '🐌 LENTO DEMAIS! 🐌'}</Text>
            <Text style={styles.instructions}>
              {isTooSoon ? 'A impaciência é traição!' : 'O inimigo não perdoa a lentidão, camarada.'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={advanceToNextTry}>
              <Text style={styles.buttonText}>{tries < 4 ? 'Próxima Tentativa' : 'Ver Resultado'}</Text>
            </TouchableOpacity>
          </>
        );

      case 'finished':
        const isWinner = score >= 3;
        return (
          <>
            <Text style={styles.title}>Treinamento Concluído</Text>
            <Text style={styles.finalScore}>Pontuação Final: {score} / 5</Text>
            {isWinner ? (
              <Text style={styles.winText}>Reflexos aprovados! Você ganhou 1 ticket 🎟️</Text>
            ) : (
              <Text style={styles.loseText}>Seus reflexos precisam de mais treino. Tente novamente.</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Reiniciar Treinamento</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <LinearGradient colors={['#2E1C2B', '#3E2C41', '#4F3A57']} style={styles.container}>
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
  instructions: { fontSize: 18, color: '#f0f0f0', marginBottom: 24, textAlign: 'center', lineHeight: 24 },
  info: { fontSize: 20, color: '#fff', marginBottom: 10, fontWeight: '600' },
  finalScore: { fontSize: 24, color: '#fff', marginVertical: 16, fontWeight: 'bold' },
  
  reflexButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  waitingButton: {
    backgroundColor: '#c0392b',
    borderColor: '#e74c3c',
  },
  readyButton: {
    backgroundColor: '#27ae60',
    borderColor: '#2ecc71',
  },
  reflexButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
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
    color: '#3E2C41',
    fontSize: 18,
    fontWeight: 'bold',
  },

  winText: { fontSize: 20, color: '#8bc34a', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  loseText: { fontSize: 20, color: '#e74c3c', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  backButton: { position: 'absolute', bottom: 40, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
});