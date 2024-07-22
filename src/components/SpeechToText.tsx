'use client';

import React, { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';

interface SpeechToTextProps {
  handleStopRecording: (text: string) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ handleStopRecording }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    setIsRecording(listening);
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const toggleRecording = () => {
    if (isRecording) {
      SpeechRecognition.stopListening();
      handleStopRecording(transcript);
      setTimeout(() => resetTranscript(), 100); 
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className='text-white'>
      <button
        className='bg-gray-800 rounded-lg shadow-lg p-2'
        onClick={toggleRecording}
      >
        {isRecording ? <MicOff width={20} height={20} /> : <Mic width={20} height={20} />}
      </button>
    </div>
  );
};

export default SpeechToText;