
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => alert('No se pudo abrir el enlace'));
  };

  return (
    <>
      
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right' }} />
      
      <SafeAreaView className="flex-1 bg-pink-50">
        <StatusBar barStyle="dark-content" backgroundColor="#fff0f6" />

        <View className="flex-row items-center px-4 py-3 border-b border-pink-200 bg-white/80">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-pink-100 active:bg-pink-200"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-2xl text-pink-500">←</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold text-navy-800 pr-10">
            Acerca de
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-8">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-pink-200">
              <Text className="text-5xl">📖</Text>
            </View>
          </View>

          {/* Titulo */}
          <Text className="text-center text-2xl font-bold text-navy-800 mb-2">
            Mi Novela Visual
          </Text>
          <Text className="text-center text-sm text-pink-500 mb-8">
            Versión 1.0.0
          </Text>

          {/* Descripción */}
          <View className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
            <Text className="text-base text-navy-700 leading-6">
              En un mundo muy lejano bla bla lore.
              Esta aplicación es una novela visual interactiva creada como proyecto 
              académico. Disfruta de una historia con decisiones, minijuegos y 
              múltiples finales.
            </Text>
          </View>

          {/* Seccion: Nosotros */}
          <Text className="mb-3 text-lg font-bold text-navy-800">Un trabajo hecho por...</Text>
          <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-base text-navy-700">
              • Samuel Betancur{'\n'}
              • Jacobo Arevalo{'\n'}
              • Isabela Arrubla 
            </Text>
          </View>

          {/* Seccion: Tecnologías */}
          <Text className="mb-3 text-lg font-bold text-navy-800">Gracias a...</Text>
          <View className="mb-8 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-base text-navy-700">
              • React Native con Expo{'\n'}
              • TypeScript{'\n'}
              • Zustand (estado global){'\n'}
              • AsyncStorage (guardado local)
            </Text>
          </View>

          {/* links*/}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => openLink('https://github.com/tu-usuario/tu-repo')}
              className="rounded-xl bg-navy-800 py-3"
            >
              <Text className="text-center text-sm font-bold text-pink-500">
                Ver código en GitHub →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openLink('mailto:tu-email@ejemplo.com')}
              className="rounded-xl border-2 border-pink-300 py-3"
            >
              <Text className="text-center text-sm font-bold text-pink-500">
                ✉️ Contáctanos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-12 items-center pb-8">
            <Text className="text-xs text-pink-300">
              Hecho con amor para la materia de Apps Móviles
            </Text>
            <Text className="mt-1 text-xs text-pink-200">
              © 2026 UPB
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}