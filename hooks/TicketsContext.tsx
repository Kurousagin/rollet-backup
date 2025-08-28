import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface TicketsContextProps {
  tickets: number;
  addTickets: (amount: number) => void;
  useTicket: () => boolean;
}

const TicketsContext = createContext<TicketsContextProps | undefined>(undefined);

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<number>(0); // Valor inicial restaurado

  useEffect(() => {
    AsyncStorage.getItem('tickets').then(data => {
      if (data) setTickets(Number(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('tickets', String(tickets));
  }, [tickets]);

  const addTickets = (amount: number) => setTickets(t => Math.max(0, t + amount));
  const useTicket = () => {
    if (tickets > 0) {
      setTickets(t => t - 1);
      return true;
    }
    return false;
  };

  return (
    <TicketsContext.Provider value={{ tickets, addTickets, useTicket }}>
      {children}
    </TicketsContext.Provider>
  );
};

export function useTickets() {
  const context = useContext(TicketsContext);
  if (!context) throw new Error('useTickets must be used within a TicketsProvider');
  return context;
}
