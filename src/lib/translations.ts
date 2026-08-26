import { Language } from '../components/ui/LanguageSelector';

export const translations: Record<Language, any> = {
  english: {
    nav: {
      home: 'Home',
      scanner: 'Scanner',
      generator: 'Generator',
      reportWaste: 'Report Waste',
      operations: 'Operations',
      rewards: 'Rewards',
      about: 'About',
      vision: 'Vision',
    },
    hero: {
      title: 'The Future of Waste is',
      subtitle: 'Transforming discarded materials into circular assets through AI-powered neural upcycling and civic reporting.',
      startScanning: 'Start Neural Scan',
      reportWaste: 'Report Waste Hotspot',
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
    reportWaste: {
      title: 'Report Waste & Hotspots',
      subtitle: 'Geotag unmanaged waste dumps, overflowing bins, and hazardous hotspots with real-time AI verification.',
      submitTab: 'Report Waste',
      myReportsTab: 'My Reports',
      rewardsTab: 'Eco Rewards',
      leaderboardTab: 'Leaderboard',
      adminTab: 'Municipal Admin',
    },
    operations: {
      title: 'Waste Operations Command',
      subtitle: 'Integrated telemetry across collection, transportation, segregation, and recycling centers.',
      collection: 'Collection',
      transport: 'Transportation',
      segregation: 'Segregation',
      recycling: 'Recycling Centers',
    }
  },
  hindi: {
    nav: {
      home: 'मुख्य पृष्ठ',
      scanner: 'स्कैनर',
      generator: 'जेनरेटर',
      reportWaste: 'रिपोर्ट वेस्ट',
      operations: 'ऑपरेशन्स',
      rewards: 'इको रिवॉर्ड्स',
      about: 'हमारे बारे में',
      vision: 'विजन',
    },
    hero: {
      title: 'कचरे का भविष्य',
      subtitle: 'AI-संचालित अपसाइकिलिंग और नागरिक कचरा रिपोर्टिंग के माध्यम से स्वच्छ भारत और चक्रीय अर्थव्यवस्था।',
      startScanning: 'स्कैन शुरू करें',
      reportWaste: 'कचरा हॉटस्पॉट रिपोर्ट करें',
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
    reportWaste: {
      title: 'कचरा रिपोर्टिंग व हॉटस्पॉट पोर्टल',
      subtitle: 'कचरे के ढेर, ओवरफ्लो बिन और अवैध डंपिंग की जियोटैग फोटो रिपोर्ट करें और AI द्वारा सत्यापित कराएं।',
      submitTab: 'रिपोर्ट दर्ज करें',
      myReportsTab: 'मेरी रिपोर्ट्स',
      rewardsTab: 'इको रिवॉर्ड्स',
      leaderboardTab: 'लीडरबोर्ड',
      adminTab: 'नगर निगम कंसोल',
    },
    operations: {
      title: 'वेस्ट ऑपरेशन्स कमांड',
      subtitle: 'कलेक्शन, ट्रांसपोर्टेशन, सेग्रीगेशन और रीसाइक्लिंग सेंटर का एकीकृत प्रबंधन।',
      collection: 'संग्रहण (Collection)',
      transport: 'परिवहन (Transit)',
      segregation: 'वर्गीकरण (Segregation)',
      recycling: 'रीसाइक्लिंग केंद्र',
    }
  },
  haryanvi: {
    nav: {
      home: 'घर',
      scanner: 'स्कैन करण आला',
      generator: 'बणाण आला',
      reportWaste: 'कचरा रिपोर्ट',
      operations: 'काम-काज (Ops)',
      rewards: 'इनाम व प्वाइंट',
      about: 'म्हारे बारे में',
      vision: 'सपणा',
    },
    hero: {
      title: 'कबाड़ तै जुगाड़',
      subtitle: 'AI तकनीक और कचरा रिपोर्टिंग तै अपने गाम अर शहर नै चकाचक बणाओ।',
      startScanning: 'स्कैन शुरू करो',
      reportWaste: 'कचरा ढेर बताओ',
    },
    scanner: {
      title: 'कचरा पह्चाण यंत्र',
      subtitle: 'फोटो गेर के देखो अक यो कीकर काम आ सकै सै।',
      dropPrompt: 'उरे फोटो गेरो या दबाओ',
      analyzing: 'जांच चाल री सै...',
      noIdeas: 'किसे काम का कोन्या लाग्या। दोबारा टटोलियो।',
      getMore: 'अर जुगाड़ देखणे हैं?',
    },
    generator: {
      title: 'जुगाड़ बणाण आला',
      subtitle: 'चीज का नाम लिखो अर नवा जुगाड़ देखो।',
      placeholder: 'चीज का नाम लिखो (जणूं "फटी पुरानी जींस")...',
      generate: 'जुगाड़ काढ़ो',
      loading: 'दिमाग दौड़ावै सै...',
    },
    reportWaste: {
      title: 'कचरा रिपोर्ट अर हॉटस्पॉट',
      subtitle: 'कतेई भी कचरा या कूड़े का ढेर दिखे तो फोटो खींच कै भेजो, प्वाइंट पाओ।',
      submitTab: 'रिपोर्ट भेजो',
      myReportsTab: 'म्हारी रिपोर्ट',
      rewardsTab: 'इको प्वाइंट',
      leaderboardTab: 'नंबर वन रैकिंग',
      adminTab: 'कमेटी / एडमिन',
    },
    operations: {
      title: 'कबाड़ ऑपरेशन्स कंट्रोल',
      subtitle: 'कलेक्शन, गाड़ियां, छंटाई और रीसाइक्लिंग केंद्र का पूरा हिसाब-किताब।',
      collection: 'कचरा ठाणा',
      transport: 'गाड़ी रवाना',
      segregation: 'छंटाई',
      recycling: 'रीसाइक्लिंग प्लांट',
    }
  },
  punjabi: {
    nav: {
      home: 'ਘਰ',
      scanner: 'ਸਕੈਨਰ',
      generator: 'ਜੇਨਰੇਟਰ',
      reportWaste: 'ਕੂੜਾ ਰਿਪੋਰਟ',
      operations: 'ਓਪਰੇਸ਼ਨਜ਼',
      rewards: 'ਇਨਾਮ (Rewards)',
      about: 'ਸਾਡੇ ਬਾਰੇ',
      vision: 'ਵਿਜ਼ਨ',
    },
    hero: {
      title: 'ਕੂੜੇ ਦਾ ਭਵਿੱਖ',
      subtitle: 'AI ਅਤੇ ਨਾਗਰਿਕ ਰਿਪੋਰਟਿੰਗ ਨਾਲ ਆਪਣੇ ਇਲਾਕੇ ਨੂੰ ਸਾਫ-ਸੁਥਰਾ ਬਣਾਓ।',
      startScanning: 'ਸਕੈਨ ਸ਼ੁਰੂ ਕਰੋ',
      reportWaste: 'ਕੂੜਾ ਹਾਟਸਪੌਟ ਰਿਪੋਰਟ',
    },
    scanner: {
      title: 'ਨਿਊਰਲ ਵੇਸਟ ਸਕੈਨਰ',
      subtitle: 'ਕੂੜੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਮੁੜ ਵਰਤੋਂ ਦੇ ਤਰੀਕੇ ਜਾਣੋ।',
      dropPrompt: 'ਇੱਥੇ ਫੋਟੋ ਪਾਓ ਜਾਂ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
      analyzing: 'ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...',
      noIdeas: 'ਕੋਈ ਤਰੀਕਾ ਨਹੀਂ ਲੱਭਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      getMore: 'ਹੋਰ ਵਿਚਾਰ ਪ੍ਰਾਪਤ ਕਰੋ',
    },
    generator: {
      title: 'ਨਿਊਰਲ ਆਈਡੀਆ ਜੇਨਰੇਟਰ',
      subtitle: 'ਚੀਜ਼ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ ਅਤੇ ਨਵੇਂ ਤਰੀਕੇ ਜਾਣੋ।',
      placeholder: 'ਚੀਜ਼ ਦਾ ਨਾਮ ਲਿਖੋ (ਜਿਵੇਂ "ਪਲਾਸਟਿਕ ਬੋਤਲ")...',
      generate: 'ਵਿਚਾਰ ਬਣਾਓ',
      loading: 'ਪ੍ਰੋਟੋਕੋਲ ਤਿਆਰ ਹੋ ਰਹੇ ਹਨ...',
    },
    reportWaste: {
      title: 'ਕੂੜਾ ਰਿਪੋਰਟਿੰਗ ਤੇ ਹਾਟਸਪੌਟ',
      subtitle: 'ਕੂੜੇ ਦੇ ਢੇਰ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ, AI ਜਾਂਚ ਕਰੇਗਾ ਤੇ ਇਨਾਮੀ ਅੰਕ ਮਿਲਣਗੇ।',
      submitTab: 'ਰਿਪੋਰਟ ਭੇਜੋ',
      myReportsTab: 'ਮੇਰੀਆਂ ਰਿਪੋਰਟਾਂ',
      rewardsTab: 'ਈਕੋ ਪੁਆਇੰਟਸ',
      leaderboardTab: 'ਲੀਡਰਬੋਰਡ',
      adminTab: 'ਨਗਰ ਨਿਗਮ ਕੰਸੋਲ',
    },
    operations: {
      title: 'ਵੇਸਟ ਓਪਰੇਸ਼ਨ ਕਮਾਂਡ',
      subtitle: 'ਇਕੱਠਾ ਕਰਨਾ, ਟ੍ਰਾਂਸਪੋਰਟ, ਛਾਂਟੀ ਅਤੇ ਰੀਸਾਈਕਲਿੰਗ ਕੇਂਦਰ ਪ੍ਰਬੰਧਨ।',
      collection: 'ਕਲੈਕਸ਼ਨ',
      transport: 'ਟ੍ਰਾਂਸਪੋਰਟ',
      segregation: 'ਛਾਂਟੀ',
      recycling: 'ਰੀਸਾਈਕਲਿੰਗ ਸੈਂਟਰ',
    }
  }
};

export const useTranslation = (language: Language) => {
  return translations[language] || translations.english;
};
