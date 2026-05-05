import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';

export function useBackgroundMusic(uri: string | null | undefined) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentUri = useRef<string | null>(null);
  const isFocused = useIsFocused();

  // Carga música nueva cuando cambia el URI (solo si la pantalla está activa)
  useEffect(() => {
    if (!isFocused) return;

    const normalized = uri || null;
    if (normalized === currentUri.current) return;

    let mounted = true;

    const load = async () => {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (!normalized || !mounted) return;

      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: normalized },
          { shouldPlay: true, isLooping: true, volume: 0.6 }
        );
        if (mounted) {
          soundRef.current = sound;
          currentUri.current = normalized;
        } else {
          await sound.unloadAsync();
        }
      } catch (e) {
        console.error('Error cargando música:', e);
      }
    };

    load();
    return () => { mounted = false; };
  }, [uri, isFocused]);

  // Pausa al perder foco, reanuda al recuperarlo
  useEffect(() => {
    if (!soundRef.current) return;
    if (isFocused) {
      soundRef.current.playAsync();
    } else {
      soundRef.current.pauseAsync();
    }
  }, [isFocused]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      soundRef.current?.stopAsync().then(() => {
        soundRef.current?.unloadAsync();
        soundRef.current = null;
        currentUri.current = null;
      });
    };
  }, []);
}
