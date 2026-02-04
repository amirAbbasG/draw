import { useEffect, useRef, useState } from "react";

interface IProps {
  transcript: string;
  setTranscript: (v: string) => void;
}


/**
 * Custom hook to handle speech-to-text functionality using the Web Speech API.
 * This hook provides functions to start and stop speech recognition,
 *
 * @param {Object} props - The properties object.
 * @param {string} props.transcript - The current transcript of recognized speech.
 * @param {Function} props.setTranscript - Function to update the transcript state.
 *
 * @returns Object - An object containing functions and state variables to manage speech recognition.
 */
export function useSpeechToText({ transcript = "", setTranscript }: IProps) {
  // State variables to manage recording status, completion,
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  // Reference to store the SpeechRecognition instance
  const recognitionRef = useRef<any>(null);

  /**
   * Function to start recording speech.
   * Initializes the SpeechRecognition instance and starts recognition.
   */
  const startRecording = () => {
    setIsRecording(true);
    // Create a new SpeechRecognition instance and configure it
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    // Event handler for speech recognition results
    recognitionRef.current.onresult = (event: any) => {
      const { transcript } = event.results[event.results.length - 1][0];

      // Log the recognition results and update the transcript state
      setTranscript(transcript);
    };

    // Start the speech recognition
    recognitionRef.current.start();
  };

  // Cleanup effect when the component unmounts
  useEffect(() => {
    return () => {
      // Stop the speech recognition if it's active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /**
   * Function to stop recording speech.
   * Stops the SpeechRecognition instance and marks recording as complete.
   */
  const stopRecording = () => {
    if (recognitionRef.current) {
      // Stop the speech recognition and mark recording as complete
      recognitionRef.current.stop();
      setRecordingComplete(true);
    }
  };

  /**
   * Function to toggle the recording state.
   * Starts or stops recording based on the current state.
   */
  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return {
    startRecording,
    stopRecording,
    handleToggleRecording,
    isRecording,
    recordingComplete,
  };
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    __objectReferences?: Map<string, any>;
  }
}