const langMap = {
  zh: 'zh-CN',
  en: 'en-US',
  jap: 'ja-JP',
  vi: 'vi-VN',
}

export function say(msg: string, lang = 'zh') {
  const ssu = new SpeechSynthesisUtterance()
  ssu.text = msg
  ssu.lang = langMap[lang as keyof typeof langMap]
  ssu.rate = 1
  ssu.volume = 1
  ssu.pitch = 1
  speechSynthesis.speak(ssu)
}
