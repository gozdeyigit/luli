export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      // Request microphone access with better error handling
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Try different MIME types for better browser compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
        '' // Empty string will use browser default
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('✅ Selected MIME type:', mimeType || 'browser default');
          break;
        }
      }
      
      if (selectedMimeType === '') {
        this.mediaRecorder = new MediaRecorder(this.stream);
      } else {
        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: selectedMimeType });
      }
      
      console.log('✅ MediaRecorder created with MIME type:', this.mediaRecorder.mimeType);
      
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📦 Audio chunk received:', event.data.size, 'bytes');
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event: any) => {
        console.error('❌ MediaRecorder error:', event);
        throw new Error('Recording failed: ' + (event.error?.message || 'Unknown error'));
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('🎤 Recording started');
    } catch (error: any) {
      console.error('❌ Error starting recording:', error);
      
      // Clean up stream if it was created
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Permission denied: Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No microphone found: Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Microphone is busy: Please close other apps using the microphone.');
      } else {
        throw new Error('Could not access microphone: ' + (error.message || 'Unknown error'));
      }
    }
  }

  stopRecording(): Promise<{ base64: string; blob: Blob }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          console.log('🎵 Creating blob with MIME type:', mimeType);
          console.log('📦 Total chunks:', this.audioChunks.length);
          
          if (this.audioChunks.length === 0) {
            throw new Error('No audio data recorded. Please try again.');
          }
          
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          console.log('✅ Blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
          
          if (audioBlob.size === 0) {
            throw new Error('Recording is empty. Please speak louder and try again.');
          }
          
          const base64Audio = await this.blobToBase64(audioBlob);
          console.log('✅ Base64 conversion complete, length:', base64Audio.length);
          
          // Stop all tracks
          if (this.stream) {
            this.stream.getTracks().forEach(track => {
              track.stop();
              console.log('🛑 Track stopped:', track.kind);
            });
            this.stream = null;
          }
          
          resolve({ base64: base64Audio, blob: audioBlob });
        } catch (error) {
          console.error('❌ Error in onstop handler:', error);
          reject(error);
        }
      };

      console.log('⏹️ Stopping recording...');
      this.mediaRecorder.stop();
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        reject(new Error('Failed to read audio data'));
      };
      reader.readAsDataURL(blob);
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// Convert base64 to blob for playback
const base64ToBlob = (base64: string): Blob => {
  try {
    const parts = base64.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Invalid base64 format');
    }
    
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });
    console.log('✅ Converted base64 to blob:', blob.size, 'bytes, type:', blob.type);
    return blob;
  } catch (error) {
    console.error('❌ Error converting base64 to blob:', error);
    throw new Error('Failed to decode audio data');
  }
};

export const playAudioFromBase64 = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔊 Playing audio from base64...');
      const blob = base64ToBlob(base64Audio);
      playAudioFromBlob(blob).then(resolve).catch(reject);
    } catch (error) {
      console.error('❌ Error in playAudioFromBase64:', error);
      reject(error);
    }
  });
};

export const playAudioFromBlob = (blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🎵 Creating audio element from blob:', blob.type, blob.size, 'bytes');
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      // Set up all event listeners before loading
      audio.onloadedmetadata = () => {
        console.log('✅ Audio metadata loaded, duration:', audio.duration);
      };
      
      audio.oncanplaythrough = () => {
        console.log('✅ Audio can play through - starting playback');
        audio.play()
          .then(() => {
            console.log('▶️ Playback started successfully');
          })
          .catch((error) => {
            console.error('❌ Play promise rejected:', error);
            URL.revokeObjectURL(url);
            reject(new Error('Cannot play audio: ' + error.message));
          });
      };
      
      audio.onended = () => {
        console.log('✅ Playback ended normally');
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (event) => {
        console.error('❌ Audio error event:', event);
        console.error('❌ Audio error details:', {
          error: audio.error,
          code: audio.error?.code,
          message: audio.error?.message
        });
        URL.revokeObjectURL(url);
        
        const errorMessages = [
          'Unknown error',
          'Audio loading aborted',
          'Network error',
          'Audio decoding failed',
          'Audio format not supported'
        ];
        
        const errorCode = audio.error?.code || 0;
        const errorMsg = errorMessages[errorCode] || errorMessages[0];
        reject(new Error(errorMsg));
      };
      
      // Load the audio
      audio.load();
      
    } catch (error) {
      console.error('❌ Error creating audio element:', error);
      reject(error);
    }
  });
};