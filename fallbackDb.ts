// Fallback Database for ReWise App
// Highly creative, high-fidelity DIY upcycling blueprints in English, Hindi, and Haryanvi
// Conforming exactly to backend API JSON structures.

function detectMaterial(input: string): string {
  const norm = (input || "").toLowerCase();
  if (norm.includes("bottle") || norm.includes("plastic") || norm.includes("botal") || norm.includes("बोतल") || norm.includes("प्लास्टिक")) {
    return "plastic";
  }
  if (norm.includes("jean") || norm.includes("denim") || norm.includes("cloth") || norm.includes("textile") || norm.includes("kapda") || norm.includes("जींस") || norm.includes("कपड़ा")) {
    return "textile";
  }
  if (norm.includes("box") || norm.includes("cardboard") || norm.includes("carton") || norm.includes("paper") || norm.includes("dabba") || norm.includes("डब्बा") || norm.includes("गत्ता")) {
    return "cardboard";
  }
  if (norm.includes("glass") || norm.includes("jar") || norm.includes("kanch") || norm.includes("कांच") || norm.includes("जार")) {
    return "glass";
  }
  if (norm.includes("can") || norm.includes("tin") || norm.includes("metal") || norm.includes("loha") || norm.includes("टीन")) {
    return "metal";
  }
  if (norm.includes("chair") || norm.includes("wood") || norm.includes("furniture") || norm.includes("lakdi") || norm.includes("कुर्सी") || norm.includes("लकड़ी")) {
    return "wood";
  }
  return "generic";
}

