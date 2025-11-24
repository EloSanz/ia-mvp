import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Servicio para procesamiento de documentos PDF/DOCX/DOC desde buffer de memoria
 * Diseñado para Azure App Service (sin dependencia de filesystem)
 */
class DocumentParserService {
  constructor() {
    this.MAX_CHUNK_SIZE = 3000; // tokens aproximados
    // 🚀 MEJORA: Reducir de 50 a 30 páginas (más realista para procesamiento en 3 min)
    this.MAX_PAGES = 30;
    // 🚀 MEJORA: Aumentar de 100 a 300 caracteres (documento útil debe tener contenido)
    this.MIN_CHARS = 300;
    // 🚀 MEJORA: Aumentar de 50 a 100 chars/página (mejor detección de PDFs escaneados)
    this.SCANNED_PDF_THRESHOLD = 100;
    // 🚀 MEJORA NUEVA: Límite de caracteres máximo para evitar docs gigantes
    this.MAX_CHARS = 100000; // ~25k tokens, suficiente para 30 páginas
  }

  /**
   * Método principal: parsea documento desde buffer de memoria
   * @param {Buffer} buffer - Buffer del archivo
   * @param {string} mimetype - Tipo MIME del archivo
   * @param {string} originalname - Nombre original del archivo
   * @returns {Promise<Object>} Datos del documento parseado
   */
  async parseDocumentFromBuffer(buffer, mimetype, originalname) {
    if (!buffer || buffer.length === 0) {
      throw new Error('El archivo está vacío');
    }

    let text;
    let pageCount = 0;
    
    try {
      switch (mimetype) {
        case 'application/pdf':
          const pdfData = await this.extractTextFromPDFBuffer(buffer);
          text = pdfData.text;
          pageCount = pdfData.numpages;
          break;
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = await this.extractTextFromDOCXBuffer(buffer);
          break;
        
        case 'application/msword':
          text = await this.extractTextFromDOCBuffer(buffer);
          break;
        
        default:
      throw new Error(`Formato no soportado: ${mimetype}`);
    }
  } catch (error) {
    console.error('Error extrayendo texto:', error);
    throw new Error(`No se pudo extraer texto del documento. Verifica que no esté corrupto o protegido.`);
  }

    // Limpieza y procesamiento
    const cleanedText = this.cleanText(text);
    
    // 🚀 Estimar páginas para formatos que no reportan pageCount (DOCX, DOC)
    if (pageCount === 0 && cleanedText.length > 0) {
      // Estimación: ~2500 caracteres por página (promedio entre documentos densos y espaciados)
      const CHARS_PER_PAGE = 2500;
      pageCount = Math.ceil(cleanedText.length / CHARS_PER_PAGE);
    }
    
    // 🚀 Validar páginas máximas (aplica a todos los formatos)
    if (pageCount > this.MAX_PAGES) {
      throw new Error(
        `El documento tiene ${pageCount} páginas ${mimetype.includes('word') ? '(estimadas)' : ''}. ` +
        `El máximo permitido es ${this.MAX_PAGES} páginas.`
      );
    }
    
    // Detectar PDF escaneado (solo para PDFs reales con pageCount)
    if (mimetype === 'application/pdf') {
      const avgCharsPerPage = cleanedText.length / pageCount;
      if (avgCharsPerPage < this.SCANNED_PDF_THRESHOLD) {
        throw new Error(
          'Este PDF parece ser una imagen escaneada sin texto seleccionable. ' +
          'Por favor, usa un PDF con texto o intenta con OCR primero.'
        );
      }
    }
    
    // 🚀 MEJORA: Validar texto mínimo
    if (cleanedText.length < this.MIN_CHARS) {
      throw new Error(
        `El documento tiene muy poco texto (${cleanedText.length} caracteres). ` +
        `Se requieren al menos ${this.MIN_CHARS} caracteres para generar flashcards útiles.`
      );
    }

    // 🚀 MEJORA NUEVA: Validar texto máximo para evitar timeouts y exceso de costos
    if (cleanedText.length > this.MAX_CHARS) {
      throw new Error(
        `El documento es demasiado largo (${cleanedText.length} caracteres). ` +
        `El máximo permitido es ${this.MAX_CHARS} caracteres (~${this.MAX_PAGES} páginas).`
      );
    }

    const structure = this.analyzeStructure(cleanedText);
    const chunks = this.chunkText(cleanedText);
    const estimatedTime = this.estimateProcessingTime(buffer.length, chunks.length);
    
    return {
      text: cleanedText,
      structure,
      chunks,
      metadata: {
        length: cleanedText.length,
        chunkCount: chunks.length,
        pageCount,
        originalName: originalname,
        fileSize: buffer.length,
        estimatedTime
      }
    };
  }

