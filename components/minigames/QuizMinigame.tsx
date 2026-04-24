import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QuizConfig } from '../../types/game';

interface Props {
  config: QuizConfig;
  onComplete: () => void;
  onFail: () => void;
}

export default function QuizMinigame({ config, onComplete, onFail }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);

    setTimeout(() => {
      if (index === config.correctIndex) {
        onComplete();
      } else {
        // Reinicia estado local para que el usuario vea el error y reintente
        setSelected(null);
        setAnswered(false);
        onFail();
      }
    }, 800);
  };

  const getOptionStyle = (index: number): string => {
    if (!answered || selected !== index) {
      return 'border border-pink-300 bg-white/20';
    }
    return index === config.correctIndex
      ? 'bg-green-400 border border-green-500'
      : 'bg-red-400 border border-red-500';
  };

  return (
    <View className="flex-1 items-center justify-center px-8 bg-pink-50">
      {/* Pregunta */}
      <View className="mb-8 rounded-2xl bg-white px-6 py-5 shadow-sm w-full">
        <Text className="text-center text-base font-bold text-navy-800">
          {config.question}
        </Text>
      </View>

      {/* Opciones */}
      <View className="w-full gap-3">
        {config.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSelect(index)}
            disabled={answered}
            className={`rounded-xl px-5 py-4 ${getOptionStyle(index)}`}
          >
            <Text className="text-center text-sm font-semibold text-navy-800">
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}