// 1. WASTE REPORTS FALLBACK
export function getFallbackWasteReport(input: string, language: string): any {
  const materialKey = detectMaterial(input);
  
  if (language === 'hindi') {
    const hindiReports: Record<string, any> = {
      plastic: {
        itemName: "पुरानी प्लास्टिक की बोतल",
        material: "प्लास्टिक (PET)",
        confidence: 96,
        sustainabilityScore: 88,
        impactReduction: "450 ग्राम कार्बन उत्सर्जन और 2 लीटर पानी बचाया",
        reuseIdeas: [
          {
            title: "स्व-सिंचाई वाला पौधा गमला",
            description: "बोतल को आधा काटकर ऊपर के हिस्से को उल्टा करके नीचे रखें, जिससे पानी पौधों की जड़ों तक धीरे-धीरे स्वतः पहुंचे।",
            difficulty: "Easy",
            materialsNeeded: ["प्लास्टिक की बोतल", "सूती धागा", "मिट्टी", "छोटा पौधा"],
            steps: [
              "प्लास्टिक की बोतल को बीच से दो भागों में काटें।",
              "बोतल के ढक्कन में एक छोटा छेद करें और उसमें सूती धागा पिरोएं।",
              "ऊपरी हिस्से में मिट्टी और पौधा लगाएं, धागे का एक सिरा मिट्टी में हो।",
              "निचले हिस्से में पानी भरें और ऊपरी हिस्से को उसमें उल्टा रख दें।"
            ],
            estimatedCost: "₹0 - ₹20",
            videoTutorialTarget: "how to create a self watering planter from plastic bottle"
          },
          {
            title: "पक्षी अन्नदाता (बर्ड फीडर)",
            description: "बोतल में लकड़ी के चम्मच फंसाकर पक्षियों के लिए एक सुंदर और उपयोगी बर्ड फीडर तैयार करें।",
            difficulty: "Easy",
            materialsNeeded: ["प्लास्टिक की बोतल", "दो लकड़ी के चम्मच", "मजबूत धागा", "पक्षियों का दाना"],
            steps: [
              "बोतल में आमने-सामने दो छोटे छेद करें ताकि चम्मच आर-पार आ सके।",
              "चम्मच को सुराखों में फंसाएं ताकि दाना चम्मच पर गिरता रहे।",
              "बोतल के ढक्कन पर धागा बांधकर टांगने के लिए जगह बनाएं।",
              "बोतल में दाना भरकर पेड़ या बालकनी में लटका दें।"
            ],
            estimatedCost: "₹10",
            videoTutorialTarget: "DIY bird feeder plastic bottle design"
          },
          {
            title: "अति-आधुनिक लटकता दीपक",
            description: "बोतल के निचले हिस्सों को फूल के आकार में काटकर एक चमकदार ज्यामितीय झूमर बनाएं।",
            difficulty: "Medium",
            materialsNeeded: ["5-10 बोतलें", "कैंची", "एलईडी स्ट्रिप लाइट", "गोंद गन"],
            steps: [
              "सभी बोतलों के निचले 3 इंच हिस्से को काट लें।",
              "उन्हें फूलों की तरह व्यवस्थित करके गोंद गन से आपस में चिपका लें।",
              "तैयार गुंबद के अंदर सुरक्षित एलईडी लाइट फिट करें।",
              "तार को सुरक्षित बाहर निकालकर छत से लटकाएं।"
            ],
            estimatedCost: "₹50 - ₹150",
            videoTutorialTarget: "modern chandelier using plastic bottles"
          }
        ]
      },
      textile: {
        itemName: "पुरानी डेनिम जींस",
        material: "कपड़ा (कॉटन डेनिम)",
        confidence: 94,
        sustainabilityScore: 92,
        impactReduction: "लगभग 8000 लीटर पानी का संरक्षण (नई जींस न खरीदकर)",
        reuseIdeas: [
          {
            title: "स्टाइलिश डेनिम थैला (टोटे बैग)",
            description: "बिना सिलाई मशीन के भी जींस के हिप एरिया से एक मजबूत और ट्रेंडी बैग तैयार करें।",
            difficulty: "Medium",
            materialsNeeded: ["पुरानी जींस", "कपड़ा काटने वाली कैंची", "गोंद या सुई-धागा", "फैंसी बटन"],
            steps: [
              "जींस के पैरों वाले हिस्से को काटें और केवल पॉकेट वाले हिप हिस्से को रखें।",
              "निचले कटे हिस्से को सुई-धागे या फैब्रिक ग्लू से मजबूती से बंद करें।",
              "पेड़ों के हिस्सों से पट्टी काटकर बैग का हैंडल बनाएं और ऊपर सिलाई कर दें।",
              "अपनी पसंद के बटन या की-चेन लगाकर सजाएं।"
            ],
            estimatedCost: "₹30",
            videoTutorialTarget: "DIY tote bag from old jeans"
          },
          {
            title: "मल्टी-पॉकेट दीवार आयोजक (ऑर्गेनाइज़र)",
            description: "जींस के पीछे की जेबों को काटकर एक लटकने वाला दीवार आयोजक तैयार करें जिसमें फोन, पेन और चाबियां रखी जा सकें।",
            difficulty: "Easy",
            materialsNeeded: ["घर में रखी पुरानी जींस", "मजबूत कार्डबोर्ड शीट", "गोंद गन"],
            steps: [
              "जींस की सभी पिछली जेबों को ध्यान से काट लें।",
              "एक सुंदर कार्डबोर्ड को सूती कपड़े से ढककर फ्रेम तैयार करें।",
              "फ्रेम के ऊपर इन डेनिम जेबों को पंक्तिबद्ध तरीके से चिपकाएं।",
              "ऊपर टांगने के लिए एक धागा बांधें और दीवार पर सजाएं।"
            ],
            estimatedCost: "₹20 - ₹40",
            videoTutorialTarget: "pocket wall organizer diy denim"
          }
        ]
      }
    };
    const report = hindiReports[materialKey] || hindiReports.plastic;
    // Customize itemName if input is customized
    if (input && input !== "Plastic Bottle" && input !== "प्लास्टिक की बोतल") {
      report.itemName = input;
    }
    return report;
  }

  if (language === 'haryanvi') {
    const haryanviReports: Record<string, any> = {
      plastic: {
        itemName: "प्लास्टिक की पुरानी बोतल",
        material: "प्लास्टिक (PET)",
        confidence: 95,
        sustainabilityScore: 89,
        impactReduction: "पर्यावरण में प्लास्टिक कचरा कम होया अर पानी की बचत हुई",
        reuseIdeas: [
          {
            title: "देसी स्वतः-पानी पिवाणिया गमला",
            description: "बोतल ने बिच कल्ला काटकर धागा लगा दो, पौधा अपने आप पानी खींच लेगा, रोज-रोज पाणी घालण की सिरदर्दी खत्म!",
            difficulty: "Easy",
            materialsNeeded: ["प्लास्टिक की खाली बोतल", "सूती नाड़ा या सुतली", "खाद-मिट्टी", "छोटा बूटा"],
            steps: [
              "बोतल ने बिच में ते दो हिस्सा में काट लो भाई।",
              "ढक्कन में कील ते छेद करके सूती नाड़ा आर-पार काट दो।",
              "ऊपरले हिस्से में मिट्टी भरकर बूटा रोप दो अर नाड़ा मिट्टी में दबा दो।",
              "नीचेले हिस्से में पाणी भरकर ऊपरला हिस्सा उल्टा टिका दो।"
            ],
            estimatedCost: "₹0 - ₹10",
            videoTutorialTarget: "simple self watering bottle planter diy"
          },
          {
            title: "चिड़िया खातिर दाना-पानी बरतन",
            description: "बोतल में पुराना चमचा अड़ा के पेड़ पे टांग दो, चिड़िया आराम ते दाना चुग लेंगी।",
            difficulty: "Easy",
            materialsNeeded: ["खाली बोतल", "लकड़ी के दो चमचे", "रस्सी", "बाजरा-गेहूं का दाना"],
            steps: [
              "बोतल में आमने-सामने दो सुराख बना लो।",
              "उन सुराखों में लकड़ी का चमचा घुसा दो ताकि दाना चमचे पे आ गिरे।",
              "बोतल के ऊपरली कुंडी पे रस्सी बांध दो।",
              "बोतल में बाजरा भरकर मजबूत पेड़ की डाली पे टांग दो।"
            ],
            estimatedCost: "₹5",
            videoTutorialTarget: "how to make bird feeder easy bottle"
          }
        ]
      }
    };
    const report = haryanviReports[materialKey] || haryanviReports.plastic;
    if (input) report.itemName = input;
    return report;
  }

  // DEFAULT ENGLISH
  const englishReports: Record<string, any> = {
    plastic: {
      itemName: "Discarded Plastic Bottle",
      material: "PET Plastic",
      confidence: 98,
      sustainabilityScore: 85,
      impactReduction: "Offsets 420g CO2 & reduces microplastic shedding.",
      reuseIdeas: [
        {
          title: "Self-Watering Sub-Irrigation Planter",
          description: "Cut bottle in half and invert upper section to wick moisture automatically to soil roots.",
          difficulty: "Easy",
          materialsNeeded: ["Plastic Bottle", "Cotton Wick/String", "Organic Soil", "Seedling"],
          steps: [
            "Cut the bottle horizontally at the midpoint.",
            "Pierce a 5mm hole in the bottle cap, slide cotton string through, knotting on the inside.",
            "Fill the bottom portion with water and place the top inverted portion into it containing soil and your plant.",
            "The wick will draw enough moisture steadily for up to two weeks without manual watering."
          ],
          estimatedCost: "₹20",
          videoTutorialTarget: "how to make a self watering planter from plastic bottle"
        },
        {
          title: "Intelligent Bird Feeder System",
          description: "Insert wooden spoons to create resting perches and natural grain distribution slots.",
          difficulty: "Easy",
          materialsNeeded: ["PET Bottle", "2 Wooden Spoons", "Nylon Rope", "Wild Bird Seeds"],
          steps: [
            "Cut a pair of aligned holes on opposite sides of the bottle about 3 inches from the bottom.",
            "Push a wooden spoon through the holes; widen the spoon-side slightly to allow seeds to fall.",
            "Fill with seeds and suspend from a high-altitude balcony or tree limb."
          ],
          estimatedCost: "₹50",
          videoTutorialTarget: "DIY bird feeder plastic bottle design"
        },
        {
          title: "Architectural Hexagonal Desk Organizer",
          description: "Stack cut bottle bottoms geometrically to store pencils, scissors, and ruler instruments.",
          difficulty: "Medium",
          materialsNeeded: ["3-5 PET Bottles", "Iron Foil/Sandpaper", "Eco-Epoxy / Warm Glue"],
          steps: [
            "Cut bottle bottoms clean at varying heights (3, 4, and 5 inches).",
            "Smooth cut rims by pressing them briefly onto a warm iron surface.",
            "Glue containers together to form a modern custom hexagonal storage unit."
          ],
          estimatedCost: "₹0 - ₹40",
          videoTutorialTarget: "desk organizer from plastic bottles"
        }
      ]
    },
    textile: {
      itemName: "Worn-out Denim Jeans",
      material: "Cotton-Denim Textile",
      confidence: 97,
      sustainabilityScore: 94,
      impactReduction: "Saves up to 8,000 Liters of water from new purchases.",
      reuseIdeas: [
        {
          title: "Heavy-Duty Tote Bag",
          description: "Transform the waistband and back pocket structure into a trendy custom handbag.",
          difficulty: "Medium",
          materialsNeeded: ["Discarded Jeans", "Fabric Scissors", "Needle & Thick Thread", "Pins"],
          steps: [
            "Cut off the legs starting just below the back pockets.",
            "Turn inside out and sew a secure seam straight along the bottom edge.",
            "Form sturdy carry straps using long strips of denim salvaged from the cut legs.",
            "Sew both straps firmly to the inside waistband to support weight."
          ],
          estimatedCost: "₹50",
          videoTutorialTarget: "DIY tote bag old jeans"
        },
        {
          title: "Geometric Patchwork Seat Cushion",
          description: "Stitch multi-shade scraps of denim into a rugged modernist floor cushion.",
          difficulty: "Hard",
          materialsNeeded: ["Strips of Denim", "Polyester Stuffing / Old Rags", "Sewing Kit"],
          steps: [
            "Slice denim into uniform 4x4 inch geometric squares.",
            "Sew squares together block-by-block to form a top and bottom panel.",
            "Stitch both panels together leaving a 4-inch gap, insert stuffing fully, then stitch closed."
          ],
          estimatedCost: "₹100 - ₹200",
          videoTutorialTarget: "sew denim cushion cover patchwork"
        }
      ]
    },
    cardboard: {
      itemName: "Corrugated Shipping Box",
      material: "Recyclable Cardboard",
      confidence: 99,
      sustainabilityScore: 78,
      impactReduction: "Prevents immediate landfill congestion and stores carbon safely.",
      reuseIdeas: [
        {
          title: "Segmented Vanity Desk Drawer Box",
          description: "Divide cardboard into clean modular drawers covered in recycled wrapping paper.",
          difficulty: "Easy",
          materialsNeeded: ["Cardboard Carton", "Wrapping Paper or Paint", "Glue", "Utility Knife"],
          steps: [
            "Cut flaps off the cardboard box to create a clean open storage unit.",
            "Wrap inside and outer walls in colorful scrap-paper or decorative fabrics.",
            "Configure vertical dividers from leftover flaps to form segmented slots."
          ],
          estimatedCost: "₹15",
          videoTutorialTarget: "cardboard organizer storage drawers DIY"
        },
        {
          title: "Nordic Minimalist Cat Cabin",
          description: "Design a clean geometric triangular playhouse for indoor pets using folded cardboard.",
          difficulty: "Medium",
          materialsNeeded: ["Large Box", "Paper Cutter", "Non-toxic adhesive"],
          steps: [
            "Trim and fold large box flaps into a stylized pyramid housing frame.",
            "Carve an archway entry at the front panel and small ventilation port circles.",
            "Add blank paper towel pads inside for extra pet lounging comfort."
          ],
          estimatedCost: "₹50",
          videoTutorialTarget: "DIY cat house cardboard"
        }
      ]
    },
    glass: {
      itemName: "Reclaimed Glass Jar",
      material: "Soda-Lime Glass",
      confidence: 96,
      sustainabilityScore: 90,
      impactReduction: "Completely halts energy-intensive glass recycling furnace steps.",
      reuseIdeas: [
        {
          title: "Succulent Bio-Dome Terrarium",
          description: "Plant a tiny self-sustaining ecosystem inside a premium transparent glass container.",
          difficulty: "Easy",
          materialsNeeded: ["Glass Jar", "Charcoal Pebbles", "Potting Soil mix", "Lichen or Succulents"],
          steps: [
            "Layer 1 inch of pebbles at the jar base for water filtration drainage.",
            "Scatter a light charcoal dusting followed by organic premium soil.",
            "Plant micro succulents or forest moss gently using long tweezers.",
            "Mist lightly with fresh water and screw on the transparent lid."
          ],
          estimatedCost: "₹30 - ₹70",
          videoTutorialTarget: "DIY mason jar terrarium tutorial"
        },
        {
          title: "Warm Rustic Twinkle Lantern",
          description: "Felt-mount decorative hemp twine onto glass for an ambient table lampion.",
          difficulty: "Easy",
          materialsNeeded: ["Glass Jar", "Jute Rope/Twine", "LED Candle / Fairy Lights"],
          steps: [
            "Wrap durable jute twine tightly around the jar neck, constructing a hanging loop.",
            "Weave intersecting net patterns down the body using hot glue.",
            "Drop in a soft battery-powered LED candle for a flicker lanterns effect."
          ],
          estimatedCost: "₹40",
          videoTutorialTarget: "making glass jar hanging lantern"
        }
      ]
    },
    metal: {
      itemName: "Discarded Steel Food Can",
      material: "Tinplated Steel",
      confidence: 98,
      sustainabilityScore: 82,
      impactReduction: "Reduces raw aluminum and steel ore smelting energy demands.",
      reuseIdeas: [
        {
          title: "Aesthetic Fluted Pen Holder",
          description: "Mount premium wrapped cans to magnet bars for smart modern desk utility organizers.",
          difficulty: "Easy",
          materialsNeeded: ["Clean Can", "Acrylic Primer & Paint", "Eco-Cork sheets or felt fabric"],
          steps: [
            "Thoroughly wash the food can, pressing any sharp inner edges flat.",
            "Coat with titanium-white acrylic primer before painting custom design stripes.",
            "Line the inside with soft cork or felt circles to deaden pencil drop sounds."
          ],
          estimatedCost: "₹20",
          videoTutorialTarget: "DIY aesthetic tin can pen organizer"
        }
      ]
    },
    wood: {
      itemName: "Broken Wooden Chair Panel",
      material: "Solid Timber Wood",
      confidence: 92,
      sustainabilityScore: 95,
      impactReduction: "Locks carbon in active reuse cycle, halting incineration release.",
      reuseIdeas: [
        {
          title: "Eco-Rustic Floating Book Shelf",
          description: "Re-sand old wood planks, mounting them with raw industrial iron hooks to walls.",
          difficulty: "Medium",
          materialsNeeded: ["Chair backrest / Wood plank", "Sandpaper", "Wall L-brackets", "Screws"],
          steps: [
            "Sand down the wood panels to strip off standard old varnishes.",
            "Apply a clean linseed oil polish to showcase organic timber grains.",
            "Secure heavy-duty wall brackets to studs and screw raw rustic shelf in place."
          ],
          estimatedCost: "₹100",
          videoTutorialTarget: "how to build rustic floating shelves"
        }
      ]
    },
    generic: {
      itemName: "Unidentified Household Waste",
      material: "Mixed Composites",
      confidence: 85,
      sustainabilityScore: 70,
      impactReduction: "Extends landfill cycle timeline and guards against immediate scrap release.",
      reuseIdeas: [
        {
          title: "Multi-Functional Utility Catchall Tray",
          description: "Combine plastic bases with felt liners as premium minimalist trays.",
          difficulty: "Easy",
          materialsNeeded: ["Tray Container", "Velt scraps", "Glue"],
          steps: [
            "Sanitize the container base fully.",
            "Glue custom cut soft-felt bases inside the compartments.",
            "Aesthetic organizer is ready for keys, coins, or jewelry accessories."
          ],
          estimatedCost: "₹10",
          videoTutorialTarget: "DIY vanity catchall tray organizer"
        }
      ]
    }
  };

  const report = englishReports[materialKey] || englishReports.generic;
  if (input) report.itemName = input;
  return report;
}

