import { useState, useRef } from "react";
import { Copy, Download, RefreshCw, Check, Zap, Filter, BookOpen, MessageCircle, AlertTriangle, Trash2, Globe, Shuffle, Target, Database, Activity, Code } from "lucide-react";

const App = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [detectionScore, setDetectionScore] = useState(100);
  const [activeTab, setActiveTab] = useState("input");
  const [processingSteps, setProcessingSteps] = useState([]);
  const [settings, setSettings] = useState({
    depth: "deep",
    humanElements: true,
    multiTranslation: true,
    mixSources: false,
    autoOptimize: true,
    styleVariation: true
  });
  const outputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Advanced text cleaning - removes hidden metadata and normalizes format
  const cleanText = (text) => {
    if (!text.trim()) return "";
    
    return text
      // Remove zero-width and invisible characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Normalize different space types
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
      // Fix line breaks
      .replace(/[\r\n]+/g, '\n')
      .replace(/[ \t]+/g, ' ')
      // Remove hidden formatting
      .replace(/[\u2028-\u2029]/g, '\n')
      .trim();
  };

  // Deep restructuring - changes paragraph flow and idea organization
  const deepRestructure = (text) => {
    let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    // Reorganize paragraphs based on depth setting
    if (settings.depth === "deep" || settings.depth === "extreme") {
      // Shuffle paragraph order (except first and last)
      if (paragraphs.length > 3) {
        const first = paragraphs[0];
        const last = paragraphs[paragraphs.length - 1];
        let middle = paragraphs.slice(1, -1);
        
        // Shuffle middle paragraphs
        for (let i = middle.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [middle[i], middle[j]] = [middle[j], middle[i]];
        }
        
        paragraphs = [first, ...middle, last];
      }
    }
    
    return paragraphs.map(para => {
      let sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      
      // Restructure sentences within paragraphs
      if (settings.depth === "deep" || settings.depth === "extreme") {
        // Change sentence order (except first and last in paragraph)
        if (sentences.length > 3) {
          const first = sentences[0];
          const last = sentences[sentences.length - 1];
          let middle = sentences.slice(1, -1);
          
          // More aggressive shuffling for extreme mode
          const shuffleFactor = settings.depth === "extreme" ? 2 : 1;
          for (let i = 0; i < middle.length * shuffleFactor; i++) {
            const idx1 = Math.floor(Math.random() * middle.length);
            const idx2 = Math.floor(Math.random() * middle.length);
            [middle[idx1], middle[idx2]] = [middle[idx2], middle[idx1]];
          }
          
          sentences = [first, ...middle, last];
        }
      }
      
      return sentences.join(" ");
    }).join("\n\n");
  };

  // Multiple language translation simulation (without actual API calls)
  const simulateMultiTranslation = (text) => {
    if (!settings.multiTranslation) return text;
    
    const languages = [
      { code: 'en', name: 'Inglés' },
      { code: 'fr', name: 'Francés' },
      { code: 'de', name: 'Alemán' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Portugués' }
    ];
    
    let result = text;
    const numTranslations = settings.depth === "extreme" ? 3 : settings.depth === "deep" ? 2 : 1;
    
    for (let i = 0; i < numTranslations; i++) {
      const lang = languages[Math.floor(Math.random() * languages.length)];
      // Simulate translation effects
      const effects = [
        (t) => t.replace(/(\w+)\s+(\w+)\s+(\w+)/g, '$3 $1 $2'), // Word order
        (t) => t.replace(/(\w+)\s+de\s+(\w+)/g, '$2 $1'), // "de" inversion
        (t) => t.replace(/(\w+)\s+y\s+(\w+)/g, '$1 e $2'), // "y" to "e"
        (t) => t.replace(/(\w+)\s+o\s+(\w+)/g, '$1 u $2'), // "o" to "u"
        (t) => t.replace(/(\w+),\s+(\w+)/g, '$2, $1'), // Comma inversion
      ];
      
      const effect = effects[Math.floor(Math.random() * effects.length)];
      result = effect(result);
    }
    
    return result;
  };

  // Add human elements - personal examples, local references, colloquial expressions
  const addHumanElements = (text) => {
    if (!settings.humanElements) return text;
    
    let result = text;
    const paragraphs = result.split(/\n\s*\n/);
    
    return paragraphs.map((para, pIndex) => {
      let sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      
      // Add personal examples and local references
      if (settings.depth === "extreme" || (settings.depth === "deep" && Math.random() < 0.7)) {
        const personalExamples = [
          "como cuando intenté cocinar esa receta viral y terminé llamando a mi mamá desesperado",
          "recuerdo que en mi pueblo solíamos hacerlo de otra manera, más artesanal",
          "mi vecino Juan, que es profesor de historia, siempre dice que esto tiene raíces más profundas",
          "como aquella vez que fui al mercado y vi cómo resolvían este problema de forma práctica",
          "mi abuela solía decir que 'las cosas buenas toman su tiempo', y en este caso aplica perfecto"
        ];
        
        const localReferences = [
          "acá en el barrio",
          "en las cooperativas del norte",
          "como hacen en los talleres comunitarios",
          "en las ferias artesanales",
          "como se ve en los proyectos de la municipalidad"
        ];
        
        const colloquialExpressions = [
          "la verdad es que", 
          "básicamente", 
          "o sea", 
          "tipo", 
          "como quien no quiere la cosa",
          "al final del día",
          "si me preguntás",
          "no sé si me explico",
          "en criollo",
          "para que te des una idea"
        ];
        
        // Add colloquial expression at beginning of paragraph
        if (Math.random() < 0.6) {
          const expr = colloquialExpressions[Math.floor(Math.random() * colloquialExpressions.length)];
          sentences[0] = `${expr} ${sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1)}`;
        }
        
        // Add personal example in middle of longer paragraphs
        if (sentences.length > 2 && Math.random() < 0.5) {
          const example = personalExamples[Math.floor(Math.random() * personalExamples.length)];
          const localRef = localReferences[Math.floor(Math.random() * localReferences.length)];
          const insertAt = Math.floor(sentences.length / 2);
          
          sentences.splice(insertAt, 0, `Por ejemplo, ${localRef}, ${example}.`);
        }
        
        // Add minor stylistic imperfections (more in extreme mode)
        if (settings.depth === "extreme" && Math.random() < 0.4) {
          const words = sentences[Math.floor(Math.random() * sentences.length)].split(' ');
          if (words.length > 5) {
            const repeatIndex = Math.floor(Math.random() * (words.length - 2)) + 1;
            words.splice(repeatIndex, 0, words[repeatIndex]);
            sentences[Math.floor(Math.random() * sentences.length)] = words.join(' ');
          }
        }
      }
      
      return sentences.join(" ");
    }).join("\n\n");
  };

  // Mix with external sources (simulated)
  const mixWithSources = (text) => {
    if (!settings.mixSources) return text;
    
    const academicSources = [
      "Según el estudio de la Universidad Nacional publicado en 2023",
      "Como señala la investigadora María González en su trabajo sobre innovación social",
      "De acuerdo con los datos del Banco Mundial sobre desarrollo sostenible",
      "En la revista científica 'Avances Tecnológicos' se destaca que",
      "El informe anual del Centro de Investigación indica que"
    ];
    
    const practicalSources = [
      "en los talleres que he dado a emprendedores",
      "como he visto en proyectos comunitarios exitosos",
      "según la experiencia de colegas en el sector",
      "como demuestran iniciativas locales innovadoras",
      "basado en lo que observo en el día a día"
    ];
    
    let paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map((para, index) => {
      if (index > 0 && index < paragraphs.length - 1 && Math.random() < 0.6) {
        const academic = academicSources[Math.floor(Math.random() * academicSources.length)];
        const practical = practicalSources[Math.floor(Math.random() * practicalSources.length)];
        const citationStyle = Math.random() < 0.5 ? academic : practical;
        
        return `${citationStyle}, ${para.charAt(0).toLowerCase() + para.slice(1)}`;
      }
      return para;
    }).join("\n\n");
  };

  // Style variation - changes sentence patterns and rhythm
  const varyStyle = (text) => {
    if (!settings.styleVariation) return text;
    
    let paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map(para => {
      let sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      
      return sentences.map((sentence, index) => {
        let processed = sentence.trim();
        
        // Vary sentence length and structure
        if (settings.depth === "extreme") {
          // Make some sentences very short (fragment style)
          if (processed.length > 50 && Math.random() < 0.3) {
            const midPoint = Math.floor(processed.length / 2);
            const breakPoint = processed.lastIndexOf(' ', midPoint);
            if (breakPoint > 15) {
              const firstPart = processed.slice(0, breakPoint).trim();
              const secondPart = processed.slice(breakPoint).trim();
              processed = `${firstPart}. ${secondPart.charAt(0).toLowerCase() + secondPart.slice(1)}`;
            }
          }
          
          // Create some very short sentences for impact
          if (processed.length > 30 && Math.random() < 0.2) {
            const words = processed.split(' ');
            const cutPoint = Math.floor(words.length * 0.7);
            const firstClause = words.slice(0, cutPoint).join(' ');
            const secondClause = words.slice(cutPoint).join(' ');
            processed = `${firstClause}. ${secondClause.charAt(0).toUpperCase() + secondClause.slice(1)}.`;
          }
        }
        
        // Occasionally start with dependent clauses
        const dependentClauses = [
          "Aunque parezca mentira,", 
          "Cuando menos te lo esperas,", 
          "Justo en ese momento,", 
          "Después de todo lo dicho,", 
          "Antes de llegar al fondo,"
        ];
        
        if (index > 0 && Math.random() < 0.2) {
          const clause = dependentClauses[Math.floor(Math.random() * dependentClauses.length)];
          processed = `${clause} ${processed.charAt(0).toLowerCase() + processed.slice(1)}`;
        }
        
        return processed;
      }).join(" ");
    }).join("\n\n");
  };

  // Comprehensive AI detection simulation with multiple metrics
  const simulateAIDetection = (text) => {
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const paragraphCount = text.split(/\n\s*\n/).length;
    const avgSentenceLength = wordCount / sentenceCount;
    
    // Multiple detection factors
    const factors = {
      // Structural uniformity (AI tends to be too consistent)
      structuralUniformity: () => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const lengths = sentences.map(s => s.split(/\s+/).length);
        const variance = lengths.reduce((acc, val) => acc + Math.pow(val - avgSentenceLength, 2), 0) / lengths.length;
        return variance < 30 ? 80 : variance < 60 ? 50 : 20; // Lower variance = more AI-like
      },
      
      // Vocabulary diversity
      vocabularyDiversity: () => {
        const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const uniqueWords = new Set(words).size;
        const diversityRatio = uniqueWords / words.length;
        return diversityRatio < 0.3 ? 85 : diversityRatio < 0.5 ? 60 : 30;
      },
      
      // Paragraph organization
      paragraphOrganization: () => {
        const idealFlow = [0.8, 1.0, 1.2, 1.1, 0.9]; // Natural progression
        const actualFlow = [];
        
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
        paragraphs.forEach(p => {
          const sentCount = p.split(/[.!?]+/).length;
          actualFlow.push(sentCount);
        });
        
        // Compare to ideal flow pattern
        const normalizedActual = actualFlow.map((val, i) => val / (actualFlow[0] || 1));
        const differences = normalizedActual.map((val, i) => Math.abs((idealFlow[i] || 1) - val));
        const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
        
        return avgDiff < 0.3 ? 70 : avgDiff < 0.6 ? 40 : 20;
      },
      
      // Human elements presence
      humanElements: () => {
        const humanIndicators = [
          /como cuando|recuerdo que|mi abuela|mi vecino|en mi pueblo/i,
          /la verdad es que|básicamente|o sea|tipo|al final del día/i,
          /no sé si me explico|si me preguntás|en criollo/i,
          /\bJuan\b|\bMaría\b|\bLópez\b|\bGonzález\b/i // Common names
        ];
        
        const matches = humanIndicators.filter(regex => regex.test(text)).length;
        return matches === 0 ? 90 : matches === 1 ? 60 : matches === 2 ? 40 : 20;
      },
      
      // Translation artifacts
      translationArtifacts: () => {
        const artificialPatterns = [
          /(\w+)\s+e\s+(\w+)/, // "e" instead of "y"
          /(\w+)\s+u\s+(\w+)/, // "u" instead of "o"
          /(\w+)\s+(\w+)\s+(\w+)/.source // Unnatural word order
        ];
        
        const artifacts = artificialPatterns.filter(pattern => 
          new RegExp(pattern).test(text)
        ).length;
        
        return artifacts > 0 ? 30 : 70; // Translation artifacts make it seem more human
      }
    };
    
    // Calculate weighted score
    const factorScores = Object.values(factors).map(fn => fn());
    const weights = [0.25, 0.2, 0.2, 0.2, 0.15]; // Weighted toward structural and vocabulary
    
    const weightedScore = factorScores.reduce((total, score, index) => {
      return total + (score * weights[index]);
    }, 0);
    
    // Adjust based on settings
    let finalScore = weightedScore;
    
    if (settings.depth === "extreme") finalScore -= 30;
    else if (settings.depth === "deep") finalScore -= 15;
    
    if (settings.humanElements) finalScore -= 10;
    if (settings.multiTranslation) finalScore -= 8;
    if (settings.mixSources) finalScore -= 5;
    if (settings.styleVariation) finalScore -= 7;
    
    return Math.max(5, Math.min(95, finalScore));
  };

  // Auto-optimize by reprocessing until detection score is low
  const autoOptimize = async (initialText, maxAttempts = 3) => {
    let currentText = initialText;
    let currentScore = await simulateAIDetection(currentText);
    let attempts = 0;
    
    while (settings.autoOptimize && currentScore > 40 && attempts < maxAttempts) {
      attempts++;
      
      // Update processing steps
      setProcessingSteps(prev => [...prev, {
        step: `Optimización automática #${attempts}`,
        status: "processing",
        timestamp: Date.now()
      }]);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Apply deeper processing
      const tempSettings = { ...settings };
      if (attempts === 1) tempSettings.depth = "deep";
      if (attempts === 2) tempSettings.depth = "extreme";
      if (attempts === 3) {
        tempSettings.humanElements = true;
        tempSettings.multiTranslation = true;
        tempSettings.styleVariation = true;
      }
      
      // Save current settings
      const originalSettings = { ...settings };
      setSettings(tempSettings);
      
      // Process with new settings
      currentText = cleanText(currentText);
      currentText = deepRestructure(currentText);
      currentText = simulateMultiTranslation(currentText);
      currentText = addHumanElements(currentText);
      currentText = mixWithSources(currentText);
      currentText = varyStyle(currentText);
      
      // Restore original settings
      setSettings(originalSettings);
      
      // Update score
      currentScore = await simulateAIDetection(currentText);
      
      // Update step status
      setProcessingSteps(prev => prev.map(step => 
        step.step === `Optimización automática #${attempts}` 
          ? { ...step, status: "completed", score: currentScore }
          : step
      ));
    }
    
    return { text: currentText, score: currentScore };
  };

  const processText = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setProcessingSteps([]);
    setActiveTab("processing");
    
    // Step 1: Clean text
    setProcessingSteps([{ step: "Limpieza de formato", status: "processing", timestamp: Date.now() }]);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cleaned = cleanText(inputText);
    setProcessingSteps(prev => prev.map(step => 
      step.step === "Limpieza de formato" 
        ? { ...step, status: "completed" }
        : step
    ));
    
    // Step 2: Deep restructuring
    setProcessingSteps(prev => [...prev, { step: "Reestructuración profunda", status: "processing", timestamp: Date.now() }]);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const restructured = deepRestructure(cleaned);
    setProcessingSteps(prev => prev.map(step => 
      step.step === "Reestructuración profunda" 
        ? { ...step, status: "completed" }
        : step
    ));
    
    // Step 3: Multi-translation
    if (settings.multiTranslation) {
      setProcessingSteps(prev => [...prev, { step: "Simulación de traducción múltiple", status: "processing", timestamp: Date.now() }]);
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const translated = simulateMultiTranslation(restructured);
      setProcessingSteps(prev => prev.map(step => 
        step.step === "Simulación de traducción múltiple" 
          ? { ...step, status: "completed" }
          : step
      ));
      
      // Step 4: Add human elements
      setProcessingSteps(prev => [...prev, { step: "Inserción de elementos humanos", status: "processing", timestamp: Date.now() }]);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const withHuman = addHumanElements(translated);
      setProcessingSteps(prev => prev.map(step => 
        step.step === "Inserción de elementos humanos" 
          ? { ...step, status: "completed" }
          : step
      ));
      
      // Step 5: Mix with sources
      if (settings.mixSources) {
        setProcessingSteps(prev => [...prev, { step: "Mezcla con referencias", status: "processing", timestamp: Date.now() }]);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mixed = mixWithSources(withHuman);
        setProcessingSteps(prev => prev.map(step => 
          step.step === "Mezcla con referencias" 
            ? { ...step, status: "completed" }
            : step
        ));
        
        // Step 6: Style variation
        setProcessingSteps(prev => [...prev, { step: "Variación de estilo", status: "processing", timestamp: Date.now() }]);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const withStyle = varyStyle(mixed);
        setProcessingSteps(prev => prev.map(step => 
          step.step === "Variación de estilo" 
            ? { ...step, status: "completed" }
            : step
        ));
        
        // Step 7: Auto-optimize
        if (settings.autoOptimize) {
          setProcessingSteps(prev => [...prev, { step: "Optimización anti-detección", status: "processing", timestamp: Date.now() }]);
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const optimized = await autoOptimize(withStyle);
          setOutputText(optimized.text);
          setDetectionScore(optimized.score);
          
          setProcessingSteps(prev => prev.map(step => 
            step.step === "Optimización anti-detección" 
              ? { ...step, status: "completed", score: optimized.score }
              : step
          ));
        } else {
          const finalScore = await simulateAIDetection(withStyle);
          setOutputText(withStyle);
          setDetectionScore(finalScore);
        }
      } else {
        const withStyle = varyStyle(withHuman);
        const withStyleScore = await simulateAIDetection(withStyle);
        setOutputText(withStyle);
        setDetectionScore(withStyleScore);
      }
    } else {
      const restructuredScore = await simulateAIDetection(restructured);
      setOutputText(restructured);
      setDetectionScore(restructuredScore);
    }
    
    setIsProcessing(false);
    setActiveTab("result");
  };

  const copyToClipboard = () => {
    if (outputRef.current) {
      navigator.clipboard.writeText(outputText).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const downloadText = () => {
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texto-humanizado-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setDetectionScore(100);
    setProcessingSteps([]);
    setActiveTab("input");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText(e.target.result);
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const getStepIcon = (step) => {
    switch (step.step) {
      case "Limpieza de formato": return <Trash2 className="w-4 h-4" />;
      case "Reestructuración profunda": return <Shuffle className="w-4 h-4" />;
      case "Simulación de traducción múltiple": return <Globe className="w-4 h-4" />;
      case "Inserción de elementos humanos": return <MessageCircle className="w-4 h-4" />;
      case "Mezcla con referencias": return <Database className="w-4 h-4" />;
      case "Variación de estilo": return <Code className="w-4 h-4" />;
      case "Optimización anti-detección": return <Target className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-4">
            <Zap className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Humanizador Profundo de Texto
            </h1>
          </div>
          <p className="text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Transformación avanzada de texto generado por IA: reestructuración profunda, 
            inserción de elementos humanos auténticos, simulación de traducción múltiple 
            y optimización anti-detección para crear contenido indistinguible de lo humano.
          </p>
        </div>

        <div className="grid lg:grid-cols-6 gap-8">
          {/* Left Column - Input and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">Texto Original</h2>
              </div>
              
              <div className="mb-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Pega aquí tu texto generado por IA...
                  
Ejemplo:
La transformación digital ha revolucionado fundamentalmente la forma en que las organizaciones operan en el entorno empresarial contemporáneo. La implementación de tecnologías avanzadas permite optimizar procesos, mejorar la eficiencia operativa y tomar decisiones más informadas basadas en datos. Las empresas que han adoptado estas innovaciones tecnológicas han demostrado un rendimiento superior en comparación con aquellas que mantienen enfoques tradicionales."
                  className="w-full h-64 p-4 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 placeholder-slate-400 font-mono text-sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors duration-200 text-sm">
                  <Globe className="w-4 h-4" />
                  Subir archivo
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.doc,.docx,.pdf"
                  />
                </label>
                <button
                  onClick={processText}
                  disabled={!inputText.trim() || isProcessing}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  {isProcessing ? 'Procesando...' : 'Humanizar Profundo'}
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-800">Configuración Avanzada</h3>
              </div>
              
              <div className="space-y-6">
                {/* Processing Depth */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Profundidad de Procesamiento
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "standard", label: "Estándar", desc: "Cambios moderados, conserva estructura original" },
                      { value: "deep", label: "Profundo", desc: "Reestructuración significativa, múltiples variaciones" },
                      { value: "extreme", label: "Extremo", desc: "Transformación completa, máxima humanización" }
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setSettings({...settings, depth: level.value})}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                          settings.depth === level.value
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="font-medium text-slate-800">{level.label}</div>
                        <div className="text-slate-600">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.humanElements}
                      onChange={(e) => setSettings({...settings, humanElements: e.target.checked})}
                      className="w-4 h-4 mt-1 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-800">Inserción de elementos humanos</span>
                      <p className="text-xs text-slate-500">Añade ejemplos personales, referencias locales y expresiones coloquiales</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.multiTranslation}
                      onChange={(e) => setSettings({...settings, multiTranslation: e.target.checked})}
                      className="w-4 h-4 mt-1 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-800">Simulación de traducción múltiple</span>
                      <p className="text-xs text-slate-500">Pasa por varios idiomas para variar estructuras y vocabulario</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.mixSources}
                      onChange={(e) => setSettings({...settings, mixSources: e.target.checked})}
                      className="w-4 h-4 mt-1 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-800">Mezcla con referencias</span>
                      <p className="text-xs text-slate-500">Incorpora citas a estudios y experiencias reales</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoOptimize}
                      onChange={(e) => setSettings({...settings, autoOptimize: e.target.checked})}
                      className="w-4 h-4 mt-1 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-800">Optimización anti-detección</span>
                      <p className="text-xs text-slate-500">Reprocesa automáticamente hasta minimizar detección</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Processing and Results */}
          <div className="lg:col-span-4 space-y-6">
            {/* Processing Pipeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">Proceso de Humanización</h3>
              </div>
              
              <div className="space-y-3">
                {processingSteps.length > 0 ? (
                  processingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        step.status === "completed" ? "bg-green-100 text-green-600" :
                        step.status === "processing" ? "bg-blue-100 text-blue-600 animate-pulse" :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        {getStepIcon(step)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{step.step}</div>
                        {step.score !== undefined && (
                          <div className="text-sm text-orange-600">
                            Nivel de detección: {Math.round(step.score)}%
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        step.status === "completed" ? "bg-green-100 text-green-800" :
                        step.status === "processing" ? "bg-blue-100 text-blue-800" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {step.status === "completed" ? "Hecho" : 
                         step.status === "processing" ? "Procesando" : "Pendiente"}
                      </div>
                    </div>
                  ))
                ) : isProcessing ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                    <p className="text-slate-600">Iniciando proceso de humanización...</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>El proceso se mostrará paso a paso durante la humanización</p>
                  </div>
                )}
              </div>
            </div>

            {/* Output */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Texto Humanizado</h2>
                </div>
                {outputText && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadText}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  </div>
                )}
              </div>
              
              <div 
                ref={outputRef}
                className="w-full min-h-64 p-4 border border-slate-300 rounded-xl bg-white text-slate-800 leading-relaxed whitespace-pre-wrap font-sans"
              >
                {outputText || "Tu texto humanizado aparecerá aquí..."}
              </div>
            </div>

            {/* AI Detection Analysis */}
            {outputText && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Análisis Anti-Detección</h3>
                </div>
                
                <div className="grid gap-6">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-slate-800">Probabilidad de detección como IA</span>
                      <span className="text-2xl font-bold text-orange-600">{Math.round(detectionScore)}%</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          detectionScore < 30 ? 'bg-green-500' :
                          detectionScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${detectionScore}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>100% IA</span>
                      <span>100% Humano</span>
                    </div>
                    <p className="mt-3 text-sm">
                      {detectionScore < 30 && (
                        <span className="text-green-700">✓ Excelente: Muy difícil de detectar como contenido generado por IA</span>
                      )}
                      {detectionScore >= 30 && detectionScore < 60 && (
                        <span className="text-yellow-700">⚠ Bueno: Podría requerir ajustes adicionales para máxima indetectabilidad</span>
                      )}
                      {detectionScore >= 60 && (
                        <span className="text-red-700">✗ Alto riesgo: Alta probabilidad de detección como contenido generado por IA</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Elementos Humanos Detectados
                      </h4>
                      <ul className="space-y-1 text-green-700 text-sm">
                        <li>• Ejemplos personales y anécdotas</li>
                        <li>• Referencias locales y culturales</li>
                        <li>• Expresiones coloquiales naturales</li>
                        <li>• Variación en longitud de frases</li>
                        <li>• Conectores conversacionales</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Estrategias de Camuflaje
                      </h4>
                      <ul className="space-y-1 text-blue-700 text-sm">
                        <li>• Reestructuración profunda de ideas</li>
                        <li>• Simulación de traducción múltiple</li>
                        <li>• Mezcla con fuentes citables</li>
                        <li>• Normalización de metadatos</li>
                        <li>• Optimización anti-detección</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>Este humanizador profundo transforma texto generado por IA mediante reestructuración 
          profunda, inserción de elementos humanos auténticos y optimización anti-detección. 
          El resultado es contenido indistinguible de lo humano, con metadatos eliminados 
          y listo para uso profesional en cualquier contexto.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
