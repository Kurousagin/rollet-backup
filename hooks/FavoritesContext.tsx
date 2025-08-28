import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';

interface FavoritesContextProps {
  favorites: string[]; // lista de uris
  addFavorite: (uri: string) => void;
  removeFavorite: (uri: string) => void;
  isFavorite: (uri: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
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

  const addFavorite = (uri: string) => {
    setFavorites((prev) => {
      if (!prev.includes(uri)) {
        return [...prev, uri];
      }
      return prev;
    });
  };

  const removeFavorite = (uri: string) => {
    setFavorites((prev) => prev.filter((fav) => fav !== uri));
  };

  const isFavorite = (uri: string) => favorites.includes(uri);

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
