import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

interface FavoritesContextProps {
  favorites: ImageSourcePropType[];
  addFavorite: (card: ImageSourcePropType) => void;
  removeFavorite: (card: ImageSourcePropType) => void;
  isFavorite: (card: ImageSourcePropType) => boolean;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<ImageSourcePropType[]>([]);
  
  // Carrega favoritos do AsyncStorage ao iniciar
  React.useEffect(() => {
    AsyncStorage.getItem('favorites').then(data => {
      if (data) setFavorites(JSON.parse(data));
    });
  }, []);
  
  // Salva favoritos no AsyncStorage sempre que mudar
  React.useEffect(() => {
    AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (card: ImageSourcePropType) => {
    setFavorites((prev) => {
      if (!prev.includes(card)) {
        return [...prev, card];
      }
      return prev;
    });
  };

  const removeFavorite = (card: ImageSourcePropType) => {
    setFavorites((prev) => prev.filter((fav) => fav !== card));
  };

  const isFavorite = (card: ImageSourcePropType) => favorites.includes(card);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
