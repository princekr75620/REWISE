export async function analyzeWaste(imageData: string, mimeType: string, language: string = 'english') {
  const response = await fetch('/api/ai/analyze-waste', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
       imageData: imageData.split(',')[1], 
       mimeType, 
       language 
    })
  });
  if (!response.ok) throw new Error('AI Analysis failed');
  return response.json();
}

export async function analyzeCode(code: string, language: string = 'english') {
  const response = await fetch('/api/ai/analyze-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language })
  });
  if (!response.ok) throw new Error('QR/Barcode Analysis failed');
  return response.json();
}

export async function analyzeCodeImage(imageData: string, mimeType: string, language: string = 'english') {
  const response = await fetch('/api/ai/analyze-code-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
       imageData: imageData.split(',')[1], 
       mimeType, 
       language 
    })
  });
  if (!response.ok) throw new Error('AI QR Image Analysis failed');
  return response.json();
}

export async function generateStudioBlueprints(wasteItem: string, language: string = 'english') {
  const response = await fetch('/api/ai/studio-blueprints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wasteItem, language })
  });
  if (!response.ok) throw new Error('Blueprint generation failed');
  return response.json();
}

export async function generateReuseIdeas(itemDescription: string, language: string = 'english') {
  const response = await fetch('/api/ai/reuse-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemDescription, language })
  });
  if (!response.ok) throw new Error('Idea generation failed');
  return response.json();
}

export async function generateMoreReuseIdeas(itemName: string, material: string, language: string = 'english') {
  const response = await fetch('/api/ai/more-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemName, material, language })
  });
  if (!response.ok) throw new Error('Failed to generate more reuse ideas');
  return response.json();
}

export async function voiceAssistantChat(text: string) {
  const response = await fetch('/api/ai/voice-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Voice assistant failed');
  const data = await response.json();
  return data.text;
}
