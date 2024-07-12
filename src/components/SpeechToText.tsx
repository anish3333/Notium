'use client';

import React, { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';
interface SpeechToTextProps {
  onTextChange: (text: string) => void;
  handleStopRecording: (text: string) => void
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTextChange, handleStopRecording }) => {
  const { transcript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();
  const [isRecording, setIsRecording] = useState<boolean>(false);


  useEffect(() => {
    // console.log(transcript);
    onTextChange(transcript);
    
  }, [onTextChange, transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const startRecording = () => {
    SpeechRecognition.startListening({ continuous: true });
    setIsRecording(true);
  };

  const stopRecording = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
    handleStopRecording(transcript);
    
  };

  return (
    <div className='text-white'>
      <button
        className='bg-gray-800 rounded-lg shadow-lg'
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? <MicOff width={20} height={20} /> : <Mic width={20} height={20} />}
      </button>
    </div>
  );
};

export default SpeechToText;