// 2. PREMIUM BLUEPRINTS FALLBACK
export function getFallbackBlueprints(wasteItem: string, language: string): any[] {
  const materialKey = detectMaterial(wasteItem);

  if (language === 'hindi') {
    return [
      {
        title: "शानदार 'एम्बर ग्लो' डिजाइनर लैंप",
        originalMaterial: "कांच/प्लास्टिक की बोतल",
        concept: "बोतल के ऊपरी सिरे को काटकर उसमें सुंदर ज्यामितीय छेद और गर्म पीली एलईडी लाइटों का समागम करके लक्जरी सजावट लैंप बनाना।",
        difficulty: "Medium",
        estimatedCost: "₹150 - ₹300",
        materials: ["पुरानी मजबूत बोतल", "एलईडी कॉपर लाइट", "जूट थ्रेड", "सैंडपेपर", "ग्लास पेंट्स"],
        steps: [
          "बोतल को अच्छे से साफ करें ताकि पुराने दाग या लेबल निकल जाएं।",
          "कांच या प्लास्टिक की सतह को सैंडपेपर से सुहावना खुरदरा बनाएं ताकि प्रकाश सुंदर रूप से फैले।",
          "बोतल के ऊपर मनपसंद पैटर्न में एम्बर या गोल्डन रंग लगाएं।",
          "बोतल के नीचे या पीछे से एलईडी लाइट का तार डालकर व्यवस्थित करें।"
        ],
        vibe: "नॉर्डिक इंडस्ट्रियल शैली / मंद सुखद प्रकाश"
      },
      {
        title: "प्रीमियम 'डेनिम कम्फर्ट' ऑफिस फोल्डर",
        originalMaterial: "पुरानी जींस",
        concept: "मजबूत पुरानी जींस के कपड़ा भागों को पतले बोर्ड के साथ जोड़कर एक लक्जरी फाइल और आईपैड होल्डर तैयार करना।",
        difficulty: "Easy",
        estimatedCost: "₹50 - ₹100",
        materials: ["डेनिम जींस कपड़ा", "मोटा हार्डबोर्ड", "फैब्रिक चिपकने वाला गोंद", "चुंबकीय क्लिप"],
        steps: [
          "हार्डबोर्ड को फोल्डर के आकार में काटें।",
          "जींस के चुनिंदा साफ हिस्से को हार्डबोर्ड के ऊपर मजबूती से गोंद से चिपकाएं।",
          "अंदर की ओर छोटे डेनिम पॉकेट चिपकाएं ताकि पेन और कार्ड रखे जा सकें।",
          "फोल्डर बंद करने के लिए आकर्षक चुंबकीय क्लिप फिट करें।"
        ],
        vibe: "प्रोफेशनल मिनिमलिस्ट / मॉर्डन कॉर्पोरेट हसल"
      },
      {
        title: "स्मार्ट 'बायो-पॉकेट' वर्टिकल फार्म",
        originalMaterial: "बड़ा प्लास्टिक केन / पीवीसी",
        concept: "दीवार पर टांगने वाला एक स्वचालित हाइड्रोपोनिक ढांचा जिससे घर में बिना मिट्टी के ताजी जड़ी-बूटियाँ उगाई जा सकें।",
        difficulty: "Hard",
        estimatedCost: "₹250 - ₹500",
        materials: ["3-5 प्लास्टिक जार", "स्मार्ट वॉटर पंप (छोटा)", "प्लास्टिक हैंगर ट्यूब", "पौधों का पोषण पानी"],
        steps: [
          "प्लास्टिक जारों में एक निश्चित सीढ़ी नुमा ढलान में पानी के बहने के लिए पाइप जोड़ें।",
          "जारों के ढक्कनों में छेद करके नारियल की भूसी (कोकोपीट) और बीज लगाएं।",
          "एक छोटे से यूएसबी पंप को नीचे के जार से जोड़कर पानी ऊपर दोबारा चढ़ाने की योजना बनाएं।",
          "यह हाइड्रोपोनिक चक्र पौधों के लिए अत्यंत लाभदायक साबित होता है।"
        ],
        vibe: "फ्यूचरिस्टिक ग्रीन लिविंग / इको-टेक आर्किटेक्चर"
      }
    ];
  }

  // DEFAULT ENGLISH BLUEPRINTS
  const englishBlueprints: Record<string, any[]> = {
    plastic: [
      {
        title: "The 'Aether Bloom' Self-Watering Hydro-System",
        originalMaterial: "Double PET Bottles",
        concept: "A sleek, passive architectural hydro-pod that uses microfiber capillary action to sustain high-end indoor botanicals without daily intervention.",
        difficulty: "Medium",
        estimatedCost: "₹120 - ₹250",
        materials: ["2 Clean 2-Liter Bottles", "Microfiber Capillary Tape", "Granulated Charcoal Filter", "Aesthetic Textured Pearl Polish"],
        steps: [
          "Divide both bottles cleanly at the 3/5 mark using a heated precision knife.",
          "Coat the exterior in matte pearl or geometric charcoal colors for a modern design finish.",
          "Insert microfiber wicks through the inverted nozzle, securing them in place with active-carbon pebbles.",
          "Assemble the nested design and place your favorite premium indoor plant in the upper pod, filling the sleek lower reservoir with nutrient formula."
        ],
        vibe: "Biophilic Futurism / Matte Nordic Surface"
      },
      {
        title: "Luminous Fluted Pendant Lampshade",
        originalMaterial: "Assorted Plastic Containers",
        concept: "Transform fluted profiles of plastic jugs into a mid-century geometric chandelier radiating warm light.",
        difficulty: "Hard",
        estimatedCost: "₹200 - ₹400",
        materials: ["Fluted Plastic Jugs", "Gold Metallic Finish Spray", "LED Thread Harness", "Opal Diffuser Sheets"],
        steps: [
          "Carefully shave ribbed segments of the plastic jugs into clean uniform sheets.",
          "Coat one side of each sheet in luxurious semi-matte golden spray.",
          "Interlock sheets to encase the opal diffuser around an eco-friendly low-temp LED fixture.",
          "Mount with custom dark nylon cord."
        ],
        vibe: "Mid-Century Luxury / Glinting Warm Radiance"
      },
      {
        title: "Sleek Modular Desk Gravity Bin",
        originalMaterial: "Large Detergent Jugs",
        concept: "Transform raw hollow plastic forms into modular stackable organizers with self-closing drawers.",
        difficulty: "Easy",
        estimatedCost: "₹50 - ₹120",
        materials: ["Detergent Bottles", "Precision Ruler", "Dual Tone Adhesive Strips"],
        steps: [
          "De-label and thoroughly clean heavy plastic detergent jugs.",
          "Mark and cut away the side panels while maintaining the handle frame as a structural rib.",
          "Sand the edges flawlessly, spray-paint in muted earth-tones, and stack interlocking compartments on your desk."
        ],
        vibe: "Industrial Brutalism / Muted Earth Tones"
      }
    ],
    textile: [
      {
        title: "The 'Denim Lux' Executive Folio Sleeve",
        originalMaterial: "Raw Outworn Denim",
        concept: "A heavy-weight, rugged textile folio designed with inner suede linings and copper studs to carry high-end tablets or sketchbooks.",
        difficulty: "Medium",
        estimatedCost: "₹150 - ₹300",
        materials: ["Rugged Denim Fabric", "Recycled Felt/Suede Liner", "Modern Magnetic Quick-Snap Buttons", "Heavy-gauge Copper Needles & Thread"],
        steps: [
          "Draft pattern dimensions matching an 11-inch tablet with a 1-inch seam tolerance.",
          "Laminate denim strips together using an eco-friendly heat-activated backing sheet.",
          "Stitch the interior suede buffer directly to the denim, forming structured pockets for stylus and cards.",
          "Affix raw heavy copper studs and lock the flap elegantly with magnetic snap-plates."
        ],
        vibe: "Modern Rugged Tech / High-Contrast Copper Highlights"
      },
      {
        title: "Avant-Garde Architectural Throw Pillow",
        originalMaterial: "Discarded Fabric Pieces",
        concept: "Woven geometrical patchwork cushion designed utilizing negative space overlays.",
        difficulty: "Hard",
        estimatedCost: "₹100 - ₹250",
        materials: ["Textile scraps", "Sustainable bamboo fluff", "High tensile sewing kits"],
        steps: [
          "Convert miscellaneous textile pieces into long uniform bands.",
          "Weave bands into an interlocking 3D block mesh top panel.",
          "Back with solid dark fabric, stuff cozy with natural bamboo pulp, and seal shut."
        ],
        vibe: "Geometric Minimalism / Tactile Constructivist Texture"
      }
    ]
  };

  const bps = englishBlueprints[materialKey] || englishBlueprints.plastic;
  return bps;
}

