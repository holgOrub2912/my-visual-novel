import { Stack, Link } from 'expo-router';

import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';

/*

export default function Home() {
  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home"></ScreenContent>
        <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          <Button title="Show Details" />
        </Link>
      </Container>
    </View>
  );
}

const styles = {
  container: 'flex flex-1 bg-white',
};
*/

import React from 'react';
import { Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff0f6" />

      {/* Imagen de portada */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-2 h-64 w-64 items-center justify-center rounded-full bg-pink-100 overflow-hidden">
          {/* Reemplaza con tu imagen de portada */}
          <Text className="text-8xl">📖</Text>
        </View>

        {/* Título */}
        <Text className="mt-6 text-center text-3xl font-bold text-navy-800">
          Bienvenido a esta
        </Text>
        <Text className="text-center text-3xl font-bold text-navy-800">
          historia
        </Text>

        {/* Botones */}
        <View className="mt-10 w-full gap-4">
          <TouchableOpacity
            onPress={() => router.push('/saves?mode=new')}
            className="rounded-2xl bg-pink-400 py-4 shadow-sm"
          >
            <Text className="text-center text-base font-bold text-white">
              Nueva Historia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/saves?mode=continue')}
            className="rounded-2xl bg-pink-500 py-4 shadow-sm"
          >
            <Text className="text-center text-base font-bold text-white">
              Guardados
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}