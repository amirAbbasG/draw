import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to handle text-to-speech functionality.
 * This hook provides methods to play, pause, resume, and stop speech synthesis.
 *
 * @param {string} text - The text to be spoken.
 * @param {number} [volume=1] - The volume of the speech (0.0 to 1.0).
 * @returns Object - An object containing the state and control functions for text-to-speech.
 */
export function useTextToSpeech(text: string, volume: number = 1) {
  //state to manage the speaking status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>();
  //state to manage the pause status
  const [isPaused, setIsPaused] = useState(true);
  //state to manage the current time of the speech
  const [currentTime, setCurrentTime] = useState(0);
  //state to manage the total time of the speech
  const [totalTime, setTotalTime] = useState(0);
  const startTimeRef = useRef(0);
  const passedTimeRef = useRef(0);
  const utterance = new SpeechSynthesisUtterance(text);
  const language = "pt-BR";
  const availableVoices = voices?.filter(({ lang }) => lang === language);
  const activeVoice = voices?.find(
    ({ name }) => name.includes("Google") || availableVoices?.[0],
  );

  useEffect(() => {
    // Set the voice for the utterance
    const speechSynth = window.speechSynthesis.getVoices();
    if (Array.isArray(speechSynth) && speechSynth.length > 0) {
      setVoices(speechSynth);
      return;
    }
    // Set the default voice if no specific voice is found
    if ("onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = function () {
        const speechSynth = window.speechSynthesis.getVoices();
        setVoices(speechSynth);
      };
    }
  }, [text]);

  //calculate the total time based on the text length
  useEffect(() => {
    //count the number of letters in the text
    const letters = text.replace(/\s+/g, "").length;
    //calculate the average speaking rate in letters per minute
    const averageLettersPerMinute = 860; // Average speaking rate in letters per minute
    const estimatedTotalTime = (letters / averageLettersPerMinute) * 60;
    setTotalTime(estimatedTotalTime);
  }, [text]);

  /**
   * Function to start speaking the text.
   */
  const handlePlaySpeak = () => {
    setIsSpeaking(true);
    setIsPaused(false);
    setCurrentTime(0);
    startTimeRef.current = Date.now();
    utterance.onboundary = event => {
      if (event.name === "word") {
        // Calculate the current time based on the elapsed time
        setCurrentTime(
          (Date.now() - startTimeRef.current) / 1000 + passedTimeRef.current,
        );
      }
    };
    utterance.volume = volume; // Set initial volume
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(true);
      setCurrentTime(0);
      passedTimeRef.current = 0;
    };
    speechSynthesis.speak(utterance);
  };

  /**
   * Function to stop speaking the text.
   */
  const handleStopSpeak = () => {
    setIsSpeaking(false);
    setIsPaused(true);
    setCurrentTime(0);
    speechSynthesis.cancel();
    passedTimeRef.current = 0;
  };

  /**
   * Function to pause speaking the text.
   */
  const handlePauseSpeak = () => {
    setIsPaused(true);
    speechSynthesis.pause();
  };

  /**
   * Function to resume speaking the text.
   */
  const handleResumeSpeak = () => {
    setIsPaused(false);
    speechSynthesis.resume();
    passedTimeRef.current = currentTime;
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    return () => {
      handleStopSpeak();
    };
  }, []);

  return {
    isSpeaking,
    isPaused,
    handlePlaySpeak,
    handleStopSpeak,
    handlePauseSpeak,
    handleResumeSpeak,
    totalTime,
    currentTime,
  };
}
