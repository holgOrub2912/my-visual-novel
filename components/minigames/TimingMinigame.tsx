import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { TimingConfig } from '../../types/game';

interface Props {
  config: TimingConfig;
  onComplete: () => void;
  onFail: () => void;
}

type Result = 'idle' | 'success' | 'fail';

export default function TimingMinigame({ config, onComplete, onFail }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const startTime = useRef<number>(0);
  const [result, setResult] = useState<Result>('idle');

  useEffect(() => {
    startAnimation();
    return () => animRef.current?.stop();
  }, []);

  const startAnimation = () => {
    progress.setValue(0);
    startTime.current = Date.now();

    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: config.duration,
      useNativeDriver: false,
    });

    animRef.current.start(({ finished }) => {
      // Si termino sin que tocara pues fallo
      if (finished && result === 'idle') {
        setResult('fail');
        setTimeout(onFail, 600);
      }
    });
  };

  const handleTap = () => {
    if (result !== 'idle') return;

    animRef.current?.stop();
    const elapsed = Date.now() - startTime.current;
    const diff = Math.abs(elapsed - config.targetMs);

    if (diff <= config.windowMs) {
      setResult('success');
      setTimeout(onComplete, 600);
    } else {
      setResult('fail');
      setTimeout(() => {
        setResult('idle');
        onFail();
        startAnimation();
      }, 800);
    }
  };

  // Posicion de la zona objetivo sobre la barra (0–1)
  const targetRatio = config.targetMs / config.duration;

  const barColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f06292', '#e91e8c'],
  });

  return (
    <View className="flex-1 items-center justify-center px-10 bg-pink-50">
      <Text className="mb-6 text-center text-sm font-bold text-navy-800">
        ¡Toca cuando la barra llegue a la zona!
      </Text>

      {/* Barra de progreso */}
      <View className="relative mb-8 h-6 w-full rounded-full bg-pink-200 overflow-hidden">
        {/* Zona objetivo */}
        <View
          className="absolute top-0 h-full w-8 rounded-full bg-yellow-300 opacity-80"
          style={{ left: `${(targetRatio - 0.04) * 100}%` }}
        />

        {/* Barra animada */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            borderRadius: 999,
            backgroundColor: barColor,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      {/* Feedback */}
      {result !== 'idle' && (
        <Text
          className={`mb-4 text-lg font-bold ${
            result === 'success' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {result === 'success' ? '¡Perfecto! ✓' : 'Muy tarde... ✗'}
        </Text>
      )}

      {/* Boton de toque */}
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.8}
        className="rounded-2xl bg-pink-500 px-10 py-5 shadow-md"
      >
        <Text className="text-xl font-bold text-white">¡AHORA!</Text>
      </TouchableOpacity>
    </View>
  );
}