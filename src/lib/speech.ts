export function speak(text: string, rate = 0.95) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export type SpeechListener = {
  start: () => void;
  stop: () => void;
  supported: boolean;
};

type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };

type RecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function createRecognizer(onText: (text: string) => void, onEnd: () => void): SpeechListener {
  const w = window as Window & {
    SpeechRecognition?: new () => RecognitionInstance;
    webkitSpeechRecognition?: new () => RecognitionInstance;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return { start() {}, stop() {}, supported: false };
  const recognition = new Ctor();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const text = event.results[0]?.[0]?.transcript || "";
    onText(text);
  };
  recognition.onerror = () => onEnd();
  recognition.onend = () => onEnd();
  return {
    supported: true,
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
