
import { Language } from '../components/ui/LanguageSelector';

export const translations: Record<Language, any> = {
  english: {
    nav: {
      home: 'Home',
      scanner: 'Scanner',
      generator: 'Generator',
      studio: 'Studio',
      weather: 'Weather',
      about: 'About',
      vision: 'Vision',
    },
    hero: {
      title: 'The Future of Waste is',
      subtitle: 'Transforming discarded materials into futuristic assets through AI-powered neural upcycling.',
      startScanning: 'Start Neural Scan',
      exploreStudio: 'Enter Upcycling Studio',
    },
    scanner: {
      title: 'Neural Waste Scanner',
      subtitle: 'Upload a visual data stream to identify material composition and synthesize reuse protocols.',
      dropPrompt: 'Drop imagery here or click to initiate uplink',
      analyzing: 'Analyzing Material...',
      noIdeas: 'No neural patterns found. Try another stream.',
      getMore: 'Not Satisfied? Generate More Ideas',
    },
    generator: {
      title: 'Neural Idea Generator',
      subtitle: 'Describe a discarded object to synthesize creative upcycling possibilities.',
      placeholder: 'Enter object description (e.g., "damaged solar panels")...',
      generate: 'Synthesize Ideas',
      loading: 'Synthesizing Neural Protocols...',
    },
    studio: {
      title: 'Premium Upcycling Studio',
      subtitle: 'Enter the specific waste item to generate high-end, luxury upcycling blueprints.',
      placeholder: 'What is your base medium? (e.g., "Aviation scrap")',
      generate: 'Generate Blueprints',
      loading: 'Engineering Blueprints...',
      protocol: 'Protocol',
      manifested: 'Manifested',
    },
    weather: {
      title: 'Atmospheric Telemetry',
      subtitle: 'Real-time environmental synchronization and local microclimate diagnostics.',
      temp: 'Temperature',
      humidity: 'Humidity',
      aqi: 'Air Quality',
    }
  },
  hindi: {
    nav: {
      home: 'मुख्य पृष्ठ',
      scanner: 'स्कैनर',
      generator: 'जेनरेटर',
      studio: 'स्टूडियो',
      weather: 'मौसम',
      about: 'हमारे बारे में',
      vision: 'विजन',
    },
    hero: {
      title: 'कचरे का भविष्य',
      subtitle: 'AI-संचालित अपसाइकिलिंग के माध्यम से बेकार सामग्री को भविष्य की संपत्ति में बदलें।',
      startScanning: 'स्कैन शुरू करें',
      exploreStudio: 'स्टूडियो में प्रवेश करें',
    },
    scanner: {
      title: 'न्यूरल वेस्ट स्कैनर',
      subtitle: 'सामग्री की पहचान करने और पुन: उपयोग के तरीकों को खोजने के लिए फोटो अपलोड करें।',
      dropPrompt: 'यहाँ फोटो डालें या शुरू करने के लिए क्लिक करें',
      analyzing: 'सामग्री का विश्लेषण हो रहा है...',
      noIdeas: 'कोई पैटर्न नहीं मिला। कृपया पुनः प्रयास करें।',
      getMore: 'संतुष्ट नहीं? और विचार प्राप्त करें',
    },
    generator: {
      title: 'न्यूरल आइडिया जेनरेटर',
      subtitle: 'क्रिएटिव अपसाइकिलिंग संभावनाओं को खोजने के लिए वस्तु का वर्णन करें।',
      placeholder: 'वस्तु का वर्णन करें (जैसे, "पुराने कपड़े")...',
      generate: 'विचार तैयार करें',
      loading: 'प्रोटोकॉल तैयार हो रहे हैं...',
    },
    studio: {
      title: 'प्रीमियम अपसाइकिलिंग स्टूडियो',
      subtitle: 'लक्जरी अपसाइकिलिंग ब्लूप्रिंट तैयार करने के लिए कचरे की वस्तु का नाम लिखें।',
      placeholder: 'आपकी वस्तु क्या है? (जैसे, "प्लास्टिक की बोतलें")',
      generate: 'ब्लूप्रिंट तैयार करें',
      loading: 'इंजीनियरिंग ब्लूप्रिंट...',
      protocol: 'प्रोटोकॉल',
      manifested: 'प्रकट हुआ',
    },
    weather: {
      title: 'वायुमंडलीय टेलीमेट्री',
      subtitle: 'वास्तविक समय में पर्यावरणीय जानकारी और स्थानीय सूक्ष्म जलवायु निदान।',
      temp: 'तापमान',
      humidity: 'नमी',
      aqi: 'वायु गुणवत्ता',
    }
  },
  haryanvi: {
    nav: {
      home: 'घर',
      scanner: 'स्कैन करण आला',
      generator: 'बणाण आला',
      studio: 'स्टूडियो',
      weather: 'मोसम',
      about: 'म्हारे बारे में',
      vision: 'सपणा',
    },
    hero: {
      title: 'कुड़े का भविष्य',
      subtitle: 'बेकार सामन ने AI के गेल्या बढ़िया चीज्जां में बदलो।',
      startScanning: 'स्कैन करना शुरू करो',
      exploreStudio: 'स्टूडियो में जाओ',
    },
    scanner: {
      title: 'न्यूरल वेस्ट स्कैनर',
      subtitle: 'सामान की पहचान खातिर फोटो गेरदो।',
      dropPrompt: 'फोटो उरे गेरो या दबओ',
      analyzing: 'सामान परखा जा रहा सै...',
      noIdeas: 'किसे पैटर्न नी मिल्या। फेर कोशिश करो।',
      getMore: 'मजा नी आया? और विचार लाओ',
    },
    generator: {
      title: 'न्यूरल आइडिया जेनरेटर',
      subtitle: 'कबाड़ ते बढ़िया चीज बणाण खातिर सामान का नाम लिखो।',
      placeholder: 'सामान का नाम लिखो (जैसे, "पुराणा टायर")...',
      generate: 'विचार बणाओ',
      loading: 'प्रोटोकॉल बण रहे सें...',
    },
    studio: {
      title: 'प्रीमियम अपसाइकिलिंग स्टूडियो',
      subtitle: 'बढ़िया लक्जरी सामान का नक्शा बणाण खातिर कचरे का नाम लिखो।',
      placeholder: 'के सामान सै थारे पे? (जैसे, "लोहे का कबाड़")',
      generate: 'नक्शा बणाओ',
      loading: 'काम चालू सै...',
      protocol: 'नक्शा',
      manifested: 'बण ग्या',
    },
    weather: {
      title: 'मोसम की जानकारी',
      subtitle: 'असली टेम का मोसम और हवा की रिपोर्ट।',
      temp: 'गर्मी-जड्डा',
      humidity: 'नमी',
      aqi: 'हवा की क्वालिटी',
    }
  },
  punjabi: {
    nav: {
      home: 'ਘਰ',
      scanner: 'ਸਕੈਨਰ',
      generator: 'ਜੇਨਰੇਟਰ',
      studio: 'ਸਟੂਡੀਓ',
      weather: 'ਮੌਸਮ',
      about: 'ਸਾਡੇ ਬਾਰੇ',
      vision: 'ਵਿਜ਼ਨ',
    },
    hero: {
      title: 'ਕੂੜੇ ਦਾ ਭਵਿੱਖ',
      subtitle: 'AI ਰਾਹੀਂ ਬੇਕਾਰ ਸਮਾਨ ਨੂੰ ਕੀਮਤੀ ਚੀਜ਼ਾਂ ਵਿੱਚ ਬਦਲੋ।',
      startScanning: 'ਸਕੈਨ ਸ਼ੁਰੂ ਕਰੋ',
      exploreStudio: 'ਸਟੂਡੀਓ ਵਿੱਚ ਜਾਓ',
    },
    scanner: {
      title: 'ਨਿਊਰਲ ਵੇਸਟ ਸਕੈਨਰ',
      subtitle: 'ਸਮਾਨ ਦੀ ਪਛਾਣ ਕਰਨ ਲਈ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।',
      dropPrompt: 'ਫੋਟੋ ਇੱਥੇ ਪਾਓ ਜਾਂ ਕਲਿੱਕ ਕਰੋ',
      analyzing: 'ਸਮਾਨ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...',
      noIdeas: 'ਕੋਈ ਪੈਟਰਨ ਨਹੀਂ ਮਿਲਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      getMore: 'ਸੰਤੁਸ਼ਟ ਨਹੀਂ? ਹੋਰ ਵਿਚਾਰ ਲਓ',
    },
    generator: {
      title: 'ਨਿਊਰਲ ਆਈਡੀਆ ਜੇਨਰੇਟਰ',
      subtitle: 'ਨਵੇਂ ਵਿਚਾਰਾਂ ਲਈ ਸਮਾਨ ਦਾ ਨਾਮ ਲਿਖੋ।',
      placeholder: 'ਸਮਾਨ ਦਾ ਨਾਮ (ਜਿਵੇਂ, "ਪੁਰਾਣੇ ਟਾਇਰ")...',
      generate: 'ਵਿਚਾਰ ਤਿਆਰ ਕਰੋ',
      loading: 'ਤਿਆਰੀ ਹੋ ਰਹੀ ਹੈ...',
    },
    studio: {
      title: 'ਪ੍ਰੀਮੀਅਮ ਅਪਸਾਈਕਲਿੰਗ ਸਟੂਡੀਓ',
      subtitle: 'ਵਧੀਆ ਨਕਸ਼ੇ ਲਈ ਕੂੜੇ ਦਾ ਨਾਮ ਲਿਖੋ।',
      placeholder: 'ਤੁਹਾਡੇ ਕੋਲ ਕੀ ਹੈ? (ਜਿਵੇਂ, "ਲੋਹਾ")',
      generate: 'ਨਕਸ਼ਾ ਤਿਆਰ ਕਰੋ',
      loading: 'ਕੰਮ ਚੱਲ ਰਿਹਾ ਹੈ...',
      protocol: 'ਨਕਸ਼ਾ',
      manifested: 'ਬਣ ਗਿਆ',
    },
    weather: {
      title: 'ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ',
      subtitle: 'ਅਸਲੀ ਸਮੇਂ ਦਾ ਮੌਸਮ ਅਤੇ ਹਵਾ ਦੀ ਰਿਪੋਰਟ।',
      temp: 'ਤਾਪਮਾਨ',
      humidity: 'ਨਮੀ',
      aqi: 'ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ',
    }
  }
};

export const useTranslation = (lang: Language) => {
  return translations[lang] || translations.english;
};
