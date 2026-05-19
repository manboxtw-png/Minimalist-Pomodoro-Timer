/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const MODES: Record<Mode, { label: string; time: number }> = {
  focus: { label: '專注', time: 25 * 60 },
  shortBreak: { label: '短休息', time: 5 * 60 },
  longBreak: { label: '長休息', time: 15 * 60 },
};

export default function App() {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Load completed pomodoros from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(`pomodoros-${today}`);
    setCompletedPomodoros(storedData ? parseInt(storedData, 10) : 0);
  }, []);

  // Update localStorage when completed count changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`pomodoros-${today}`, completedPomodoros.toString());
  }, [completedPomodoros]);

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        setCompletedPomodoros((prev) => prev + 1);
        setMode('shortBreak');
        setTimeLeft(MODES.shortBreak.time);
      } else {
        setMode('focus');
        setTimeLeft(MODES.focus.time);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  // Update title
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    document.title = `(${minutes}:${seconds}) ${MODES[mode].label}`;
  }, [timeLeft, mode]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  }, [mode]);

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(false);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">蕃茄鐘</h1>
        
        <div className="flex justify-center space-x-2 mb-8">
          {(['focus', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                mode === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="text-8xl font-mono font-bold mb-8">
          {minutes}:{seconds}
        </div>

        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <button onClick={handleStart} className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition">
              開始
            </button>
          ) : (
            <button onClick={handlePause} className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition">
              暫停
            </button>
          )}
          <button onClick={handleReset} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition">
            重設
          </button>
        </div>

        <div className="mt-8 text-gray-500">
          今日完成：{completedPomodoros} 個
        </div>
      </div>
    </div>
  );
}

