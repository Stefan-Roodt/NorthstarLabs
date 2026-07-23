type SpeechVoiceLike = {
  name: string;
  lang?: string;
  voiceURI: string;
  localService?: boolean;
};

function voiceScore(voice: SpeechVoiceLike) {
  const name = voice.name.toLowerCase();
  const language = (voice.lang || "").toLowerCase();
  let score = language.startsWith("en") ? 20 : -100;
  if (language.startsWith("en-za") || language.startsWith("en-gb")) score += 12;
  if (/(natural|neural|online)/.test(name)) score += 35;
  if (/(george|mark|guy|ryan|libby|sonia|samantha|daniel)/.test(name)) score += 18;
  if (/google uk english/.test(name)) score += 14;
  if (/david/.test(name)) score -= 8;
  if (voice.localService) score += 2;
  return score;
}

export function preferredSpeechVoice<T extends SpeechVoiceLike>(
  voices: T[],
  savedVoiceUri = "",
) {
  const saved = voices.find((voice) => voice.voiceURI === savedVoiceUri);
  if (saved) return saved;
  return [...voices].sort((left, right) => voiceScore(right) - voiceScore(left))[0] || null;
}
