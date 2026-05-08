import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../stores/gameStore';
import { SaveSlot } from '../types/game';

export default function SavesScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: 'new' | 'continue' }>();
  const { loadAllSlots, startNewGame, continueGame, deleteSlot } = useGameStore();

  const [slots, setSlots] = useState<(SaveSlot | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllSlots().then((data) => {
      setSlots(data);
      setLoading(false);
    });
  }, []);

  const handleSlotPress = async (slotId: 1 | 2 | 3, slot: SaveSlot | null) => {
    if (mode === 'new') {
      if (slot) {
        // Slot ocupado, se debería sobreescriturar
        Alert.alert(
          'Slot ocupado',
          '¿Quieres borrar este guardado y empezar de nuevo?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sí, borrar',
              style: 'destructive',
              onPress: async () => {
                await deleteSlot(slotId);
                await startNewGame(slotId);
                router.replace('/game');
              },
            },
          ]
        );
      } else {
        await startNewGame(slotId);
        router.replace('/game');
      }
    } else {
      // mode === 'continue'
      if (!slot) return; // Slot vacío, no se hace nada xd
      await continueGame(slotId);
      router.replace('/game');
    }
  };

  const handleDelete = (slotId: 1 | 2 | 3) => {
    Alert.alert('Borrar guardado', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await deleteSlot(slotId);
          const updated = await loadAllSlots();
          setSlots(updated);
        },
      },
    ]);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const completedParts = (slot: SaveSlot) =>
    slot.completedMinigames.length;

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-pink-500">←</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-navy-800">Guardados</Text>
          <Text className="text-sm text-pink-400">
            {mode === 'new' ? 'Elige un slot para tu partida' : 'Elige una partida para continuar'}
          </Text>
        </View>
      </View>

      {/* Slots */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#e91e8c" />
        </View>
      ) : (
        <ScrollView 
        className="flex-1 px-6 pt-4"
        contentContainerClassName="gap-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
          {([1, 2, 3] as const).map((slotId) => {
            const slot = slots[slotId - 1];
            const isEmpty = !slot;
            const isDisabled = mode === 'continue' && isEmpty;

            return (
              <TouchableOpacity
                key={slotId}
                onPress={() => handleSlotPress(slotId, slot)}
                disabled={isDisabled}
                className={`rounded-2xl p-4 shadow-sm ${
                  isEmpty ? 'bg-white border-2 border-dashed border-pink-200' : 'bg-white border border-pink-100'
                } ${isDisabled ? 'opacity-40' : 'opacity-100'}`}
              >
                <View className="flex-row items-center gap-4">
                  {/* Preview / icono */}
                  <View className="h-20 w-20 items-center justify-center rounded-xl bg-pink-100">
                    <Text className="text-4xl">{isEmpty ? '＋' : '📖'}</Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-base font-bold text-navy-800">
                      Save {slotId}
                    </Text>
                    {isEmpty ? (
                      <Text className="text-sm text-pink-300">Slot vacío</Text>
                    ) : (
                      <>
                        <Text className="text-sm text-pink-400">
                          {completedParts(slot)} / 3 partes completadas
                        </Text>
                        <Text className="text-xs text-pink-300 mt-1">
                          {formatDate(slot.lastSavedAt)}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Boton borrar (solo si tiene datos) */}
                  {!isEmpty && (
                    <TouchableOpacity
                      onPress={() => handleDelete(slotId)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text className="text-lg text-pink-300">🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}