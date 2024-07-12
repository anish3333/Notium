'use client';

import React, { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
interface SpeechToTextProps {
  onTextChange: (text: string) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTextChange }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    onTextChange(transcript);
  }, [transcript, onTextChange]);

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
  };

  return (
    <div className='text-white max-w-md'>
      <button
        className='bg-gray-800 p-6 rounded-lg shadow-lg'
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>{transcript}</p>
    </div>
  );
};

const Page: React.FC = () => {
  const [transcribedText, setTranscribedText] = useState<string>('');

  const handleTextChange = (newText: string) => {
    setTranscribedText(newText);
  };

  return (
    <div>
      <SpeechToText onTextChange={handleTextChange} />
      <p>Transcribed Text: {transcribedText}</p>
    </div>
  );
};

export default Page;
