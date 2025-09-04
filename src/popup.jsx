// src/popup.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
// IMPORTANTE: ReactDOM y React serán empaquetados por esbuild.
// Asegúrate de tenerlos instalados: npm install react react-dom esbuild
// Y en tu index.html, enlaza React y ReactDOM desde las CDNs.

// --- Listas de Elementos para Humanizar ---
const connectors = [
  'Bueno,', 'Mira,', 'La verdad es que,', 'O sea,', 'Tipo,',
  'Como quien no quiere la cosa,', 'Al final del día,', 'Si me preguntas,',
  'No sé si me explico,', 'En criollo,', 'Te cuento que,', 'Fíjate que,',
  'A ver,', 'Por otro lado,', 'En contraste,', 'De hecho,',
  'Asimismo,', 'No obstante,', 'Así pues,', 'De ahí que,',
  'Vale,', 'En fin,', 'Para que te hagas una idea,', 'Vamos, que,'
];

const aiConectors = [
    "además", "asimismo", "por lo tanto", "en conclusión", 
    "por consiguiente", "en consecuencia", "así pues", "de hecho",
    "por ende", "en resumen", "finalmente", "en definitiva"
];

const humanIdioms = [
  'cuesta abajo', 'pan comido', 'ponerse las pilas', 'dar en el clavo',
  'tirar la casa por la ventana', 'estar en las nubes', 'no tener pelos en la lengua',
  'ser uña y carne', 'hacer la vista gorda', 'meter la pata', 'buscarle la quinta pata al gato',
  'donde hubo fuego, cenizas quedan', 'el que madruga, Dios le ayuda', 'la curiosidad mató al gato',
  'más vale pájaro en mano que ciento volando', 'no hay mal que dure cien años, ni cuerpo que lo resista',
  'en un abrir y cerrar de ojos', 'poner los puntos sobre las íes', 'sacar las castañas del fuego'
];

const richSynonyms = {
    "importante": ["crucial", "trascendental", "fundamental", "esencial", "relevante", "clave", "imperativo"],
    "decir": ["manifestar", "expresar", "comunicar", "señalar", "indicar", "proclamar", "declarar", "articular"],
    "usar": ["emplear", "utilizar", "recurrir a", "aplicar", "desplegar", "implementar", "valerse de"],
    "bueno": ["adecuado", "óptimo", "pertinente", "idóneo", "propicio", "beneficioso", "acertado"],
    "mucho": ["considerablemente", "sustancialmente", "ampliamente", "notablemente", "abundantemente", "significativamente"],
    "gran": ["enorme", "amplio", "extenso", "considerable", "significativo", "voluminoso"],
    "poder": ["capacidad", "facultad", "potestad", "habilidad", "competencia"],
    "tener": ["poseer", "disponer de", "contar con", "ostentar", "acaparar"],
    "crear": ["generar", "concebir", "producir", "elaborar", "forjar", "gestar"],
    "mejorar": ["optimizar", "perfeccionar", "pulir", "refinar", "potenciar", "apsack"]
};

