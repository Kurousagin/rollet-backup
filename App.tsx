import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AppTabs from './app/(tabs)/index';
import { FavoritesProvider } from './hooks/FavoritesContext';
import { TicketsProvider } from './hooks/TicketsContext';
import { ViewedProvider } from './hooks/ViewedContext';

export default function App() {
		return (
			<TicketsProvider>
				<FavoritesProvider>
					<ViewedProvider>
						<NavigationContainer>
							<AppTabs />
						</NavigationContainer>
					</ViewedProvider>
				</FavoritesProvider>
			</TicketsProvider>
		);
}
