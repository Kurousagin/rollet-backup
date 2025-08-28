import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function getRandomQuota() {
  return Math.floor(Math.random() * 100) + 1;
}

export default function MiniGuessGame({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  // --- ESTADOS ---
  const [target, setTarget] = useState(getRandomQuota());
  const [guess, setGuess] = useState('');
  const [tries, setTries] = useState(0);
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#fff');
  // NOVO: Estado para as dicas
  const [hint, setHint] = useState('');
  const [gameState, setGameState] = useState('start');

  // --- ANIMAÇÕES ---
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const messageAnimation = useRef(new Animated.Value(0)).current;

  const startShake = () => {
    shakeAnimation.setValue(0);
    Animated.timing(shakeAnimation, {
      toValue: 1, duration: 400, easing: Easing.linear, useNativeDriver: true,
    }).start();
  };
  
  const showMessage = () => {
    messageAnimation.setValue(0);
    Animated.spring(messageAnimation, {
      toValue: 1, friction: 4, useNativeDriver: true,
    }).start();
  };

  const shakeInterpolate = shakeAnimation.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, -10, 10, -10, 10, -5, 5, -5, 5, 0, 0],
  });

  // --- FUNÇÕES DO JOGO ---
  const handleGuess = () => {
    Keyboard.dismiss();
    const num = Number(guess);
    if (!num || num < 1 || num > 100) {
      setMessage('Relatório Inválido!');
      setMessageColor('#ff6b6b');
      setHint('O Partido não aceita relatórios vazios ou absurdos.');
      startShake();
      showMessage();
      return;
    }
    
    const newTries = tries + 1;
    setTries(newTries);

    if (num === target) {
      setMessage('META ATINGIDA!');
      setMessageColor('#8bc34a');
      setHint(''); // Limpa a dica na vitória
      setGameState('won');
      setTimeout(onWin, 1500);
    } else {
      setMessage(num < target ? 'PRODUZA MAIS!' : 'PRODUZA MENOS!');
      setMessageColor('#ffeb3b');
      
      // --- LÓGICA DAS DICAS ---
      const diff = Math.abs(target - num);
      if (diff <= 5) setHint('Está pelando! A glória está próxima!');
      else if (diff <= 15) setHint('Continue nesse ritmo, camarada! Está esquentando.');
      else if (diff <= 30) setHint('Ainda está longe da meta.');
      else setHint('Sua produção está pífia! Muito longe!');

      // Dicas especiais baseadas no número de tentativas
      if (newTries === 3) {
        setHint(`O Comitê Central informa: a meta é um número ${target % 2 === 0 ? 'PAR' : 'ÍMPAR'}.`);
      }
      if (newTries === 5) {
        setHint(`O plano é ambicioso! A meta é ${target > 50 ? 'MAIOR que 50' : 'MENOR que 50'}.`);
      }
      
      startShake();
    }
    showMessage();
    setGuess('');
  };

  const handleStartGame = () => {
    setGameState('playing');
    setTarget(getRandomQuota());
    setTries(0);
    setGuess('');
    setMessage('');
    setHint(''); // Limpa a dica ao iniciar
  };

  // --- RENDERIZAÇÃO ---
  const renderGameState = () => {
    if (gameState === 'start') {
      return (
        <>
          <Text style={styles.title}>Plano Quinquenal</Text>
          <Text style={styles.instructions}>O Partido definiu uma cota de produção de batatas 🥔.</Text>
          <Text style={styles.instructions}>Adivinhe a meta (1 a 100)!</Text>
          <TouchableOpacity style={styles.button} onPress={handleStartGame}>
            <Text style={styles.buttonText}>Aceitar a Meta</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (gameState === 'won') {
      return (
        <>
          <Text style={styles.title}>🎉 Meta Cumprida! 🎉</Text>
          <Text style={styles.instructions}>Você alcançou o objetivo em {tries} {tries > 1 ? 'relatórios' : 'relatório'}!</Text>
          <Text style={styles.winText}>O Partido te recompensa com 1 ticket 🎟️</Text>
          <TouchableOpacity style={styles.button} onPress={handleStartGame}>
            <Text style={styles.buttonText}>Novo Plano</Text>
          </TouchableOpacity>
        </>
      );
    }
    
    return (
      <>
        <Text style={styles.title}>Qual a cota de hoje?</Text>
        <Text style={styles.info}>Relatório nº {tries + 1}</Text>
        <Animated.Text style={[styles.message, { color: messageColor, transform: [{ scale: messageAnimation }] }]}>
          {message}
        </Animated.Text>
        {/* NOVO: Campo para exibir a dica */}
        {hint && <Text style={styles.hintText}>{hint}</Text>}
        <Animated.View style={{ transform: [{ translateX: shakeInterpolate }] }}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={guess}
            onChangeText={setGuess}
            placeholder="00"
            placeholderTextColor="#6d1616"
            maxLength={3}
            onSubmitEditing={handleGuess}
          />
        </Animated.View>
        <TouchableOpacity style={styles.button} onPress={handleGuess}>
          <Text style={styles.buttonText}>Relatar Produção</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.container}>
      <View style={styles.gameContainer}>
        {renderGameState()}
      </View>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Recuar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// --- ESTILOS TEMÁTICOS ---
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gameContainer: { width: '90%', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16, textAlign: 'center' },
  instructions: { fontSize: 18, color: '#f0f0f0', marginBottom: 12, textAlign: 'center' },
  info: { fontSize: 18, color: '#f8f8f2', marginBottom: 12, textAlign: 'center' },
  input: {
    backgroundColor: '#ffeb3b', borderRadius: 16, borderWidth: 2, borderColor: '#212121',
    color: '#6d1616', width: 140, height: 90, fontSize: 48, fontWeight: 'bold',
    marginBottom: 24, textAlign: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  button: {
    backgroundColor: '#ffeb3b', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14,
    marginVertical: 10, elevation: 5, borderWidth: 2, borderColor: '#212121',
  },
  buttonText: { color: '#6d1616', fontSize: 18, fontWeight: 'bold' },
  message: { fontSize: 24, fontWeight: 'bold', marginVertical: 8, minHeight: 30, textTransform: 'uppercase' },
  // NOVO: Estilo para o texto da dica
  hintText: {
    fontSize: 16,
    color: '#f8f8f2',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 20,
  },
  winText: { fontSize: 22, color: '#8bc34a', marginVertical: 20, fontWeight: 'bold', textAlign: 'center' },
  backButton: { position: 'absolute', bottom: 40, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
});