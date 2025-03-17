import { Image, StyleSheet, Platform } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '../../components/Collapsible';
import ItineraryPlanner from '@/wizards/ItineraryPlanner';
import { Input } from '../../components/ui';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" className="max-w-md mx-auto p-4">Say Hi to Ri-chan!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Start your Trip to Japan</ThemedText>
          <Collapsible title="Create your ideal itinerary">
            <ItineraryPlanner />
          </Collapsible>
          <ThemedText type="defaultSemiBold">Reserve Trains</ThemedText>
          <ThemedText type="defaultSemiBold">Book Hotels</ThemedText>
          <ThemedText type="defaultSemiBold">Buy Property</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
