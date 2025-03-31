import React, { useState, useEffect } from 'react';
import './DodiChatbot.scss';
import PaymentOptions from './paymentOptions';
import { Link } from 'react-router-dom';
import WhatsAppSupportButton from '../src/WhatsAppSupportButton';
import { jwtDecode } from "jwt-decode"; // ✅ Correcto


const DodiChatbot = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const username = localStorage.getItem('username') || '';
  const userInitial = username ? username.charAt(0).toUpperCase() : '';
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [membershipLevel, setMembershipLevel] = useState(localStorage.getItem('membershipLevel') || 'free');
  const isPlusOrPremium = membershipLevel === 'plus' || membershipLevel === 'premium';  
  const [showButtons, setShowButtons] = useState(!localStorage.getItem('token'));
  const [step, setStep] = useState(0);
  const [freePlanCount, setFreePlanCount] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState({});
  const [selectedCampos, setSelectedCampos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalActive, setIsModalActive] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Modal content: "auth" para iniciar sesión/crear cuenta o "payment" para suscripción
  const [paymentModalContent, setPaymentModalContent] = useState("auth");
  const [registerEstado, setRegisterEstado] = useState('');
  // Estados para los textos generados
  const [planeacionTexto, setPlaneacionTexto] = useState('');
  const [herramientasEvaluacionTexto, setHerramientasEvaluacionTexto] = useState('');
  const [isPDFReady, setIsPDFReady] = useState(false);
  // Estado para diferenciar usuario autenticado (premium) o libre
  // Estados para autenticación
  const [authMode, setAuthMode] = useState("");
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerConfirmEmail, setRegisterConfirmEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerWhatsapp, setRegisterWhatsapp] = useState('');
  const [registerTermsAccepted, setRegisterTermsAccepted] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [selectedEjes, setSelectedEjes] = useState([]);
  const [selectedRasgos, setSelectedRasgos] = useState([]);
  const isFreeLoggedIn = isLoggedIn && membershipLevel === 'free';


  const chatBox = React.createRef();

  const descripcionRasgos = {
    "Ciudadanía y derechos": "Reconocer los derechos ciudadanos y oponerse a la injusticia y discriminación ",
    "Diversidad y equidad de género": "Valorar la diversidad y reconocer la igualdad de género",
    "Autoestima y desarrollo personal": "Valorar las propias capacidades y poseer conocimiento de sí mismo ",
    "Pensamiento crítico": "Desarrollar el pensamiento crítico a partir de análisis, reflexión, diálogo, conciencia histórica, humanismo y argumentación fundada ",
    "Uso de diversos lenguajes": "Intercambiar ideas mediante diferentes lenguajes ",
    "Valoración de las ciencias y humanidades": "Desarrollar el pensamiento crítico que les permita valorar los conocimientos y saberes de las ciencias y humanidades ",
    "Correlación entre el bienestar personal y el del medio ambiente": "Cuidar el cuerpo y evitar conductas de riesgo ",
    "Interpretar fenómenos de manera científica": " Interpretar fenómenos, hechos y situaciones históricas, culturales, naturales y sociales",
    "Interactuar con respeto a la diversidad": "Respetar la diversidad cultural, étnica, lingüística y de género ",
    "Emplear las habilidades digitales": "Emplear las habilidades digitales de forma pertinente "
  };

  // Al cargar, establecemos freePlanCount.
  useEffect(() => {
    const savedCount = localStorage.getItem('freePlanCount') || 0;
    setFreePlanCount(parseInt(savedCount, 10));
  }, []);

  const updateFreePlanCount = () => {
    const newCount = freePlanCount + 1;
    setFreePlanCount(newCount);
    localStorage.setItem('freePlanCount', newCount);
  };

  const resetChat = () => {
    setUserInput('');
    setMessages([]);
    setResponses({});
    setSelectedCampos([]);
    setSelectedImage(null);
    setIsModalActive(false);
    setShowPaymentModal(false);
    setAuthMode('');
    setPlaneacionTexto('');
    setHerramientasEvaluacionTexto('');
    setIsPDFReady(false);
  
    const membership = localStorage.getItem('membershipLevel') || 'free';
    setMembershipLevel(membership);
  
    const isPlusOrPremium = membership === 'plus' || membership === 'premium';
    const isFreeLoggedIn = isLoggedIn && membership === 'free';
    
    
    // Mostrar botones solo si NO ha iniciado sesión
    setShowButtons(!isLoggedIn);
    
    if (isPlusOrPremium || isFreeLoggedIn) {
      setStep(1);
      addMessage("Dodi", "Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').");
    } else {
      setStep(0);
      addMessage("Dodi", "¡Hola! ¿En qué puedo ayudarte hoy?");
    }}

    const handleLogout = () => {
      localStorage.clear();
      window.location.reload(); // O puedes redirigir con navigate si usas react-router
    };
  

  // Funciones de descarga con token en headers
  const descargarPDF = async (planeacion, herramientas) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backend-dodichat.onrender.com/api/generate-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planeacion,
          herramientasEvaluacion: herramientas,
          gradoEscolar: responses['Nivel y grado educativo'] || '',
          campoFormativo: responses['Campos formativos'] || '',
          estrategiaDidactica: responses['Estrategia didáctica'] || '',
          estadoUsuario: localStorage.getItem('estado') || '', // si guardaste el estado ahí
        }),
      });
      if (response.status === 403) {
        openPaymentModal("payment");
        return;
      }
      if (!response.ok) {
        throw new Error('Error al generar el PDF en el servidor.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Planeacion_y_Evaluacion.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('Hubo un problema al generar el archivo PDF. Intente de nuevo.');
    }
  };

  const descargarDOCX = async (planeacion, herramientas) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backend-dodichat.onrender.com/api/generate-docx', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planeacion,
          herramientasEvaluacion: herramientas,
          gradoEscolar: responses['Nivel y grado educativo'] || '',
          campoFormativo: responses['Campos formativos'] || '',
          estrategiaDidactica: responses['Estrategia didáctica'] || '',
          estadoUsuario: localStorage.getItem('estado') || '', // si guardaste el estado ahí
        }),
      });
      if (response.status === 403) {
        openPaymentModal("payment");
        return;
      }
      if (!response.ok) {
        throw new Error('Error al generar el DOCX en el servidor.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Planeacion_y_Evaluacion.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el DOCX:', error);
      alert('Hubo un problema al generar el archivo DOCX. Intente de nuevo.');
    }
  };

  // Envía los datos al servidor para generar la planeación y la rúbrica
  const enviarDatosPlanAlServidor = async () => {
    const token = localStorage.getItem('token');
    const prompt1 = `
Actúa como un docente experto en planeación y proyectos interdisciplinarios. Realiza un proyecto para el nivel y grado: ${responses['Nivel y grado educativo']}, que incluya la situación problema: ${responses['Situación problema']}, y use la estrategia didáctica seleccionada: ${responses['Estrategia didáctica']}. Además, considera los campos formativos: ${responses['Campos formativos']}, los PDA: ${responses['PDA']}, los ejes articuladores: ${responses['Ejes articuladores']}, y los rasgos del perfil de egreso: ${responses['Rasgos del perfil de egreso']}.

El proyecto debe durar exactamente ${responses['Duración en semanas']} semanas, con 5 días de actividades detalladas por semana. **Cada día debe incluir exactamente ${responses['Cantidad de actividades diarias'] || '3'} actividades**, sin excepción ni variación en el número.

Estructura el contenido de manera clara y repetitiva, semana por semana, sin omitir ninguna semana, y usando exactamente el siguiente formato:

## Semana X:
- **Día 1: Nombre de la actividad** - Descripción general.
  1. Actividad 1: Descripción breve que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
  2. Actividad 2: ...
  3. ...(hasta ${responses['Cantidad de actividades diarias'] || '3'} actividades)
- **Día 2: Nombre de la actividad** - Descripción general.
  1. Actividad 1: ...
  2. ...
  3. ...
- ...
- **Día 5: Nombre de la actividad** - Descripción general.
  1. Actividad 1: ...
  2. ...
  3. ...

⚠️ **No se permite resumir semanas ni decir frases como "formato similar" o "igual que la semana anterior".** Cada semana debe estar completamente escrita con sus cinco días y todas sus actividades. No omitas ni acortes ninguna semana, incluso si la respuesta es extensa.

🔁 Repite este mismo formato para cada una de las ${responses['Duración en semanas']} semanas. Es muy importante que se escriba todo, especialmente las semanas 2, 3, 4, etc., sin saltos ni resúmenes.
`;

    try {
      const response1 = await fetch('https://backend-dodichat.onrender.com/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: prompt1 }),
      });
      if (!response1.ok) {
        throw new Error('Error al enviar el primer prompt');
      }
      const data1 = await response1.json();
      const planeacion = data1.data;
      setPlaneacionTexto(planeacion);
      const prompt2 = `Dame una rúbrica de evaluación en formato JSON para el proyecto que me diste: "${planeacion}". Incluye 5 criterios de exigencia, cada uno con 4 niveles de cumplimiento ("regular", "bien", "muy bien" y "excelente"). El formato debe ser un array de objetos JSON como: [{"criterio": "Nombre del criterio", "regular": "Descripción regular", "bien": "Descripción bien", "muyBien": "Descripción muy bien", "excelente": "Descripción excelente"}] y que cada descripción tenga menos de 20 palabras.`;
      const response2 = await fetch('https://backend-dodichat.onrender.com/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: prompt2 }),
      });
      if (!response2.ok) {
        throw new Error('Error al enviar el segundo prompt');
      }
      const data2 = await response2.json();
      const herramientas = data2.data.replace(/```json|```/g, '');
      setHerramientasEvaluacionTexto(herramientas);
      setIsPDFReady(true);
      return { planeacion, herramientas };
    } catch (error) {
      console.error('Error al enviar los prompts al servidor:', error);
      addMessage("Dodi", "Hubo un problema al generar los textos. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    if (chatBox.current) {
      chatBox.current.scrollTop = chatBox.current.scrollHeight;
    }
  }, [messages]);

  const openModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsModalActive(true);
  };

  const closeModal = () => {
    setIsModalActive(false);
    setSelectedImage(null);
  };

  // openPaymentModal acepta un parámetro ("auth" o "payment")
  const openPaymentModal = (content = "payment") => {
    setPaymentModalContent(content);
    setShowPaymentModal(true);
    setAuthMode("");
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setAuthMode("");
    setRegisterName('');
    setRegisterEmail('');
    setRegisterConfirmEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterWhatsapp('');
    setRegisterTermsAccepted(false);
    setLoginEmail('');
    setLoginPassword('');
  };

 

  const handleRegistration = async () => {
    if (!registerName || !registerEmail || !registerConfirmEmail || !registerWhatsapp || !registerPassword || !registerConfirmPassword) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (registerEmail !== registerConfirmEmail) {
      alert("Los correos electrónicos no coinciden.");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (!registerTermsAccepted) {
      alert("Debes aceptar los Términos y Condiciones.");
      return;
    }
  
    try {
      const response = await fetch('https://backend-dodichat.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          whatsapp: registerWhatsapp,
          password: registerPassword,
          estado: registerEstado
        }),
      });
  
      if (!response.ok) {
        throw new Error("Error en el registro");
      }
  
      const data = await response.json();
      const decoded = jwtDecode(data.token);
      const membership = decoded.membershipLevel || 'free';
  
      // Guarda todo correctamente en localStorage
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      localStorage.setItem('membershipLevel', membership);
      localStorage.setItem('username', registerName);
      localStorage.setItem('userId', decoded.userId);
  
      setMembershipLevel(membership);
      setShowPaymentModal(false);
      setShowButtons(false);
      setStep(membership === 'plus' || membership === 'premium' ? 1 : 0);
  
      addMessage("Dodi", `¡Cuenta creada exitosamente, ${registerName}! Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').`);
  
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      alert("Hubo un problema al crear tu cuenta. Inténtalo de nuevo.");
    }
  };
  

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert("Por favor, ingresa correo y contraseña.");
      return;
    }
  
    try {
      const response = await fetch('https://backend-dodichat.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Error en el login");
      }
  
      const data = await response.json();
      const token = data.token;
  
      try {
        const decoded = jwtDecode(token);
        const membership = decoded.membershipLevel || 'free';
  
        // Guardamos info útil
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        localStorage.setItem('membershipLevel', membership);
        localStorage.setItem('username', data.username || loginEmail);
        localStorage.setItem('userId', data.userId);
  
        setMembershipLevel(membership);
        setShowPaymentModal(false);
        setShowButtons(false);
        setStep(membership === 'plus' || membership === 'premium' ? 1 : 0);
  
        const username = data.username || loginEmail;
        addMessage("Dodi", `¡Bienvenido de nuevo, ${username}! Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').`);
      } catch (error) {
        console.error("Error al decodificar token:", error);
        alert("Hubo un problema con tu sesión. Intenta de nuevo.");
      }
  
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Hubo un problema al iniciar sesión. Verifica tus datos e inténtalo de nuevo.");
    }
  };
  

  const sendMessage = async (selectedOption = null) => {
    const inputToSend = selectedOption ? selectedOption : userInput.trim();
    if (!inputToSend) return;
    addMessage("Usuario", inputToSend);
    const newResponses = { ...responses };

    if (step === 0) {
      if (inputToSend.toLowerCase() === "probar mis planeaciones gratis") {
        if (!isPlusOrPremium && freePlanCount >= 2) {
          openPaymentModal("auth"); // no importa si luego paga, lo llevará al modal correcto
          return;
        }
        updateFreePlanCount();
        setShowButtons(false);
        addMessage("Dodi", "Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').");
        setStep(1);
      } else if (inputToSend.toLowerCase() === "subscribirme o pagar por cada planeación") {
        setShowButtons(false);
        openPaymentModal("auth");
      }
    } else if (step === 1) {
      const gradeRegex = /\b(\d|primero|segundo|tercero|cuarto|quinto|sexto)\b.*\b(primaria|secundaria|preescolar)\b/i;
      if (gradeRegex.test(inputToSend)) {
        newResponses["Nivel y grado educativo"] = inputToSend;
        setResponses(newResponses);
        addMessage("Dodi", "Describe brevemente la situación problema que quieres abordar en el proyecto.");
        setStep(2);
      } else {
        addMessage("Dodi", "Por favor ingresa un nivel y grado válidos, por ejemplo: '1° de primaria' o 'segundo de secundaria'.");
      }
    } else if (step === 2) {
      newResponses["Situación problema"] = inputToSend.substring(0, 200);
      setResponses(newResponses);
      addMessage("Dodi", "Selecciona la estrategia didáctica que utilizarás:");
      setStep(3);
    } else if (step === 3) {
      const estrategiaSeleccionada = selectedOption || inputToSend;
      if (!estrategiaSeleccionada) return;
  
      newResponses["Estrategia didáctica"] = estrategiaSeleccionada;
      setResponses(newResponses);
      addMessage("Dodi", (
        <>
          Selecciona los campos formativos involucrados:
          <p>Puedes seleccionar más de uno.</p>
        </>
      ));
      setStep(4);
    } else if (step === 4) {
      newResponses["Campos formativos"] = selectedCampos.join(', ');
      setResponses(newResponses);
      addMessage("Dodi", (
        <>
          Selecciona el PDA según las fases del programa sintético de la SEP.
          <br />
          <img
            src="https://i.ibb.co/9pw7hSz/pda.png"
            alt="PDA"
            className="image-style"
            onClick={() => openModal("https://i.ibb.co/9pw7hSz/pda.png")}
            style={{ cursor: 'pointer' }}
          />
          <br />
          <a href="https://drive.google.com/file/d/1VRiOZQi2VvJrZv86dcVorXDEL73wcOzr/view" target="_blank" rel="noopener noreferrer">
            Haz clic aquí para abrir el PDF y copiar el PDA.
          </a>
        </>
      ));
      setStep(5);
    } else if (step === 5) {
      newResponses["PDA"] = inputToSend.substring(0, 500);
      setResponses(newResponses);
      addMessage("Dodi", (
        <>
          Selecciona los ejes articuladores.
          <br />
        </>
      ));
      setStep(6);
    } else if (step === 6) {
      newResponses["Ejes articuladores"] = selectedEjes.join(', ');
      setResponses(newResponses);
      addMessage("Dodi", (
        <>
          Selecciona los rasgos del perfil de egreso.
          <br />
        </>
      ));
      setStep(7);
    }  else if (step === 7) {
      newResponses["Rasgos del perfil de egreso"] = selectedRasgos.join(', ');
      setResponses(newResponses);
      addMessage("Dodi", "¿Cuál es la duración del proyecto en semanas (de 2 a 6 semanas)?");
      setStep(8);
    }else if (step === 8) {
      const weeks = parseInt(inputToSend, 10);
      if (!isNaN(weeks) && weeks >= 2 && weeks <= 6) {
        newResponses["Duración en semanas"] = weeks.toString();
        setResponses(newResponses);
        addMessage("Dodi", "¿Cuántas actividades diarias se realizarán (número de 1 a 5)?");
        setStep(9);
      } else {
        addMessage("Dodi", "Por favor ingresa un número de semanas válido entre 2 y 6.");
      }
    } else if (step === 9) {
      const activities = parseInt(inputToSend, 10);
      if (!isNaN(activities) && activities >= 1 && activities <= 5) {
        newResponses["Cantidad de actividades diarias"] = activities.toString();
        setResponses(newResponses);
        if (isPlusOrPremium) {
          setUserInput('');
          setMessages([]);
          addMessage("Dodi", (
            <div style={{ textAlign: 'center' }}>
              <img 
                src="https://i.ibb.co/vL7vsyR/dodi.png" 
                alt="Generando Planeación" 
                style={{ maxWidth: '200px', marginBottom: '10px' }} 
              />
              <p>Estamos generando tu planeación. Por favor espera...</p>
            </div>
          ));
          try {
            const result = await enviarDatosPlanAlServidor();
            setStep(13);
            if (result) {
              await descargarDOCX(result.planeacion, result.herramientas);
              addMessage("Dodi", "¡Gracias! Tu planeación ha sido generada y descargada.");
            }
          } catch (error) {
            console.error("Error al descargar documento:", error);
            openPaymentModal("payment");
          }
        } else if (isFreeLoggedIn) {
          setUserInput('');
          setMessages([]);
          addMessage("Dodi", (
            <div style={{ textAlign: 'center' }}>
              <img 
                src="https://i.ibb.co/vL7vsyR/dodi.png" 
                alt="Generando Planeación" 
                style={{ maxWidth: '200px', marginBottom: '10px' }} 
              />
              <p>Estamos generando tu planeación. Por favor espera...</p>
            </div>
          ));
          try {
            if (freePlanCount >= 2) {
              openPaymentModal("payment");
              return;
            }
            updateFreePlanCount();
            const result = await enviarDatosPlanAlServidor();
            setStep(13);
            if (result) {
              await descargarDOCX(result.planeacion, result.herramientas);
              addMessage("Dodi", "¡Gracias! Tu planeación ha sido generada y descargada.");
            }
          } catch (error) {
            console.error("Error al descargar documento:", error);
            openPaymentModal("payment");
          }
        } else {
          // Solo para usuarios no logueados
          addMessage("Dodi", "Por favor, ingresa tu número de WhatsApp para enviarte la planeación.");
          setStep(10);
        }
      } else {
        addMessage("Dodi", "Por favor ingresa un número de actividades válido entre 1 y 5.");
      }
    } else if (step === 10 && !isLoggedIn) {
      const whatsappRegex = /^\d{10}$/;
      if (whatsappRegex.test(inputToSend)) {
        newResponses["WhatsApp"] = inputToSend;
        setResponses(newResponses);
        addMessage("Dodi", "Gracias. Ahora, por favor ingresa tu correo electrónico.");
        setStep(11);
      } else {
        addMessage("Dodi", "El número de WhatsApp debe tener 10 dígitos. Por favor, ingresa un número válido.");
      }
    } else if (step === 11 && !isLoggedIn) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(inputToSend)) {
        setResponses(prev => ({ ...prev, correo: inputToSend }));
        setUserInput('');
        setMessages([]);
        addMessage("Dodi", (
          <div style={{ textAlign: 'center' }}>
            <img 
              src="https://i.ibb.co/vL7vsyR/dodi.png" 
              alt="Generando Planeación" 
              style={{ maxWidth: '200px', marginBottom: '10px' }} 
            />
            <p>Estamos generando tu planeación. Por favor espera...</p>
          </div>
        ));
        try {
          const result = await enviarDatosPlanAlServidor();
          setStep(13);
          if (result) {
            if (freePlanCount >= 2) {
              openPaymentModal("payment");
              return;
            }
          
            updateFreePlanCount(); // ✅ Incrementar contador
            await descargarDOCX(result.planeacion, result.herramientas); // ✅ Debe ser DOCX para usuarios logueados, aunque sean "free"
            addMessage("Dodi", "¡Gracias! Tu planeación ha sido generada y descargada.");
          }
          
        } catch (error) {
          console.error("Error al descargar documento:", error);
          openPaymentModal("payment");
        }
      } else {
        addMessage("Dodi", "El correo electrónico ingresado no es válido. Por favor, ingresa un correo electrónico válido.");
      }
    }

    setResponses(newResponses);
    setUserInput('');
  };

  const addMessage = (sender, message) => {
    setMessages(prevMessages => [...prevMessages, { sender, message }]);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const toggleCampo = (campo) => {
    if (selectedCampos.includes(campo)) {
      setSelectedCampos(selectedCampos.filter(item => item !== campo));
    } else {
      setSelectedCampos([...selectedCampos, campo]);
    }
  };

  const sendCampos = () => {
    if (selectedCampos.length > 0) {
      sendMessage(selectedCampos.join(', '));
    } else {
      addMessage("Dodi", "Por favor, selecciona al menos un campo formativo.");
    }
  };

  const toggleEje = (eje) => {
    setSelectedEjes(prev =>
      prev.includes(eje) ? prev.filter(item => item !== eje) : [...prev, eje]
    );
  };
  
  const sendEjes = () => {
    if (selectedEjes.length > 0) {
      sendMessage(selectedEjes.join(', '));
    } else {
      addMessage("Dodi", "Por favor selecciona al menos un eje articulador.");
    }
  };

  const toggleRasgo = (rasgo) => {
    setSelectedRasgos(prev =>
      prev.includes(rasgo) ? prev.filter(item => item !== rasgo) : [...prev, rasgo]
    );
  };
  
  const sendRasgos = () => {
    if (selectedRasgos.length > 0) {
      sendMessage(selectedRasgos.join(', '));
    } else {
      addMessage("Dodi", "Selecciona al menos un rasgo del perfil de egreso.");
    }
  };

  return (
    <div className="container">

{isLoggedIn && (
  <div className="profile-icon-container">
    <div className="profile-icon" onClick={() => setShowProfileMenu(!showProfileMenu)}>
      {userInitial}
    </div>
    {showProfileMenu && (
  <div className="profile-menu">
    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
      Hola, {username}
    </div>
    <button onClick={handleLogout}>Cerrar sesión</button>
  </div>
)}
  </div>
)}

    {/* Barra de navegación con los botones */}
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <Link to="/planeaciones">
          <button className="nav-button" style={{ marginRight: '1rem' }}>
            Ir a Banco de Planeaciones
          </button>
        </Link>
        <Link to="/materiales">
          <button className="nav-button">
            Ir a Banco de Materiales
          </button>
        </Link>
      </div>

      {isLoggedIn && (
  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
    <button className="nav-button" onClick={resetChat}>
      Iniciar con una planeación nueva
    </button>
  </div>
)}



    <div className="chat-container">
      <img src="https://i.ibb.co/vL7vsyR/dodi.png" alt="Dodi Avatar" className="dodi-avatar" />
      <h2>Dodi - Asistente de Planeación</h2>      
      <div className="chat-box" ref={chatBox}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "Dodi" ? "bot-message" : "user-message"}>
            {msg.message}
          </div>
        ))}

        {isModalActive && (
          <div className="modal active" onClick={closeModal}>
            <span className="close-button" onClick={closeModal}>&times;</span>
            <img src="https://i.ibb.co/x1nL93H/generating.gif" alt="Zoomed" className="modal-content" />
          </div>
        )}

