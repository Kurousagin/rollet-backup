import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- BANCO DE QUESTÕES (sem alterações) ---
const QUESTIONS_PER_ROUND = 5;
interface QuizQuestion {
  q: string;
  options: string[];
  answer: string;
}
const questionBank: QuizQuestion[] = [
  { q: 'De quem é este smartphone que você está usando?', options: ['Meu', 'Seu', 'Do Estado', 'NOSSO'], answer: 'NOSSO' },
  { q: 'Qual destes filósofos alemães tinha a barba mais gloriosamente proletária?', options: ['Nietzsche', 'Hegel', 'Karl Marx', 'Schopenhauer'], answer: 'Karl Marx' },
  { q: 'Complete a famosa frase: "Trabalhadores de todo o mundo,..."', options: ['...tirem férias!', '...peçam um aumento!', '...uni-vos!', '...comprem ações!'], answer: '...uni-vos!' },
  { q: 'Na utopia comunista, o que acontece com a sua propriedade privada?', options: ['Vira NOSSA propriedade', 'É vendida na OLX', 'É valorizada', 'Paga mais imposto'], answer: 'Vira NOSSA propriedade' },
  { q: 'O que é "mais-valia"?', options: ['Um bônus de fim de ano', 'Um imposto sobre herança', 'O lucro do burguês sobre o trabalho do proletário', 'Um tipo de criptomoeda'], answer: 'O lucro do burguês sobre o trabalho do proletário' },
  { q: 'Qual animal é frequentemente associado à União Soviética em memes?', options: ['Águia', 'Leão', 'Urso', 'Lobo'], answer: 'Urso' },
  { q: 'Segundo o manifesto, um espectro ronda a Europa. Que espectro é esse?', options: ['O da gripe espanhola', 'O do comunismo', 'O do aumento do gás', 'O fantasma da ópera'], answer: 'O do comunismo' },
  { q: 'O que significa a sigla URSS?', options: ['União das Repúblicas Socialistas Soviéticas', 'Unidos Rumo ao Sucesso Socialista', 'União Russa de Sindicatos Socialistas', 'Ursos Reunidos Socializando Salsichas'], answer: 'União das Repúblicas Socialistas Soviéticas' },
  { q: 'Quem foi o líder da Revolução Cubana junto com Fidel Castro?', options: ['Stalin', 'Trotsky', 'Che Guevara', 'Lênin'], answer: 'Che Guevara' },
  { q: 'Qual destes NÃO é um pilar do Marxismo?', options: ['Luta de classes', 'Materialismo histórico', 'Defesa do livre mercado', 'Revolução proletária'], answer: 'Defesa do livre mercado' },
  { q: 'A "ditadura do proletariado" é um conceito que se refere a:', options: ['Um reality show', 'Um governo onde a classe trabalhadora detém o poder político', 'Uma peça de teatro', 'Um novo sabor de refrigerante'], answer: 'Um governo onde a classe trabalhadora detém o poder político' },
  { q: 'Qual a cor predominantemente associada ao movimento comunista?', options: ['Azul', 'Verde', 'Amarelo', 'Vermelho'], answer: 'Vermelho' },
  { q: 'O que Lênin defendia com o lema "Paz, Pão e Terra"?', options: ['Uma padaria pacífica no campo', 'A saída da Rússia da 1ª Guerra, reforma agrária e fim da fome', 'Um novo feriado nacional', 'Um aplicativo de delivery'], answer: 'A saída da Rússia da 1ª Guerra, reforma agrária e fim da fome' },
  { q: 'Em teoria, qual seria a fase final do comunismo?', options: ['A anarquia total', 'Uma sociedade sem classes, sem estado e sem dinheiro', 'A dominação mundial', 'A privatização de tudo'], answer: 'Uma sociedade sem classes, sem estado e sem dinheiro' },
  { q: 'Qual livro é considerado a obra principal de Karl Marx?', options: ['O Príncipe', 'A Arte da Guerra', 'O Capital', '50 Tons de Cinza'], answer: 'O Capital' },
  { q: 'O que é um "kulak" na história russa?', options: ['Um tipo de chapéu', 'A camponeses ricos, considerados inimigos da revolução', 'Um prato típico', 'Um líder sindical'], answer: 'A camponeses ricos, considerados inimigos da revolução' },
  { q: 'Qual destes países NÃO faz parte do bloco socialista histórico?', options: ['Polônia', 'Hungria', 'Alemanha Oriental', 'Suíça'], answer: 'Suíça' },
  { q: 'O Muro de Berlim dividia a cidade em duas partes, representando a fronteira entre:', options: ['O bem e o mal', 'O capitalismo e o socialismo', 'O verão e o inverno', 'Dois times de futebol'], answer: 'O capitalismo e o socialismo' },
  { q: 'Quem é o autor de "O Manifesto Comunista" junto com Marx?', options: ['Friedrich Engels', 'Adam Smith', 'John Locke', 'Seu Madruga'], answer: 'Friedrich Engels' },
  { q: 'A foice e o martelo, símbolo comunista, representam a união entre:', options: ['A indústria e a agricultura', 'A força e a inteligência', 'O dia e a noite', 'O pão e o circo'], answer: 'A indústria e a agricultura' },
  { q: 'Qual o nome do primeiro satélite artificial, lançado pela União Soviética?', options: ['Explorer 1', 'Sputnik 1', 'Apollo 11', 'Starlink'], answer: 'Sputnik 1' },
];

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

