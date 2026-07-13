import '@testing-library/jest-dom';

// Mock window.speechSynthesis and window.webkitSpeechRecognition for standard headless environments
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    speakUtterance: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'SpeechRecognition', {
  value: vi.fn(),
  writable: true,
});
