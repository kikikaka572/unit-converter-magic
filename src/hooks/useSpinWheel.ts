import { useState, useCallback } from "react";
import { SPIN_PRESETS } from "@/lib/spinPresets";

const HISTORY_KEY = "lifetool_spin_history";
const MAX_HISTORY = 10;
const DEFAULT_ITEMS = ["한식", "중식", "일식", "양식", "분식", "패스트푸드"];
const MAX_ITEMS = 12;
const MIN_ITEMS = 2;

export type SpinHistoryItem = {
  item: string;
  timestamp: number;
};

function loadHistory(): SpinHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as SpinHistoryItem[];
  } catch {
    return [];
  }
}

function saveHistory(h: SpinHistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

export function useSpinWheel() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [winner, setWinner] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<SpinHistoryItem[]>(loadHistory);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const updateItem = useCallback((index: number, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => (prev.length >= MAX_ITEMS ? prev : [...prev, ""]));
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => (prev.length <= MIN_ITEMS ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const resetItems = useCallback(() => {
    setItems(DEFAULT_ITEMS);
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const preset = SPIN_PRESETS.find((p) => p.id === presetId);
    if (preset) setItems([...preset.items]);
  }, []);

  const handleSpinComplete = useCallback((winnerItem: string) => {
    setWinner(winnerItem);
    setShowResult(true);
    setHistory((prev) => {
      const next = [{ item: winnerItem, timestamp: Date.now() }, ...prev].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const dismissResult = useCallback(() => setShowResult(false), []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const deleteHistoryItem = useCallback((index: number) => {
    setHistory((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveHistory(next);
      return next;
    });
  }, []);

  return {
    items,
    winner,
    showResult,
    history,
    soundEnabled,
    setSoundEnabled,
    updateItem,
    addItem,
    removeItem,
    resetItems,
    loadPreset,
    handleSpinComplete,
    dismissResult,
    clearHistory,
    deleteHistoryItem,
    canAdd: items.length < MAX_ITEMS,
    canRemove: items.length > MIN_ITEMS,
  };
}
