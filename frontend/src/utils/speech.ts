import { playAudioFromBase64 } from './audioRecorder';

let voicesLoaded = false;
let selectedVoice: SpeechSynthesisVoice | null = null;

const loadVoices = (): void => {
  if (!('speechSynthesis' in window)) return;

  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) return;

  // Priority order: English female voices
  // 1. Try to find US English female voice
  let voice = voices.find(v => 
    v.lang.startsWith('en-US') && 
    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
  );

  // 2. Try any English female voice
  if (!voice) {
    voice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
    );
  }

  // 3. Try Google US English female (common across browsers)
  if (!voice) {
    voice = voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Samantha') || 
      v.name.includes('Victoria') ||
      v.name.includes('Karen') ||
      v.name.includes('Moira')
    );
  }

  // 4. Try any US English voice
  if (!voice) {
    voice = voices.find(v => v.lang.startsWith('en-US'));
  }

  // 5. Fallback to any English voice
  if (!voice) {
    voice = voices.find(v => v.lang.startsWith('en'));
  }

  selectedVoice = voice || null;
  voicesLoaded = true;
};

// Initialize voices
if ('speechSynthesis' in window) {
  // Voices might not be loaded immediately
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

export const speakWord = async (word: string, customAudio?: string): Promise<void> => {
  // If custom audio is provided, play it instead of TTS
  if (customAudio) {
    try {
      await playAudioFromBase64(customAudio);
      return;
    } catch (error) {
      console.error('Error playing custom audio, falling back to TTS:', error);
      // Fall through to TTS if custom audio fails
    }
  }

  // Use text-to-speech
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Ensure voices are loaded
  if (!voicesLoaded) {
    loadVoices();
  }

  const utterance = new SpeechSynthesisUtterance(word);
  
  // Set the selected voice if available
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  // Set language to English (US) as fallback
  utterance.lang = 'en-US';
  utterance.rate = 0.6; // Slower for 7-year-olds - clearer pronunciation
  utterance.pitch = 1.1; // Slightly higher pitch for child-friendly tone
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};

export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

export const isAudioRecordingSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Function to get current voice info (useful for debugging)
export const getCurrentVoiceInfo = (): string => {
  if (!selectedVoice) return 'No voice selected';
  return `${selectedVoice.name} (${selectedVoice.lang})`;
};