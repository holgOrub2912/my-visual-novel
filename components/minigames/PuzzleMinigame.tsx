import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PuzzleConfig } from '../../types/game';

interface Props {
  config: PuzzleConfig;
  onComplete: () => void;
  onFail: () => void;
}

export default function PuzzleMinigame({ config, onComplete, onFail }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  const remaining = config.pieces.filter((p) => !selected.includes(p));

  const handlePieceTap = (piece: string) => {
    const next = [...selected, piece];
    setSelected(next);

    if (next.length === config.correctOrder.length) {
      const isCorrect =
        JSON.stringify(next) === JSON.stringify(config.correctOrder);

      if (isCorrect) {
        onComplete();
      } else {
        // Feedback visual + reset
        setShake(true);
        setTimeout(() => {
          setSelected([]);
          setShake(false);
          onFail();
        }, 600);
      }
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8 bg-pink-50">
      {/* Instrucción */}
      <Text className="mb-4 text-center text-sm font-bold text-navy-800">
        Ordena los elementos correctamente
      </Text>

      {/* Zona de respuesta */}
      <View
        className={`mb-6 flex-row gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm ${
          shake ? 'border-2 border-red-400' : 'border border-pink-200'
        }`}
      >
        {config.correctOrder.map((_, i) => (
          <View
            key={i}
            className="h-14 w-14 items-center justify-center rounded-xl bg-pink-100"
          >
            <Text className="text-2xl">{selected[i] ?? ''}</Text>
          </View>
        ))}
      </View>

      {/* Piezas disponibles */}
      <View className="flex-row flex-wrap justify-center gap-3">
        {remaining.map((piece) => (
          <TouchableOpacity
            key={piece}
            onPress={() => handlePieceTap(piece)}
            className="h-14 w-14 items-center justify-center rounded-xl bg-pink-400 shadow-sm"
          >
            <Text className="text-2xl">{piece}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reset manual */}
      {selected.length > 0 && (
        <TouchableOpacity
          onPress={() => setSelected([])}
          className="mt-6 rounded-full bg-pink-200 px-5 py-2"
        >
          <Text className="text-sm font-semibold text-pink-700">Reiniciar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}