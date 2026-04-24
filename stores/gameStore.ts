import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStore, GamePhase, SaveSlot, Scene } from '../types/game';
import storyData from '../data/story.json';

// ─── Constantes ───────────────────────────────────────────────────────────────
const FIRST_SCENE_ID = 'parte1_intro';
const STORAGE_KEY = (slotId: number) => `@save_slot_${slotId}`;

// ─── Escena inicial segura ────────────────────────────────────────────────────
const getScene = (id: string): Scene => {
  const scene = (storyData.scenes as Record<string, Scene>)[id];
  if (!scene) throw new Error(`Escena no encontrada: ${id}`);
  return scene;
};

// ─── Slot vacío ───────────────────────────────────────────────────────────────
const createSlot = (slotId: 1 | 2 | 3): SaveSlot => ({
  slotId,
  currentSceneId: FIRST_SCENE_ID,
  currentDialogIndex: 0,
  completedMinigames: [],
  flags: {},
  stats: { playTimeSeconds: 0, minigamesAttempts: 0 },
  lastSavedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGameStore = create<GameStore>((set, get) => ({
  activeSlot: null,
  currentScene: getScene(FIRST_SCENE_ID),
  phase: 'transition' as GamePhase,
  isLoading: false,

  // ── Inicia partida nueva en un slot ────────────────────────────────────────
  startNewGame: async (slotId) => {
    const slot = createSlot(slotId);
    set({
      activeSlot: slot,
      currentScene: getScene(FIRST_SCENE_ID),
      phase: 'reading',
      isLoading: false,
    });
    await persistSlot(slot);
  },

  // ── Continúa partida desde AsyncStorage ────────────────────────────────────
  continueGame: async (slotId) => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY(slotId));
      if (!raw) throw new Error('Slot vacío');
      const slot: SaveSlot = JSON.parse(raw);
      set({
        activeSlot: slot,
        currentScene: getScene(slot.currentSceneId),
        phase: 'reading',
        isLoading: false,
      });
    } catch (e) {
      console.error('Error al cargar partida:', e);
      set({ isLoading: false });
    }
  },

  // ── Avanza el diálogo o lanza transición ───────────────────────────────────
  nextDialog: () => {
    const { currentScene, activeSlot, phase } = get();
    if (phase !== 'reading' || !activeSlot) return;

    const maxIndex = (currentScene.dialogues?.length ?? 1) - 1;

    if (activeSlot.currentDialogIndex < maxIndex) {
      // Hay más líneas de diálogo
      set((state) => ({
        activeSlot: state.activeSlot
          ? { ...state.activeSlot, currentDialogIndex: state.activeSlot.currentDialogIndex + 1 }
          : null,
      }));
      return;
    }

    // Fin del diálogo → transición
    if (!currentScene.nextScene) {
      // Es el ending
      set({ phase: 'ended' });
      return;
    }

    set({ phase: 'transition' });

    const nextSceneId = currentScene.nextScene;
    const nextScene = getScene(nextSceneId);
    const isMinigame = nextScene.type === 'minigame';

    setTimeout(() => {
      set((state) => ({
        phase: isMinigame ? 'minigame' : 'reading',
        currentScene: nextScene,
        activeSlot: state.activeSlot
          ? {
              ...state.activeSlot,
              currentSceneId: nextSceneId,
              currentDialogIndex: 0,
            }
          : null,
      }));
    }, 500);
  },

  // ── Minijuego completado ────────────────────────────────────────────────────
  completeMinigame: () => {
    const { currentScene, activeSlot } = get();
    if (!activeSlot || !currentScene.nextScene) return;

    const newFlags = { ...activeSlot.flags };
    if (currentScene.onComplete?.setFlag) {
      newFlags[currentScene.onComplete.setFlag] = true;
    }

    const nextSceneId = currentScene.nextScene;
    const nextScene = getScene(nextSceneId);

    const updatedSlot: SaveSlot = {
      ...activeSlot,
      currentSceneId: nextSceneId,
      currentDialogIndex: 0,
      completedMinigames: [...activeSlot.completedMinigames, currentScene.id],
      flags: newFlags,
      lastSavedAt: new Date().toISOString(),
    };

    set({
      phase: nextScene.type === 'ending' ? 'ended' : 'reading',
      currentScene: nextScene,
      activeSlot: updatedSlot,
    });

    persistSlot(updatedSlot);
  },

  // ── Minijuego fallado → reinicia el minijuego ──────────────────────────────
  failMinigame: () => {
    const { activeSlot } = get();
    if (!activeSlot) return;

    const updatedSlot: SaveSlot = {
      ...activeSlot,
      stats: {
        ...activeSlot.stats,
        minigamesAttempts: activeSlot.stats.minigamesAttempts + 1,
      },
    };

    set({ phase: 'minigame', activeSlot: updatedSlot });
  },

  // ── Guarda slot activo ─────────────────────────────────────────────────────
  saveGame: async () => {
    const { activeSlot } = get();
    if (!activeSlot) return;
    const updated = { ...activeSlot, lastSavedAt: new Date().toISOString() };
    set({ activeSlot: updated });
    await persistSlot(updated);
  },

  // ── Carga todos los slots para la pantalla de guardados ────────────────────
  loadAllSlots: async () => {
    const results = await Promise.all(
      ([1, 2, 3] as const).map(async (id) => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY(id));
          return raw ? (JSON.parse(raw) as SaveSlot) : null;
        } catch {
          return null;
        }
      })
    );
    return results;
  },

  // ── Borra un slot ──────────────────────────────────────────────────────────
  deleteSlot: async (slotId) => {
    await AsyncStorage.removeItem(STORAGE_KEY(slotId));
  },
}));

// ─── Helper interno para persistir ───────────────────────────────────────────
async function persistSlot(slot: SaveSlot): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY(slot.slotId), JSON.stringify(slot));
  } catch (e) {
    console.error('Error al guardar slot:', e);
  }
}