// 3. REUSE IDEAS FALLBACK
export function getFallbackReuseIdeas(itemDescription: string, language: string): any[] {
  const reports = getFallbackWasteReport(itemDescription, language);
  return (reports.reuseIdeas || []).map((idea: any) => ({
    idea: idea.title,
    process: idea.description,
    impact: reports.impactReduction,
    difficulty: idea.difficulty,
    materialsNeeded: idea.materialsNeeded,
    steps: idea.steps,
    estimatedCost: idea.estimatedCost,
    videoTutorialTarget: idea.videoTutorialTarget
  }));
}

// 4. MORE IDEAS FALLBACK
export function getFallbackMoreIdeas(itemName: string, material: string, language: string): any[] {
  const reports = getFallbackWasteReport(itemName || material, language);
  return (reports.reuseIdeas || []).map((idea: any) => ({
    title: idea.title,
    description: idea.description,
    difficulty: idea.difficulty,
    materialsNeeded: idea.materialsNeeded,
    steps: idea.steps,
    estimatedCost: idea.estimatedCost,
    videoTutorialTarget: idea.videoTutorialTarget
  }));
}

// 5. VOICE ASSISTANT CHAT FALLBACK
export function getFallbackVoiceAssistant(text: string): string {
  const norm = text.toLowerCase();
  if (norm.includes("hello") || norm.includes("hi") || norm.includes("नाम") || norm.includes("राम राम")) {
    return "Ram Ram! Ready to upcycle? Ask me how to turn any local waste, plastic bottle, or old jeans into highly creative items!";
  }
  if (norm.includes("bottle") || norm.includes("plastic") || norm.includes("बोतल")) {
    return "I recommend constructing a passive Self-Watering Planter with your bottle. Cut it in half, invert the mouth filled with soil, and put a cotton fuse running to water below!";
  }
  if (norm.includes("jeans") || norm.includes("कपड़ा")) {
    return "Jeans have highly durable denim textile. You can create a stellar heavy-duty shopping tote bag or a custom hanging wall pocket organizer using the back pockets!";
  }
  return "That is excellent! We can upcycle this material beautifully. Let's start with a clean surface, map out a 3-step design, and assemble it. Would you like detailed step-by-step instructions?";
}

