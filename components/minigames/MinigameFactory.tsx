import React from 'react';
import { View, Text } from 'react-native';
import { MinigameType, MinigameConfig, QuizConfig, PuzzleConfig, TimingConfig } from '../../types/game';
import QuizMinigame from './QuizMinigame';
import PuzzleMinigame from './PuzzleMinigame';
import TimingMinigame from './TimingMinigame';

interface Props {
  type: MinigameType;
  config: MinigameConfig;
  onComplete: () => void;
  onFail: () => void;
}

export default function MinigameFactory({ type, config, onComplete, onFail }: Props) {
  switch (type) {
    case 'quiz':
      return (
        <QuizMinigame
          config={config as QuizConfig}
          onComplete={onComplete}
          onFail={onFail}
        />
      );
    case 'puzzle':
      return (
        <PuzzleMinigame
          config={config as PuzzleConfig}
          onComplete={onComplete}
          onFail={onFail}
        />
      );
    case 'timing':
      return (
        <TimingMinigame
          config={config as TimingConfig}
          onComplete={onComplete}
          onFail={onFail}
        />
      );
    default:
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Tipo de minijuego desconocido: {type}</Text>
        </View>
      );
  }
}