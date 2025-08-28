import { useState } from 'react';
import { ImageSourcePropType } from 'react-native';

export function useFavorites() {
  const [favorites, setFavorites] = useState<ImageSourcePropType[]>([]);

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

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
