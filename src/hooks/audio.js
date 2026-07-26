import { useState, useRef, useCallback } from "react";


export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [didStopRecording, setDidStopRecording] = useState(false);
    const [error, setError] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const recognitionRef = useRef(null);

    const getSpeechRecognition = () => {
        if (typeof window === "undefined") return null;
        return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    };

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setAudioBlob(null);
            setTranscript("");
            setInterimTranscript("");
            setDidStopRecording(false);
            chunksRef.current = [];

            const SpeechRecognition = getSpeechRecognition();
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;

                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "en-US";

                recognition.onresult = (event) => {
                    let interim = "";
                    let finalText = "";

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const res = event.results[i];
                        const text = res?.[0]?.transcript || "";
                        if (res.isFinal) finalText += text;
                        else interim += text;
                    }

                    if (finalText) {
                        setTranscript((prev) => (prev ? (prev + " " + finalText).trim() : finalText.trim()));
                    }

                    setInterimTranscript(interim.trim());
                };

                recognition.onerror = (event) => {
                    const msg = event?.error ? `Speech recognition error: ${event.error}` : "Speech recognition error";
                    setError(msg);
                };

                try {
                    recognition.start();
                } catch {
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            setError(err.message || "Failed to start recording");
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        setDidStopRecording(true);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
            }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

        }
    }, []);

    return { startRecording, stopRecording, isRecording, audioBlob, transcript, interimTranscript, didStopRecording, error };
};