  /**
   * Extrae texto de PDF desde buffer
   * @param {Buffer} buffer - Buffer del PDF
   * @returns {Promise<Object>} Objeto con texto y metadatos
   */
  async extractTextFromPDFBuffer(buffer) {
    try {
      const data = await pdf(buffer);
      return {
        text: data.text,
        numpages: data.numpages
      };
    } catch (error) {
      throw new Error(`Error extrayendo texto de PDF: ${error.message}`);
    }
  }

  /**
   * Extrae texto de DOCX desde buffer
   * @param {Buffer} buffer - Buffer del DOCX
   * @returns {Promise<string>} Texto extraído
   */
  async extractTextFromDOCXBuffer(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Error extrayendo texto de DOCX: ${error.message}`);
    }
  }

  /**
   * Extrae texto de DOC (formato antiguo) desde buffer
   * @param {Buffer} buffer - Buffer del DOC
   * @returns {Promise<string>} Texto extraído
   */
  async extractTextFromDOCBuffer(buffer) {
    try {
      // Mammoth también soporta .doc en algunos casos
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(
        'Error extrayendo texto de DOC. ' +
        'Por favor, intenta convertir el archivo a DOCX o PDF primero.'
      );
    }
  }

  /**
   * Limpia y normaliza el texto extraído
   * @param {string} text - Texto a limpiar
   * @returns {string} Texto limpio
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\r\n/g, '\n')           // Normalizar line breaks
      .replace(/\n{3,}/g, '\n\n')       // Reducir line breaks múltiples
      .replace(/\s+/g, ' ')             // Normalizar espacios
      .replace(/[^\S\n]+/g, ' ')        // Limpiar espacios extra
      .trim();
  }

  /**
   * Analiza la estructura del documento y extrae título y secciones
   * @param {string} text - Texto a analizar
   * @returns {Object} Información de la estructura
   */
  analyzeStructure(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const structure = {
      title: null,
      sections: [],
      hasHeadings: false,
      hasBulletPoints: false,
      hasNumberedLists: false,
      estimatedSections: 0,
      wordCount: text.split(/\s+/).length
    };
    
    // Extraer título del documento (primera línea significativa que parezca título)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Título: línea corta, no termina en punto, palabras capitalizadas
      if (this.looksLikeTitle(line) && line.length < 100 && line.length > 5) {
        structure.title = line;
        break;
      }
    }
    
    let currentSection = null;
    
    lines.forEach((line, index) => {
      // Detectar títulos/encabezados de secciones
      if (this.looksLikeHeading(line) && line.length < 100) {
        structure.hasHeadings = true;
        structure.estimatedSections++;
        
        // Guardar sección anterior si existe
        if (currentSection) {
          structure.sections.push(currentSection);
        }
        
        // Crear nueva sección
        currentSection = {
          title: line,
          startLine: index,
          content: []
        };
      } else if (currentSection) {
        // Agregar contenido a la sección actual
        currentSection.content.push(line);
      }
      
      // Detectar listas con bullets
      if (/^[\-\*•●]/.test(line)) {
        structure.hasBulletPoints = true;
      }
      
      // Detectar listas numeradas
      if (/^\d+[\.\)]/.test(line)) {
        structure.hasNumberedLists = true;
      }
    });
    
    // Agregar última sección
    if (currentSection) {
      structure.sections.push(currentSection);
    }
    
    // Si no se detectaron secciones pero hay títulos, dividir por párrafos largos
    if (structure.sections.length === 0 && text.length > 500) {
      const paragraphs = text.split(/\n\n+/);
      paragraphs.forEach((para, idx) => {
        if (para.trim().length > 100) {
          structure.sections.push({
            title: `Sección ${idx + 1}`,
            content: [para.trim()]
          });
        }
      });
    }
    
    return structure;
  }

  /**
   * Determina si una línea parece ser un título
   */
  looksLikeTitle(line) {
    // Título principal: primera línea significativa, no termina en punto
    return (
      line.length > 5 &&
      line.length < 100 &&
      !line.endsWith('.') &&
      !line.endsWith(',') &&
      !line.endsWith(';') &&
      // Primera palabra capitalizada
      /^[A-ZÁÉÍÓÚÑa-záéíóúñ]/.test(line)
    );
  }

  /**
   * Determina si una línea parece ser un encabezado de sección
   */
  looksLikeHeading(line) {
    // 🚀 MEJORA: Detección más estricta para evitar falsos positivos
    
    // Encabezados numerados claros (1., 2., 1.1, etc)
    const isNumberedHeading = /^(\d+\.|\d+\)|\d+\.\d+\.?|\d+\s+[-–—])/.test(line);
    if (isNumberedHeading && line.length < 100) {
      return true;
    }

    // Encabezados cortos y capitalizados (muy estricto)
    const isShortAndCapitalized = (
      line.length > 5 &&          // Mínimo 5 caracteres
      line.length < 60 &&         // Máximo 60 (antes era 80)
      !line.endsWith('.') &&
      !line.endsWith(',') &&
      !line.endsWith(';') &&
      /^[A-ZÁÉÍÓÚÑ0-9]/.test(line)
    );
    
    // Debe tener al menos 2 palabras capitalizadas (no solo una)
    const capitalWords = (line.match(/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/g) || []).length;
    const hasMultipleCapitalWords = capitalWords >= 2;
    
    // Solo considerar encabezado si cumple ambas condiciones
    return isShortAndCapitalized && hasMultipleCapitalWords;
  }

  /**
   * Divide el texto en chunks manejables para la IA
   * @param {string} text - Texto a dividir
   * @param {number} maxChunkSize - Tamaño máximo del chunk en tokens aproximados
   * @returns {Array<string>} Array de chunks de texto
   */
  chunkText(text, maxChunkSize = 3000) {
    // Aproximación: 1 token ≈ 4 caracteres
    const maxChars = maxChunkSize * 4;
    
    if (text.length <= maxChars) {
      return [text];
    }
    
    const chunks = [];
    const paragraphs = text.split('\n\n');
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      // Si agregar este párrafo excedería el límite
      if ((currentChunk + paragraph).length > maxChars) {
        // Guardar el chunk actual si tiene contenido
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        
        // Si el párrafo mismo es muy grande, dividirlo
        if (paragraph.length > maxChars) {
          const sentences = paragraph.split(/[.!?]+/);
          let sentenceChunk = '';
          
          for (const sentence of sentences) {
            if ((sentenceChunk + sentence).length > maxChars) {
              if (sentenceChunk.trim()) {
                chunks.push(sentenceChunk.trim());
              }
              sentenceChunk = sentence;
            } else {
              sentenceChunk += sentence + '. ';
            }
          }
          
          currentChunk = sentenceChunk;
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    // Agregar el último chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Calcula el tiempo estimado de procesamiento
   * @param {number} bufferSize - Tamaño del buffer en bytes
   * @param {number} chunkCount - Número de chunks
   * @returns {Object} Tiempo estimado en minutos
   */
  estimateProcessingTime(bufferSize, chunkCount) {
    const sizeMB = bufferSize / (1024 * 1024);
    
    // Estimación base por tamaño
    let estimatedMinutes = 2; // Base: 2 minutos
    
    if (sizeMB < 1) {
      estimatedMinutes = 1;
    } else if (sizeMB < 2) {
      estimatedMinutes = 2;
    } else if (sizeMB < 3) {
      estimatedMinutes = 2.5;
    } else {
      estimatedMinutes = 3;
    }
    
    // Ajustar por número de chunks (procesamiento de IA)
    estimatedMinutes += chunkCount * 0.3;
    
    return {
      min: Math.floor(estimatedMinutes),
      max: Math.ceil(estimatedMinutes + 1),
      message: `${Math.floor(estimatedMinutes)}-${Math.ceil(estimatedMinutes + 1)} minutos`
    };
  }
}

export const documentParserService = new DocumentParserService();