{showButtons && !isLoggedIn && (
  <>
    <button className="large-option-button" onClick={() => sendMessage("Probar mis planeaciones gratis")}>
      Probar mis planeaciones gratis
    </button>
    <button className="large-option-button" onClick={() => sendMessage("Subscribirme o pagar por cada planeación")}>
      Iniciar sesión o Registrarte
    </button>
  </>
)}


        {showPaymentModal && (
          <div className="modal active">
            <div className="modal-content">
              {(!isPlusOrPremium && freePlanCount >= 2) && (
                <p style={{ marginBottom: '10px', color: 'red', textAlign: 'center' }}>
                  Lo sentimos, ya alcanzaste tus dos usos gratuitos, por favor crea una cuenta o inicia sesión para poder seguir usando nuestro portal de planeaciones.
                </p>
              )}
              {paymentModalContent === "auth" ? (
                <>
                  {!authMode && (
                    <div className="auth-option">
                      <button className="option-button" onClick={() => setAuthMode("register")}>
                        Crear Cuenta
                      </button>
                      <button className="option-button" onClick={() => setAuthMode("login")}>
                        Iniciar Sesión
                      </button>
                    </div>
                  )}
                  {authMode === "register" ? (
                    <>
                      <div className="auth-form">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={registerName}
                          onChange={e => setRegisterName(e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Correo electrónico"
                          value={registerEmail}
                          onChange={e => setRegisterEmail(e.target.value)}
                        />
                        <select
  value={registerEstado}
  onChange={e => setRegisterEstado(e.target.value)}
>
  <option value="">Selecciona tu estado</option>
  <option value="Aguascalientes">Aguascalientes</option>
  <option value="Baja California">Baja California</option>
  <option value="Baja California Sur">Baja California Sur</option>
  <option value="Campeche">Campeche</option>
  <option value="Chiapas">Chiapas</option>
  <option value="Chihuahua">Chihuahua</option>
  <option value="CDMX">Ciudad de México</option>
  <option value="Coahuila">Coahuila</option>
  <option value="Colima">Colima</option>
  <option value="Durango">Durango</option>
  <option value="Estado de México">Estado de México</option>
  <option value="Guanajuato">Guanajuato</option>
  <option value="Guerrero">Guerrero</option>
  <option value="Hidalgo">Hidalgo</option>
  <option value="Jalisco">Jalisco</option>
  <option value="Michoacán">Michoacán</option>
  <option value="Morelos">Morelos</option>
  <option value="Nayarit">Nayarit</option>
  <option value="Nuevo León">Nuevo León</option>
  <option value="Oaxaca">Oaxaca</option>
  <option value="Puebla">Puebla</option>
  <option value="Querétaro">Querétaro</option>
  <option value="Quintana Roo">Quintana Roo</option>
  <option value="San Luis Potosí">San Luis Potosí</option>
  <option value="Sinaloa">Sinaloa</option>
  <option value="Sonora">Sonora</option>
  <option value="Tabasco">Tabasco</option>
  <option value="Tamaulipas">Tamaulipas</option>
  <option value="Tlaxcala">Tlaxcala</option>
  <option value="Veracruz">Veracruz</option>
  <option value="Yucatán">Yucatán</option>
  <option value="Zacatecas">Zacatecas</option>
</select>

                        <input
                          type="email"
                          placeholder="Confirmar correo electrónico"
                          value={registerConfirmEmail}
                          onChange={e => setRegisterConfirmEmail(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={registerPassword}
                          onChange={e => setRegisterPassword(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Confirmar Contraseña"
                          value={registerConfirmPassword}
                          onChange={e => setRegisterConfirmPassword(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Whatsapp"
                          value={registerWhatsapp}
                          onChange={e => setRegisterWhatsapp(e.target.value)}
                        />
                        <div className="terms-checkbox">
                          <input
                            type="checkbox"
                            checked={registerTermsAccepted}
                            onChange={e => setRegisterTermsAccepted(e.target.checked)}
                          />
                          <label>
                            Acepto los Términos y Condiciones de Docencia Digital
                          </label>
                        </div>
                        <button className="continue-button" onClick={handleRegistration}>
                          Crear Cuenta
                        </button>
                      </div>
                      <div className="auth-switch">
                        <p>¿Ya tienes cuenta? <button onClick={() => setAuthMode("login")}>Iniciar Sesión</button></p>
                      </div>
                    </>
                  ) : authMode === "login" ? (
                    <>
                      <div className="auth-form">
                        <input
                          type="email"
                          placeholder="Correo electrónico"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                        />
                        <button className="continue-button" onClick={handleLogin}>
                          Iniciar Sesión
                        </button>
                      </div>
                      <div className="auth-switch">
                        <p>¿No tienes cuenta? <button onClick={() => setAuthMode("register")}>Crear Cuenta</button></p>
                      </div>
                    </>
                  ) : null}
                  <button className="close-button" onClick={closePaymentModal}>Cerrar</button>
                </>
              ) : (
                <PaymentOptions onClose={closePaymentModal} />
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="button-group">
            <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en proyectos")}>Aprendizaje basado en Proyectos</button>
            <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en la indagación")}>Aprendizaje basado en Indagación (STEM)</button>
            <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en problemas")}>Aprendizaje basado en Problemas</button>
            <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en servicio")}>Aprendizaje basado en Servicio</button>
            <button className="option-button" onClick={() => sendMessage("Rincones de trabajo")}>Modalidad de Trabajo: Rincones de trabajo</button>
            <button className="option-button" onClick={() => sendMessage("Talleres críticos")}>Modalidad de Trabajo: Talleres críticos</button>
            <button className="option-button" onClick={() => sendMessage("Centros de interés")}>Modalidad de Trabajo: Centros de interés</button>
            <button className="option-button" onClick={() => sendMessage("Unidad didáctica")}>Modalidad de Trabajo: Unidad didáctica</button>
            <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en juegos")}>Aprendizaje basado en juegos</button>
          </div>
        )}

        {step === 4 && (
          <div className="button-group">
            <button className={`option-button ${selectedCampos.includes('Lenguaje') ? 'selected' : ''}`} onClick={() => toggleCampo('Lenguaje')}>
              Lenguaje
            </button>
            <button className={`option-button ${selectedCampos.includes('Saberes y pensamiento científico') ? 'selected' : ''}`} onClick={() => toggleCampo('Saberes y pensamiento científico')}>
              Saberes y pensamiento científico
            </button>
            <button className={`option-button ${selectedCampos.includes('Ética, naturaleza y sociedades') ? 'selected' : ''}`} onClick={() => toggleCampo('Ética, naturaleza y sociedades')}>
              Ética, naturaleza y sociedades
            </button>
            <button className={`option-button ${selectedCampos.includes('De lo humano y lo comunitario') ? 'selected' : ''}`} onClick={() => toggleCampo('De lo humano y lo comunitario')}>
              De lo humano y lo comunitario
            </button>
            <button className="send-button" onClick={sendCampos}>
              Enviar
            </button>
          </div>
        )}

{step === 6 && (
  <div className="button-group">
    {["Inclusión", "Pensamiento crítico", "Equidad de género", "Interculturalidad crítica", "vida saludable", "Apropiación de las Culturas", "Artes y experiencias estéticas"].map((eje, idx) => (
      <button
        key={idx}
        className={`option-button ${selectedEjes.includes(eje) ? 'selected' : ''}`}
        onClick={() => toggleEje(eje)}
      >
        {eje}
      </button>
    ))}
    <button className="send-button" onClick={sendEjes}>
      Enviar
    </button>
  </div>
)}

{step === 7 && (
  <div className="rasgos-container">
    <div className="rasgos-grid">
    {["Ciudadanía y derechos:", "Diversidad y equidad de género", "Autoestima y desarrollo persona", "Pensamiento crítico", "Uso de diversos lenguajes", "Valoración de las ciencias y humanidades", "Correlación entre el bienestar personal y el del medio ambiente", "Interpretar fenómenos de manera científica", "Interactuar con respeto a la diversidad", "Emplear las habilidades digitales"].map((rasgo, idx) => (        <div key={idx} className="rasgo-card">
          <button
            className={`option-button ${selectedRasgos.includes(rasgo) ? 'selected' : ''}`}
            onClick={() => toggleRasgo(rasgo)}
          >
            {rasgo}
          </button>
          {selectedRasgos.includes(rasgo) && (
            <div className="rasgo-descripcion">
              {descripcionRasgos[rasgo]}
            </div>
          )}
        </div>
      ))}
    </div>
    <button className="send-button" onClick={sendRasgos}>
      Enviar
    </button>
  </div>
)}



{(step >= 1 || (isLoggedIn && step === 0)) && step !== 3 && step !== 4 && step !== 6 && step !== 7 && (
  <>
    <input
      type="text"
      className="chat-input"
      placeholder="Escribe tu respuesta aquí..."
      onChange={e => setUserInput(e.target.value)}
      onKeyPress={handleKeyPress}
      value={userInput}
    />
    <button className="send-button" onClick={() => sendMessage()}>
      Enviar
    </button>
  </>
)}
      </div>

      <button className="reset-button" onClick={resetChat}>
        Reiniciar Chat
      </button>

      <div>
        {isPDFReady && (
  (isPlusOrPremium || (isLoggedIn && membershipLevel === 'free')) ? (
    <button onClick={() => descargarDOCX(planeacionTexto, herramientasEvaluacionTexto)}>
              Descargar Planeación en DOCX
            </button>
          ) : (
            <button onClick={() => descargarPDF(planeacionTexto, herramientasEvaluacionTexto)}>
              Descargar Planeación y Evaluación en PDF
            </button>
          )
        )}
      </div>
    </div>
    {localStorage.getItem("isPlusOrPremium") === "true" && <WhatsAppSupportButton />}

    </div>
  );
};

export default DodiChatbot;