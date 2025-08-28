import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

interface ViewedContextProps {
  viewed: ImageSourcePropType[];
  addViewed: (card: ImageSourcePropType) => void;
  isViewed: (card: ImageSourcePropType) => boolean;
}

const ViewedContext = createContext<ViewedContextProps | undefined>(undefined);

export const ViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewed, setViewed] = useState<ImageSourcePropType[]>([]);

  // Carrega cartas visualizadas do AsyncStorage ao iniciar
  React.useEffect(() => {
    AsyncStorage.getItem('viewed').then(data => {
      if (data) setViewed(JSON.parse(data));
    });
  }, []);

  // Salva cartas visualizadas no AsyncStorage sempre que mudar
  React.useEffect(() => {
    AsyncStorage.setItem('viewed', JSON.stringify(viewed));
  }, [viewed]);

  // Adiciona carta visualizada apenas se não existir (comparando por URI)
  const addViewed = (card: ImageSourcePropType) => {
    setViewed((prev) => {
      if (typeof card === 'object' && card !== null && 'uri' in card) {
        if (!prev.some(v => typeof v === 'object' && v !== null && 'uri' in v && v.uri === card.uri)) {
          return [...prev, card];
        }
      } else {
        if (!prev.includes(card)) {
          return [...prev, card];
        }
      }
      return prev;
    });
  };

  // Verifica se a carta já foi visualizada (comparando por URI)
  const isViewed = (card: ImageSourcePropType) => {
    if (typeof card === 'object' && card !== null && 'uri' in card) {
      return viewed.some(v => typeof v === 'object' && v !== null && 'uri' in v && v.uri === card.uri);
    }
    return viewed.includes(card);
  };

  return (
    <ViewedContext.Provider value={{ viewed, addViewed, isViewed }}>
      {children}
    </ViewedContext.Provider>
  );
};

export function useViewed() {
  const context = useContext(ViewedContext);
  if (!context) {
    throw new Error('useViewed must be used within a ViewedProvider');
  }
  return context;
}