// --- Componente Principal RedactaProApp ---
const RedactaProApp = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [analysisScore, setAnalysisScore] = useState(0);
  const [error, setError] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('write');
  const [settings, setSettings] = useState({
    depth: 'profundo', // 'suave', 'normal', 'fuerte'
    styleVariation: true,
    naturalFlow: true,
    toneAdjustment: true,
    readabilityFocus: true,
    sentenceLengthVariation: true,
    connectorVariety: true,
    lexicalRichness: true,
    avoidRepetition: true,
  });
  
  const outputRef = useRef(null);
  const fileInputRef = useRef(null); 

  // --- Funciones de Almacenamiento Local (localStorage) ---
  const STORAGE_KEYS = {
    SETTINGS: 'redactapro_settings',
    LAST_TEXT: 'redactapro_last_text'
  };

  // Cargar configuraciones desde localStorage
  const loadSettings = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
        console.log("Settings loaded from localStorage:", JSON.parse(storedSettings));
      } else {
        console.log("No settings found in localStorage, using defaults.");
      }
    } catch (err) {
      console.error("Error loading settings from localStorage:", err);
      setError("Error al cargar las configuraciones guardadas.");
    }
  }, []);

  // Guardar configuraciones en localStorage
  const saveSettings = useCallback((newSettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      console.log("Settings saved to localStorage:", newSettings);
    } catch (err) {
      console.error("Error saving settings to localStorage:", err);
      setError("Error al guardar las configuraciones.");
    }
  }, []);

  // Cargar el último texto procesado desde localStorage
  const loadLastText = useCallback(() => {
    try {
      const storedText = localStorage.getItem(STORAGE_KEYS.LAST_TEXT);
      if (storedText) {
        setInputText(storedText);
        console.log("Last text loaded from localStorage:", storedText.substring(0, 50) + "...");
      }
    } catch (err) {
      console.error("Error loading last text from localStorage:", err);
    }
  }, []);

  // Guardar el texto de entrada en localStorage
  const saveInputText = useCallback((text) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_TEXT, text);
      console.log("Input text saved to localStorage.");
    } catch (err) {
      console.error("Error saving input text to localStorage:", err);
    }
  }, []);

  // --- Efectos para Cargar y Guardar ---
  useEffect(() => {
    // Cargar datos al iniciar el componente
    loadSettings();
    loadLastText();
  }, [loadSettings, loadLastText]); // Dependencias para que se ejecuten una vez

  // Guardar configuraciones cuando cambian
  useEffect(() => {
    saveSettings(settings);
  }, [settings, saveSettings]);

  // Guardar texto de entrada cuando cambia (con debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputText !== '') { // Solo guardar si hay texto
        saveInputText(inputText);
      }
    }, 1000); // Guarda después de 1 segundo de inactividad en el input
    
    return () => {
      clearTimeout(handler); // Limpiar el timeout si el componente se desmonta o inputText cambia antes de tiempo
    };
  }, [inputText, saveInputText]);

  // --- Funciones de Procesamiento (Callbacks) ---
  const cleanText = useCallback((text) => {
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Caracteres invisibles
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Espacios extraños
      .replace(/[\r\n]{3,}/g, '\n\n') // Saltos excesivos
      .replace(/[ \t]+/g, ' ') // Espacios múltiples
      .replace(/ +([,.!?¿¡:]+)/g, '$1') // Espacios antes de puntuación
      .replace(/([¿¡]) +/g, '$1') // Espacios después de signos de interrogación/exclamación
      .trim();
  }, []);

  const deepSemanticRewrite = useCallback((text, currentSettings) => {
    let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 5);
    if (paragraphs.length > 3) {
      const intro = paragraphs.shift();
      const conclusion = paragraphs.pop();
      let body = paragraphs;
      for (let i = body.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [body[i], body[j]] = [body[j], body[i]];
      }
      if (currentSettings.depth === 'fuerte' && body.length > 1) { body.reverse(); }
      paragraphs = [intro, ...body, conclusion];
    }
    return paragraphs.map(para => {
      let sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      if (sentences.length > 3 && Math.random() < 0.85) {
        const patterns = [
          (s) => [s[1], s[2], s[0], ...s.slice(3)],
          (s) => ["Para ilustrar,", s[2], s[0], s[1], ...s.slice(3)],
          (s) => [s[s.length - 1], "En realidad,", ...s.slice(0, -1)],
          (s) => [s[0], "No obstante,", s[1], s[2], ...s.slice(3)],
          (s) => [s[1], "Y es que,", s[0], ...s.slice(2)],
          (s) => [s[0], s[2], "Por cierto,", s[1], ...s.slice(3)]
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        sentences = pattern(sentences);
      }
      return sentences.join(' ');
    }).join('\n\n');
  }, []);

  const translationSimulation = useCallback((text, currentSettings) => {
    let result = text;
    const transformations = [
      t => t.replace(/(\w+)\s+de\s+(\w+)/g, '$2 $1'), t => t.replace(/(\w+)\s+(\w+)\s+(\w+)/g, '$3 $1 $2'),
      t => t.replace(/(\w+)\s+y\s+(\w+)/g, '$1 e $2'), t => t.replace(/(\w+)\s+o\s+(\w+)/g, '$1 u $2'),
      t => t.replace(/(\w+),\s+(\w+)/g, '$2, $1'), t => t.replace(/(\w+)\s+que\s+(\w+)/g, '$2 el cual $1'),
      t => t.replace(/un\s+(\w+)\s+(\w+)/g, 'un $2 y $1')
    ];
    const steps = currentSettings.depth === 'fuerte' ? 5 : currentSettings.depth === 'normal' ? 3 : 1;
    for (let i = 0; i < steps; i++) {
      if (currentSettings.styleVariation) { result = transformations[i % transformations.length](result); }
      if (currentSettings.lexicalRichness) {
        for (const [word, synonyms] of Object.entries(richSynonyms)) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          result = result.replace(regex, () => synonyms[Math.floor(Math.random() * synonyms.length)]);
        }
      }
    }
    return result;
  }, [richSynonyms]);

  const addNaturalFlow = useCallback((text, currentSettings) => {
    let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 5);
    return paragraphs.map((para, idx) => {
      let sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      if (currentSettings.connectorVariety && idx > 0 && Math.random() < 0.7) {
        let connector = connectors[Math.floor(Math.random() * connectors.length)];
        if (aiConectors.some(ac => connector.toLowerCase().includes(ac))) {
           if (Math.random() < 0.6) { connector = connectors[Math.floor(Math.random() * connectors.length)]; } else { connector = null; }
        }
        if (connector) { sentences[0] = `${connector} ${sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1)}`; }
      }
      if (currentSettings.naturalFlow && sentences.length > 2 && Math.random() < 0.5) {
        const insertAt = Math.floor(sentences.length / 2);
        const choice = Math.random();
        if (choice < 0.4) { sentences.splice(insertAt, 0, `Es como dicen, ${humanIdioms[Math.floor(Math.random() * humanIdioms.length)]}.`); }
        else if (choice < 0.8) {
           const examples = ['yo mismo me acuerdo de una vez que...', 'me pasó algo parecido el otro día...', 'imagínate la escena:', 'recuerdo perfectamente cuando...'];
           sentences.splice(insertAt, 0, `Por ejemplo, ${examples[Math.floor(Math.random() * examples.length)]}`);
        }
      }
      if (currentSettings.depth === 'fuerte' && Math.random() < 0.4) {
        const sentenceIdx = Math.floor(Math.random() * sentences.length);
        if (sentences[sentenceIdx].split(' ').length > 5) {
          const words = sentences[sentenceIdx].split(' ');
          const repeatIndex = Math.floor(Math.random() * (words.length - 2)) + 1;
          if (words[repeatIndex] && words[repeatIndex -1] !== words[repeatIndex]) {
             words.splice(repeatIndex, 0, words[repeatIndex]);
             sentences[sentenceIdx] = words.join(' ');
          }
        }
      }
      if (currentSettings.depth === 'fuerte' && Math.random() < 0.2) {
         const pause = ['eh...', 'pues...', 'bueno...', 'digamos...', 'verá...'];
         const insertAt = Math.floor(Math.random() * sentences.length);
         sentences[insertAt] = sentences[insertAt].replace(/^/, `${pause[Math.floor(Math.random() * pause.length)]} `);
      }
      return sentences.join(' ');
    }).join('\n\n');
  }, [connectors, aiConectors, humanIdioms]);

  const adjustToneAndReadability = useCallback((text, settings) => {
    let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 5);
    let processedParagraphs = [];
    let sentenceLengths = []; 

    paragraphs.forEach(para => {
      let sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      sentenceLengths.push(...sentences.map(s => s.split(/\s+/).length));
      processedParagraphs.push(sentences);
    });

    const avgSentenceLength = sentenceLengths.length > 0 ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length : 1;
    const stdDevSentenceLength = sentenceLengths.length > 0 ? Math.sqrt(sentenceLengths.reduce((acc, val) => acc + Math.pow(val - avgSentenceLength, 2), 0) / sentenceLengths.length) : 0;

    return processedParagraphs.map((paraSentences, pIdx) => {
      let finalSentences = paraSentences.map((sentence, idx) => {
        let processed = sentence.trim();
        const currentSentenceLength = processed.split(/\s+/).length;

        if (settings.sentenceLengthVariation) {
          const shouldShorten = currentSentenceLength > avgSentenceLength + 8 && stdDevSentenceLength > 4 && Math.random() < 0.6;
          const shouldLengthen = currentSentenceLength < avgSentenceLength - 6 && stdDevSentenceLength > 4 && Math.random() < 0.4;

          if (shouldShorten) {
            const breakPoint = Math.max(10, processed.lastIndexOf(' ', Math.floor(processed.length / 2)));
            if (breakPoint > 5) {
              const firstPart = processed.slice(0, breakPoint);
              const secondPart = processed.slice(breakPoint + 1);
              processed = `${firstPart}. ${secondPart.charAt(0).toLowerCase() + secondPart.slice(1)}`;
          }} else if (shouldLengthen) {
            const clauses = ['y esto es importante porque', 'lo cual significa que', 'y esto permite que', 'debido a que', 'algo que, en mi opinión,'];
            processed = `${processed} ${clauses[Math.floor(Math.random() * clauses.length)]} ...`; 
          }
        }

        if (settings.toneAdjustment || settings.readabilityFocus) {
          if (settings.readabilityFocus && processed.length > 45 && Math.random() < 0.25) {
            const mid = Math.floor(processed.length / 2);
            const breakAt = processed.lastIndexOf(' ', mid);
            if (breakAt > 15) {
              const first = processed.slice(0, breakAt);
              const second = processed.slice(breakAt + 1);
              processed = `${first}. ${second.charAt(0).toUpperCase() + second.slice(1)}.`;
            }
          }
          
          if (settings.toneAdjustment && idx > 0 && Math.random() < 0.3) {
            const introClauses = [
              'Aunque parezca mentira,', 'Cuando menos te lo esperas,', 
              'Justo en ese momento,', 'Después de todo lo dicho,', 'Si bien es cierto que,',
              'Cabe destacar que,'
            ];
            const clause = introClauses[Math.floor(Math.random() * introClauses.length)];
            processed = `${clause} ${processed.charAt(0).toLowerCase() + processed.slice(1)}`;
          }
          
          if (settings.readabilityFocus && Math.random() < 0.15) { // Mayor probabilidad de simplificar
              const formalToInformal = {
                  "implementar": "usar", "optimizar": "mejorar", "paradigma": "enfoque",
                  "sinergia": "colaboración", "efectuar": "hacer", "procedimiento": "paso",
                  "facilitar": "ayudar", "consecuentemente": "por eso"
              };
              for (const [formal, informal] of Object.entries(formalToInformal)) {
                  const regex = new RegExp(`\\b${formal}\\b`, 'gi');
                  if (regex.test(processed)) {
                      processed = processed.replace(regex, informal);
                      break;
                  }
              }
          }
        }
        
        return processed;
      });
      
      if (settings.sentenceLengthVariation && finalSentences.length > 1) {
         finalSentences.sort((a, b) => {
             const lenA = a.split(/\s+/).length;
             const lenB = b.split(/\s+/).length;
             return Math.random() < 0.5 ? lenA - lenB : lenB - lenA;
         });
      }

      return finalSentences.join(' ');
    }).join('\n\n');
  }, [settings]);

  const simulateStyleAnalysis = useCallback((text, settings) => {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    if (sentenceCount === 0) return 0; // Evitar división por cero

    const avgSentenceLength = wordCount / sentenceCount;
    const sentenceWordCounts = sentences.map(s => s.split(/\s+/).length);
    const stdDevSentenceLength = sentenceLengths.length > 0 ? Math.sqrt(sentenceWordCounts.reduce((acc, val) => acc + Math.pow(val - avgSentenceLength, 2), 0) / sentenceCount) : 0;

    let aiScore = 0;
    let totalPossibleScore = 0;

    // 1. Variación de Longitud de Oración
    const lengthVariationScore = stdDevSentenceLength < 5 ? 40 : stdDevSentenceLength < 10 ? 20 : 0; 
    aiScore += lengthVariationScore;
    totalPossibleScore += 40;

    // 2. Riqueza Léxica
    const uniqueWords = new Set(words.filter(w => w.length > 3)).size;
    const lexicalDiversity = uniqueWords / words.filter(w => w.length > 3).length || 0;
    const lexicalScore = lexicalDiversity < 0.25 ? 40 : lexicalDiversity < 0.4 ? 20 : 0;
    aiScore += lexicalScore;
    totalPossibleScore += 40;

    // 3. Uso de Conectores
    let aiConnectorCount = 0;
    const connectorUse = sentences.flatMap(s => s.toLowerCase().split(/[\s,.!?;:]+/).filter(w => w.length > 0));
    aiConnectorCount = connectorUse.filter(w => aiConectors.includes(w)).length;
    const connectorPenalty = (aiConnectorCount / sentenceCount) * 100;
    const connectorScore = connectorPenalty > 15 ? 50 : connectorPenalty > 5 ? 25 : 0;
    aiScore += connectorScore;
    totalPossibleScore += 50;
    
    // 4. Patrones de estructura (Repetición de inicios)
    const sentenceStarts = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase());
    const startCounts = {};
    sentenceStarts.forEach(start => { if (start) startCounts[start] = (startCounts[start] || 0) + 1; });
    const mostFrequentStartCount = Object.values(startCounts).reduce((max, count) => Math.max(max, count), 0);
    const repetitionScore = (mostFrequentStartCount / sentenceCount) * 100;
    const repetitionPenalty = repetitionScore > 30 ? 30 : repetitionScore > 20 ? 15 : 0;
    aiScore += repetitionPenalty;
    totalPossibleScore += 30;

    const finalAIProbability = Math.min(100, aiScore);
    const humanQualityScore = Math.max(0, 100 - finalAIProbability);

    setAnalysisScore(humanQualityScore);
    return humanQualityScore;
  }, [settings, aiConectors]);

  const processText = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Por favor, introduce o pega texto para procesar.");
      return;
    };
    
    setIsProcessing(true);
    setError(null); // Limpiar errores previos
    setProcessingProgress(0); // Resetear progreso
    setActiveTab('analyze');
    
    try {
      // Simulación de progreso
      const totalSteps = 5;
      const stepDuration = 150; // ms per step

      // La lógica de aplicar pasos se puede simplificar llamando directamente a las funciones
      let processedText = inputText;
      
      // Paso 1: Limpieza
      processedText = cleanText(processedText);
      setProcessingProgress(Math.round((1 / totalSteps) * 100));

      // Paso 2: Deep Semantic Rewrite
      processedText = deepSemanticRewrite(processedText, settings);
      setProcessingProgress(Math.round((2 / totalSteps) * 100));

      // Paso 3: Translation Simulation (Lexical Richness)
      processedText = translationSimulation(processedText, settings);
      setProcessingProgress(Math.round((3 / totalSteps) * 100));

      // Paso 4: Natural Flow & Connectors
      processedText = addNaturalFlow(processedText, settings);
      setProcessingProgress(Math.round((4 / totalSteps) * 100));
      
      // Paso 5: Tone & Readability Adjustment
      processedText = adjustToneAndReadability(processedText, settings);
      setProcessingProgress(Math.round((5 / totalSteps) * 100));

      setOutputText(processedText);
      simulateStyleAnalysis(processedText, settings);
      setActiveTab('review');
      
    } catch (err) {
      console.error("Error during processing:", err);
      setError("Ocurrió un error al procesar el texto. Intenta de nuevo.");
      setOutputText(''); // Limpiar salida en caso de error
      setAnalysisScore(0);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0); // Resetear progreso al finalizar
    }
  }, [inputText, settings, cleanText, deepSemanticRewrite, translationSimulation, addNaturalFlow, adjustToneAndReadability, simulateStyleAnalysis]);

  const copyToClipboard = useCallback(() => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopyFeedback(true);
    }).catch(err => {
      console.error("Error copying to clipboard:", err);
      setError("No se pudo copiar el texto al portapapeles.");
    });
  }, [outputText]);

  const downloadText = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texto-redactado-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [outputText]);

  const clearAll = useCallback(() => {
    setInputText('');
    setOutputText('');
    setAnalysisScore(0); 
    setError(null);
    setActiveTab('write');
    // Opcionalmente, podrías querer limpiar el almacenamiento local aquí también:
    // localStorage.removeItem(STORAGE_KEYS.LAST_TEXT);
    // localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }, []);

  // Efecto para ocultar el toast de copia
  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  // Efecto para manejar el cambio de tab y scroll
  useEffect(() => {
    if (activeTab === 'write') {
      window.scrollTo(0, 0); // Scroll a la cima al ir a la pestaña de escritura
    } else if (activeTab === 'review') {
       // Scroll suave al área de resultados si existe
       const outputElement = document.getElementById('output-section');
       if (outputElement) {
           outputElement.scrollIntoView({ behavior: 'smooth' });
       }
    }
  }, [activeTab]);

  // Manejo de entrada de archivo
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setInputText(e.target.result);
      setError(null); // Limpiar error si el archivo se carga bien
    };
    reader.onerror = () => {
      setError("Error al leer el archivo.");
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 py-4 shadow-sm border-b border-slate-200/70">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              RedactaPro
            </h1>
          </div>
          <p className="hidden md:block text-slate-600 text-lg">Tu aliado para una escritura auténtica y natural.</p>
          {/* Botones de navegación */}
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('write')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'write' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              Editor
            </button>
            <button 
              onClick={() => setActiveTab('analyze')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'analyze' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              Análisis
            </button>
             <button 
              onClick={() => setActiveTab('review')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'review' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              Resultado
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'write' && (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Editor y Configuración */}
            <div className="lg:col-span-2 space-y-6">
              <div className="analysis-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-slate-800">Tu Texto Original</h2>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); setError(null); }} // Limpiar error al escribir
                  placeholder="Pega tu texto aquí o cárgalo desde un archivo..."
                  className="input-textarea w-full h-64 p-4 text-slate-700 focus:ring-primary focus:border-transparent"
                  rows="8"
                />
                <div className="flex flex-wrap gap-3 mt-4">
                   <input type="file" accept=".txt, .md, .docx" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={triggerFileInput} className="btn-secondary flex-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-8.003 4 4 0 018.601-1.233A4 4 0 0116 7a4 4 0 01-3.191 4.829L11 15zm0 0a4 4 0 01-3.191-4.829c.777.284 1.591.45 2.409.45h1.114L11 15z"/>
                    </svg>
                    Cargar Archivo
                  </button>
                  <button onClick={clearAll} className="btn-secondary flex-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M7 7h14a2 2 0 012 2v7a2 2 0 01-2 2h-14a2 2 0 01-2-2v-7a2 2 0 012-2z"/>
                    </svg>
                    Limpiar Todo
                  </button>
                </div>
              </div>

              {/* Configuración de Humanización */}
              <div className="analysis-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.99.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-800">Ajustes de Humanización</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Profundidad de Modificación
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['suave', 'normal', 'fuerte'].map(level => (
                        <button
                          key={level}
                          onClick={() => setSettings({...settings, depth: level})}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                            settings.depth === level
                              ? "bg-primary text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {level === 'suave' ? 'Ligera' : level === 'normal' ? 'Media' : 'Profunda'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="text-md font-semibold text-slate-700">Enfoques</h4>
                    {[
                      { key: 'styleVariation', label: 'Variación Estructural', tooltip: 'Altera el orden de las frases y la construcción gramatical.' },
                      { key: 'naturalFlow', label: 'Fluidez Natural (Modismos)', tooltip: 'Introduce expresiones coloquiales y ejemplos personales.' },
                      { key: 'toneAdjustment', label: 'Ajuste de Tono y Ritmo', tooltip: 'Varía la longitud y el inicio de las oraciones para un mejor flujo.' },
                      { key: 'readabilityFocus', label: 'Claridad y Legibilidad', tooltip: 'Simplifica jerga y asegura que las ideas sean fáciles de seguir.' },
                      { key: 'sentenceLengthVariation', label: 'Variación Longitud Oración', tooltip: 'Asegura una mezcla de oraciones cortas y largas.' },
                      { key: 'connectorVariety', label: 'Variedad de Conectores', tooltip: 'Evita conectores repetitivos o muy asociados a IA.' },
                      { key: 'lexicalRichness', label: 'Riqueza Léxica', tooltip: 'Utiliza sinónimos menos comunes pero naturales.' },
                      { key: 'avoidRepetition', label: 'Evitar Repeticiones', tooltip: 'Minimiza la repetición de palabras clave y estructuras.' }
                    ].map(({ key, label, tooltip }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) => setSettings({...settings, [key]: e.target.checked})}
                          className="w-4 h-4 text-primary rounded border-slate-300 shadow-sm focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">{label}</span>
                        <span className="tooltip">
                            <span className="tooltiptext text-xs">{tooltip}</span>
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c-.548.505-.902 1.284-1.095 2.114-.193.83.046 1.639.797 2.245.813.607 1.756 1.144 2.796 1.49L13.5 17.483c.171.408.455.796.818.817.362.02.659-.314.818-.712.16-.407.268-.81.362-1.222.094-.412.15-.83.15-1.25V9.342c0-.538-.109-1.059-.306-1.541-.197-.482-.486-.932-.847-1.304a7.786 7.786 0 00-1.295-1.295A4.674 4.674 0 009.876 6.75c-.715.01-1.426.145-2.07.354-.793.245-1.543.584-2.224.973" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.75l.001-.002" />
                            </svg>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de Procesamiento y Barra de Progreso */}
            <div className="lg:col-span-3 flex flex-col justify-end">
              <div className="bg-white analysis-card p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Acción</h3>
                {isProcessing && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">Procesando...</span>
                      <span className="text-sm font-medium text-primary">{processingProgress}%</span>
                    </div>
                    <div className="progress-bar-container h-3">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                )}
                <button
                  onClick={processText}
                  disabled={!inputText.trim() || isProcessing}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Humanizar y Analizar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Resultados y Análisis */}
        {activeTab === 'review' && outputText && (
          <section id="output-section" className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="analysis-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-slate-800">Texto Humanizado</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copyFeedback ? '¡Copiado!' : 'Copiar'}
                    </button>
                    <button
                      onClick={downloadText}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar
                    </button>
                  </div>
                </div>
                
                <div 
                  className="w-full min-h-64 p-4 border border-slate-300 rounded-xl bg-slate-50 text-slate-800 leading-relaxed whitespace-pre-wrap font-sans"
                >
                  {outputText || "El texto mejorado aparecerá aquí..."}
                </div>
              </div>
            </div>

            {/* Análisis de "Humanidad" */}
            <div className="lg:col-span-1">
              <div className="analysis-card p-6 sticky top-24"> {/* Sticky para mantenerlo visible */}
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-800">Análisis de "Calidad Humana"</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>Probabilidad de ser Humano</span>
                      <span className="font-bold">{analysisScore.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar-container h-3">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${analysisScore}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-orange-700">
                      {analysisScore > 75 ? (
                        <>Alta probabilidad de ser humano.</>
                      ) : analysisScore > 50 ? (
                        <>Indicicios de naturalidad, podría mejorar.</>
                      ) : analysisScore > 25 ? (
                        <>Posibles patrones de IA detectados.</>
                      ) : (
                        <>Fuerte similitud con texto de IA.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'analyze' && !outputText && !isProcessing && inputText.trim() && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">¡Listo para procesar!</h2>
            <p className="text-lg text-slate-500 mb-8">Ajusta las opciones de humanización y haz clic en 'Humanizar y Analizar' para ver los resultados.</p>
             <button
                onClick={processText}
                className="btn-primary py-3 px-6 text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Humanizar y Analizar
              </button>
          </div>
        )}
        {activeTab === 'analyze' && !inputText.trim() && (
          <div className="text-center py-20">
             <h2 className="text-2xl font-bold text-slate-700 mb-4">¿Listo para empezar?</h2>
             <p className="text-lg text-slate-500 mb-8">Escribe o carga tu texto en la sección del Editor para comenzar.</p>
          </div>
        )}

      </main>

      {/* Toast de Copia Exitosa */}
      {copyFeedback && (
        <div className="toast-success animate-toastIn">¡Texto copiado al portapapeles!</div>
      )}

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md py-6 border-t border-slate-200/70 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>RedactaPro © 2024. Todas las operaciones se realizan localmente en tu navegador.</p>
          <p className="mt-1">Diseñado para mejorar la naturalidad y autenticidad de tu escritura.</p>
        </div>
      </footer>
    </div>
  );
};

// --- Renderizado ---
// ReactDOM.render se usa para montar la aplicación React en el elemento DOM con el ID 'editor-container'.
// Es importante que este div exista en tu popup.html.
ReactDOM.render(<RedactaPro />, document.getElementById('editor-container'));