// Componente (sem alterações na lógica)
export default function MiniQuizGame({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  const [roundQuestions, setRoundQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');

  const startGame = () => {
    const roundSubset = shuffleArray(questionBank).slice(0, QUESTIONS_PER_ROUND);
    const freshQuestions = roundSubset.map(q => ({ ...q, options: shuffleArray(q.options) }));
    setRoundQuestions(freshQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  const handleOptionPress = (selectedOption: string) => {
    if (selectedAnswer !== null) return;
    const currentQuestion = roundQuestions[currentQuestionIndex];
    setSelectedAnswer(selectedOption);
    if (selectedOption === currentQuestion.answer) {
      setScore(s => s + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < roundQuestions.length) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      if (score === QUESTIONS_PER_ROUND - 1 && isCorrect) {
        onWin();
      }
      setGameState('finished');
    }
  };

  const getButtonColor = (option: string) => {
    if (selectedAnswer === null) return styles.button;
    const currentQuestion = roundQuestions[currentQuestionIndex];
    if (option === currentQuestion.answer) return styles.correctButton;
    if (option === selectedAnswer) return styles.incorrectButton;
    return styles.disabledButton;
  };

  const renderGameState = () => {
    if (gameState === 'start') {
      return (
        <View style={styles.centerView}>
          <Text style={styles.title}>Quiz da Revolução</Text>
          <Text style={styles.instructions}>Prove seu conhecimento em 5 perguntas aleatórias!</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Lutar!</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (gameState === 'finished') {
      const allCorrect = score === QUESTIONS_PER_ROUND;
      return (
        <View style={styles.centerView}>
          <Text style={styles.title}>Resultado Final</Text>
          <Text style={styles.finalScore}>Você acertou {score} de {QUESTIONS_PER_ROUND}!</Text>
          {allCorrect ? (
            <Text style={styles.winText}>Missão Cumprida, Camarada! Você ganhou 1 ticket 🎟️</Text>
          ) : (
            <Text style={styles.loseText}>Quase lá! Estude mais os clássicos e tente novamente.</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Jogar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentQuestion = roundQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <View style={styles.centerView}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / roundQuestions.length) * 100}%` }]} />
        </View>
        <Text style={styles.question}>{currentQuestion.q}</Text>
        {currentQuestion.options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.button, getButtonColor(opt)]}
            onPress={() => handleOptionPress(opt)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.buttonText}>{opt}</Text>
          </TouchableOpacity>
        ))}
        {selectedAnswer !== null && (
          <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNextQuestion}>
            <Text style={styles.buttonText}>
              {currentQuestionIndex + 1 < roundQuestions.length ? 'Próxima Pergunta' : 'Ver Resultado'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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

// --- ESTILOS AJUSTADOS ---
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerView: {
    width: '100%', // Mantém 100% da largura do pai
    alignItems: 'center',
    paddingHorizontal: 20, // Adiciona padding horizontal aqui
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffeb3b', marginBottom: 16, textAlign: 'center' },
  instructions: { fontSize: 18, color: '#f0f0f0', marginBottom: 24, textAlign: 'center' },
  progressContainer: { 
    width: '100%', // Barra de progresso ocupa 100% do centerView (que tem padding)
    height: 10, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderRadius: 5, 
    marginBottom: 20 
  },
  progressBar: { height: '100%', backgroundColor: '#8bc34a', borderRadius: 5 },
  question: { fontSize: 22, color: '#fff', marginBottom: 24, fontWeight: 'bold', textAlign: 'center' },

  // --- BOTÕES AJUSTADOS ---
  button: {
    maxWidth: 380, // **CHAVE**: Limita a largura máxima do botão
    width: '100%', // Ainda ocupa 100% dentro do maxWidth
    backgroundColor: '#ffeb3b',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 2,
    borderColor: '#212121',
  },
  buttonText: {
    color: '#6d1616',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctButton: {
    backgroundColor: '#8bc34a',
    borderColor: '#556b2f',
  },
  incorrectButton: {
    backgroundColor: '#ff6b6b',
    borderColor: '#a94442',
  },
  disabledButton: {
    backgroundColor: '#757575',
    borderColor: '#424242',
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: '#4a90e2',
    borderColor: '#2a5298',
  },

  finalScore: { fontSize: 24, color: '#fff', marginVertical: 16, fontWeight: 'bold' },
  winText: { fontSize: 20, color: '#8bc34a', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  loseText: { fontSize: 20, color: '#ff9800', marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  backButton: { position: 'absolute', bottom: 40, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
});