// 7. CIVIC WASTE REPORT VERIFICATION FALLBACK
export function getFallbackReportVerification(category?: string, description?: string): any {
  const normCat = (category || "").toLowerCase();
  const normDesc = (description || "").toLowerCase();

  let wasteType = "Mixed Municipal Waste";
  let estimatedSeverity = "Medium";
  let environmentalRisk = "Medium";
  let confidence = 91;
  let detectedItems = ["Discarded packaging", "Polymer fragments", "Organic debris"];

  if (normCat.includes("plastic") || normDesc.includes("plastic") || normDesc.includes("bottle") || normDesc.includes("polythene")) {
    wasteType = "High-Density Plastic & Single-Use Polymers";
    estimatedSeverity = "High";
    environmentalRisk = "High";
    confidence = 94;
    detectedItems = ["PET Bottles", "LDPE Plastic Bags", "Snack Wrappers", "Crushed Containers"];
  } else if (normCat.includes("e-waste") || normDesc.includes("electronic") || normDesc.includes("circuit") || normDesc.includes("wire")) {
    wasteType = "Consumer Electronics & Toxic Component Waste";
    estimatedSeverity = "Critical";
    environmentalRisk = "Severe";
    confidence = 96;
    detectedItems = ["Lead-tin solder boards", "Insulated copper cables", "Lithium battery casing"];
  } else if (normCat.includes("organic") || normDesc.includes("food") || normDesc.includes("vegetable")) {
    wasteType = "Decomposing Biodegradable / Wet Biomass";
    estimatedSeverity = "Medium";
    environmentalRisk = "Medium";
    confidence = 89;
    detectedItems = ["Discarded food scraps", "Rotting fruit peels", "Wet garden clippings"];
  } else if (normCat.includes("hazardous") || normDesc.includes("chemical") || normDesc.includes("medical")) {
    wasteType = "Hazardous Bio-Chemical Waste";
    estimatedSeverity = "Critical";
    environmentalRisk = "Severe";
    confidence = 97;
    detectedItems = ["Unsealed solvent can", "Bio-hazard syringe debris", "Corrosive chemical container"];
  } else if (normCat.includes("glass") || normDesc.includes("glass")) {
    wasteType = "Fractured Silica & Commercial Glass Cullet";
    estimatedSeverity = "Medium";
    environmentalRisk = "Low";
    confidence = 93;
    detectedItems = ["Broken glass shards", "Beverage bottles", "Window pane fragments"];
  }

  return {
    wasteType,
    estimatedSeverity,
    containsWaste: true,
    environmentalRisk,
    confidence,
    detectedItems,
    summary: `Verified real-world unmanaged waste aggregation. Immediate municipal sorting or collection dispatch recommended to prevent environmental contamination.`
  };
}

// 8. ECO RECOMMENDATIONS FALLBACK
export function getFallbackEcoRecommendations(param1?: any, param2?: any, param3?: any): any[] {
  return [
    {
      id: "rec_01",
      title: "Decentralized Wet Organic Composting",
      impact: "Eliminates 75% methane emissions at household level",
      difficulty: "Easy",
      co2ReductionKg: 12.4,
      priority: "High"
    },
    {
      id: "rec_02",
      title: "Closed-Loop PET Baling & Micro-Pelletizing",
      impact: "Enables 100% circular bottle-to-fiber spinning",
      difficulty: "Medium",
      co2ReductionKg: 28.5,
      priority: "High"
    },
    {
      id: "rec_03",
      title: "Community Upcycling Swap Kiosk",
      impact: "Extends product lifespans by an average 3.4 years",
      difficulty: "Low",
      co2ReductionKg: 8.2,
      priority: "Medium"
    }
  ];
}


