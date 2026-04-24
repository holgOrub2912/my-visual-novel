// ─── Estado de la máquina de estados ─────────────────────────────────────────
export type GamePhase = 'reading' | 'minigame' | 'transition' | 'ended';

// ─── Tipos de minijuego ───────────────────────────────────────────────────────
export type MinigameType = 'quiz' | 'puzzle' | 'timing';

// ─── Diálogo ──────────────────────────────────────────────────────────────────
export interface DialogueNode {
  character: string;
  text: string;
  emotion?: string;
}

// ─── Configuración de cada minijuego ─────────────────────────────────────────
export interface QuizConfig {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface PuzzleConfig {
  pieces: string[];
  correctOrder: string[];
}

export interface TimingConfig {
  targetMs: number;   // Momento exacto al que el usuario debe tocar (ms)
  windowMs: number;   // Margen de tolerancia (ms)
  duration: number;   // Duración total de la barra (ms)
}

export type MinigameConfig = QuizConfig | PuzzleConfig | TimingConfig;

// ─── Escena ───────────────────────────────────────────────────────────────────
export interface Scene {
  id: string;
  type: 'dialogue' | 'minigame' | 'ending';
  background?: string;
  music?: string;
  dialogues?: DialogueNode[];
  minigameType?: MinigameType;
  config?: MinigameConfig;
  nextScene: string | null;
  requiredFlags?: string[];
  onEnter?: { setFlag?: string };
  onComplete?: { setFlag?: string; addPoints?: number };
}

// ─── Datos de historia ────────────────────────────────────────────────────────
export interface StoryData {
  metadata: { version: string; title: string };
  scenes: Record<string, Scene>;
}

// ─── Progreso guardado (un slot) ──────────────────────────────────────────────
export interface SaveSlot {
  slotId: 1 | 2 | 3;
  currentSceneId: string;
  currentDialogIndex: number;
  completedMinigames: string[];
  flags: Record<string, boolean>;
  stats: {
    playTimeSeconds: number;
    minigamesAttempts: number;
  };
  lastSavedAt: string;   // ISO date
  createdAt: string;     // ISO date
}

// ─── Estado completo del store ────────────────────────────────────────────────
export interface GameStore {
  // Estado de partida activa
  activeSlot: SaveSlot | null;
  currentScene: Scene;
  phase: GamePhase;
  isLoading: boolean;

  // Acciones de flujo
  startNewGame: (slotId: 1 | 2 | 3) => Promise<void>;
  continueGame: (slotId: 1 | 2 | 3) => Promise<void>;
  nextDialog: () => void;
  completeMinigame: () => void;
  failMinigame: () => void;

  // Acciones de persistencia
  saveGame: () => Promise<void>;
  loadAllSlots: () => Promise<(SaveSlot | null)[]>;
  deleteSlot: (slotId: 1 | 2 | 3) => Promise<void>;
}