import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { AudioRecorder as Recorder, playAudioFromBase64 } from '@/utils/audioRecorder';
import { showError, showSuccess, showInfo } from '@/utils/toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AudioRecorderProps {
  word: string;
  existingAudio?: string;
  onRecordingComplete: (audio: string) => void;
  onRecordingDelete: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  word,
  existingAudio,
  onRecordingComplete,
  onRecordingDelete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(() => new Recorder());
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(!!existingAudio);

  const handleStartRecording = async () => {
    try {
      // Check if browser supports recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Your browser does not support audio recording. Please use Chrome, Firefox, or Safari.');
        return;
      }

      await recorder.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            // Auto-stop after 10 seconds
            handleStopRecording();
            clearInterval(timer);
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
      
      showSuccess(`Recording "${word}"... Speak clearly! 🎤`);
    } catch (error: any) {
      console.error('Recording start error:', error);
      
      if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
        showError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error.message.includes('NotFoundError')) {
        showError('No microphone found. Please connect a microphone and try again.');
      } else {
        showError('Could not start recording. Please check your microphone.');
      }
    }
  };

  const handleStopRecording = async () => {
    try {
      const { base64 } = await recorder.stopRecording();
      setIsRecording(false);
      setHasRecording(true);
      
      onRecordingComplete(base64);
      showSuccess(`Recording saved for "${word}"! 🎉`);
      showInfo('Click Play to hear your recording');
      
    } catch (error) {
      console.error('Recording stop error:', error);
      showError('Failed to save recording. Please try again.');
      setIsRecording(false);
    }
  };

  const handlePlayRecording = async () => {
    try {
      setIsPlaying(true);
      
      if (existingAudio) {
        await playAudioFromBase64(existingAudio);
      }
      
      setIsPlaying(false);
      showSuccess('Playback complete! 🔊');
    } catch (error: any) {
      console.error('Playback error:', error);
      setIsPlaying(false);
      
      const errorMsg = error?.message || 'Unknown error';
      showError(`Could not play recording: ${errorMsg}`);
      showInfo('Try recording again with a different browser if this keeps happening.');
    }
  };

  const handleDeleteRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    onRecordingDelete();
    showSuccess('Recording deleted.');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {!hasRecording ? (
          <>
            {!isRecording ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleStartRecording}
                className="border-2 border-red-400 text-red-600 hover:bg-red-50 font-bold"
              >
                <Mic className="w-4 h-4 mr-1" />
                🎤 Record
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleStopRecording}
                  className="animate-pulse font-bold"
                >
                  <Square className="w-4 h-4 mr-1" />
                  ⏹️ Stop
                </Button>
                <span className="text-lg font-bold text-red-600 animate-pulse">
                  {recordingTime}s
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handlePlayRecording}
              disabled={isPlaying}
              className="border-2 border-green-400 text-green-600 hover:bg-green-50 font-bold"
            >
              <Play className="w-4 h-4 mr-1" />
              {isPlaying ? '▶️ Playing...' : '▶️ Play'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDeleteRecording}
              className="border-2 border-red-400 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </>
        )}
      </div>
      
      {isRecording && (
        <Alert className="py-2 bg-red-50 border-red-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-700 font-semibold">
            🎤 Recording... Say "{word}" clearly! (Max 10 seconds)
          </AlertDescription>
        </Alert>
      )}
      
      {hasRecording && !isRecording && (
        <Alert className="py-2 bg-green-50 border-green-300">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-700 font-semibold">
            ✅ Recording saved! Click Play to test it.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};