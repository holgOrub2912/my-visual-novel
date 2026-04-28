import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../stores/gameStore';
import MinigameFactory from '../components/minigames/MinigameFactory'
import { MinigameConfig, MinigameType } from '../types/game';

//TODO: Ampliar esto y sacarlo de aca
const getBackgroundSource = (bgName: string): any => {
  const bgMap: Record<string, any> = {
    'fondoGen': require('../assets/backgrounds/fondoGen.png')
  };
  
  return bgMap[bgName] || null;
};

export default function GameScreen() {
  const router = useRouter();
  const {
    activeSlot,
    currentScene,
    phase,
    nextDialog,
    completeMinigame,
    failMinigame,
  } = useGameStore();

  // Forzar landscape al entrar, restaurar vertical al salir
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // si no hay slot activo, volver al menú 
  if (!activeSlot) {
    router.replace('/');
    return null;
  }

  // cuando estamos pasando de partes de la historia
  if (phase === 'transition') {
    return (
      <View className="flex-1 items-center justify-center bg-pink-50">
        <ActivityIndicator size="large" color="#e91e8c" />
      </View>
    );
  }

  // cuando terminamos
  if (phase === 'ended') {
    return (
      <View className="flex-1 items-center justify-center bg-pink-50 px-10">
        <Text className="mb-4 text-3xl">🎉</Text>
        <Text className="text-center text-2xl font-bold text-navy-800 mb-2">
          ¡Historia completada!
        </Text>
        <Text className="text-center text-sm text-pink-400 mb-8">
          Has terminado las 3 partes
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          className="rounded-2xl bg-pink-500 px-8 py-4"
        >
          <Text className="font-bold text-white">Volver al menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // cuando estamos en un minijuego
  if (phase === 'minigame') {
    return (
      <SafeAreaView className="flex-1 bg-pink-50">
        <StatusBar hidden />
        {/* Header del minijuego */}
        <View className="flex-row items-center justify-between px-4 py-2">
          <Text className="text-sm font-bold text-navy-800">
            {currentScene.id.replace('_minigame', '').replace('parte', 'Parte ')}
          </Text>
          <Text className="text-sm text-pink-400">Minijuego</Text>
        </View>

        <MinigameFactory
          type={currentScene.minigameType as MinigameType}
          config={currentScene.config as MinigameConfig}
          onComplete={completeMinigame}
          onFail={failMinigame}
        />
      </SafeAreaView>
    );
  }

  // Para un dialogo 
  const dialogue = currentScene.dialogues?.[activeSlot.currentDialogIndex];
  const totalLines = currentScene.dialogues?.length ?? 0;
  const isLastLine = activeSlot.currentDialogIndex >= totalLines - 1;

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <StatusBar hidden />

      {/* Fondo de escena */}
      {currentScene.background ? (
        <Image
          source={getBackgroundSource(currentScene.background)}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute inset-0 items-center justify-center bg-gray-300">
          <Text className="text-6xl">🖼️</Text>
        </View>
      )}

      {/* Boton menu */}
      <View className="flex-row justify-end px-4 pt-2">
        <TouchableOpacity
          onPress={() => router.push('/saves?mode=continue')}
          className="rounded-full bg-white/80 px-3 py-2"
        >
          <Text className="text-lg">☰</Text>
        </TouchableOpacity>
      </View>

      {/* Caja de dialogo */}
      <View className="flex-1 justify-end">
        <TouchableOpacity
          activeOpacity={1}
          onPress={nextDialog}
          className="mx-4 mb-4 rounded-2xl bg-pink-400/90 px-6 py-4 flex-row items-end justify-between"
        >
          <View className="flex-1 pr-4">
            {dialogue?.character && (
              <Text className="mb-1 text-xs font-bold text-white/80 uppercase tracking-widest">
                {'>'} {dialogue.character}
              </Text>
            )}
            <Text className="text-base font-semibold text-white leading-5">
              {dialogue?.text ?? ''}
            </Text>
          </View>

          {/* Boton siguiente */}
          <View className="items-center justify-center rounded-xl bg-white px-4 py-2">
            <Text className="text-xs font-bold text-pink-500">
              {isLastLine && currentScene.nextScene ? 'Continuar ▶' : 'Siguiente ▶'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Barrita de progreso de dialogos */}
        <View className="mb-2 flex-row justify-center gap-1">
          {currentScene.dialogues?.map((_, i) => (
            <View
              key={i}
              className={`h-1 w-4 rounded-full ${
                i <= activeSlot.currentDialogIndex ? 'bg-pink-500' : 'bg-pink-200'
              }`}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}