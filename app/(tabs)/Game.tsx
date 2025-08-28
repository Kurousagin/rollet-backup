import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MiniGuessGame from '../../components/MiniGuessGame';
import MiniMemoryGame from '../../components/MiniMemoryGame';
import MiniQuizGame from '../../components/MiniQuizGame';
import MiniReflexGame from '../../components/MiniReflexGame';
import MiniSimonGame from '../../components/MiniSimonGame';
import MiniTapGame from '../../components/MiniTapGame';
import { useTickets } from '../../hooks/TicketsContext';

// --- JOGOS COM NOMES E ÍCONES TEMÁTICOS ---
const miniGames = [
  { key: 'memory', label: 'Memória do Proletariado', icon: '🧠' },
  { key: 'quiz', label: 'Quiz da Revolução', icon: '📕' },
  { key: 'tap', label: 'Produção Frenética', icon: '🔨' },
  { key: 'reflex', label: 'Reflexo Rápido', icon: '⚡️' },
  { key: 'simon', label: 'O Partido Ordena', icon: '★' },
  { key: 'guess', label: 'Plano Quinquenal', icon: '🥔' },
];

export default function GameMenu() {
    const { tickets, addTickets } = useTickets();
    const [selectedGame, setSelectedGame] = useState<string | null>(null);

    const handleWin = () => {
        addTickets(1);
        // O feedback de vitória agora é gerenciado dentro de cada jogo
    };

    const handleBack = () => {
        setSelectedGame(null);
    };

    // --- MAPA DE COMPONENTES PARA RENDERIZAÇÃO LIMPA ---
    const gameComponents: Record<string, React.ReactElement> = {
        memory: <MiniMemoryGame onWin={handleWin} onBack={handleBack} />,
        quiz: <MiniQuizGame onWin={handleWin} onBack={handleBack} />,
        tap: <MiniTapGame onWin={handleWin} onBack={handleBack} />,
        reflex: <MiniReflexGame onWin={handleWin} onBack={handleBack} />,
        simon: <MiniSimonGame onWin={handleWin} onBack={handleBack} />,
        guess: <MiniGuessGame onWin={handleWin} onBack={handleBack} />,
    };

    // --- RENDERIZAÇÃO CONDICIONAL: MENU OU JOGO ---
    return (
        <LinearGradient colors={['#9a1e1e', '#6d1616', '#3b0c0c']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {selectedGame ? (
                    // Se um jogo foi selecionado, renderiza o componente do jogo
                    gameComponents[selectedGame]
                ) : (
                    // Caso contrário, renderiza o menu principal
                    <View style={styles.menuContainer}>
                        <Text style={styles.title}>Centro de Treinamento</Text>
                        <View style={styles.ticketContainer}>
                            <Text style={styles.ticketIcon}>🎟️</Text>
                            <Text style={styles.ticketText}>{tickets}</Text>
                        </View>
                        <FlatList
                            data={miniGames}
                            numColumns={2}
                            keyExtractor={(item) => item.key}
                            contentContainerStyle={styles.grid}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.button} onPress={() => setSelectedGame(item.key)}>
                                    <Text style={styles.buttonIcon}>{item.icon}</Text>
                                    <Text style={styles.buttonText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    menuContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffeb3b',
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    ticketContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffeb3b',
        marginBottom: 24,
    },
    ticketIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    ticketText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    grid: {
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#ffeb3b',
        borderRadius: 16,
        padding: 16,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 120,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#212121',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    buttonText: {
        color: '#6d1616',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});