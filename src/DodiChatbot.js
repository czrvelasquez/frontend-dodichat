import React, { useState, useEffect } from 'react';
import './DodiChatbot.scss';
import PaymentOptions from './paymentOptions';

const DodiChatbot = () => {
  const [step, setStep] = useState(0);
  const [freePlanCount, setFreePlanCount] = useState(0);
  const [showButtons, setShowButtons] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState({});
  const [selectedCampos, setSelectedCampos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalActive, setIsModalActive] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Modal content: "auth" para iniciar sesión/crear cuenta o "payment" para suscripción
  const [paymentModalContent, setPaymentModalContent] = useState("auth");

  // Estados para los textos generados
  const [planeacionTexto, setPlaneacionTexto] = useState('');
  const [herramientasEvaluacionTexto, setHerramientasEvaluacionTexto] = useState('');
  const [isPDFReady, setIsPDFReady] = useState(false);
  // Estado para diferenciar usuario autenticado (premium) o libre
  const [isPremium, setIsPremium] = useState(false);
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

  const chatBox = React.createRef();

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
    setStep(0);
    setShowButtons(true);
    setUserInput('');
    setMessages([]);
    setResponses({});
    setSelectedCampos([]);
    setSelectedImage(null);
    setIsModalActive(false);
    setShowPaymentModal(false);
    addMessage("Dodi", "¡Hola! ¿En qué puedo ayudarte hoy?");
  };

  // Funciones de descarga con token en headers
  const descargarPDF = async (planeacion, herramientas) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/generate-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planeacion, herramientasEvaluacion: herramientas }),
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
      const response = await fetch('http://localhost:3001/api/generate-docx', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planeacion, herramientasEvaluacion: herramientas }),
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

  // Función para enviar datos al servidor
  const enviarDatosPlanAlServidor = async () => {
    const token = localStorage.getItem('token');
    const prompt1 = `
    Actúa como un docente experto en planeación y proyectos interdisciplinarios. Realiza un proyecto para el nivel y grado: ${responses['Nivel y grado educativo']}, que incluya la situación problema: ${responses['Situación problema']}, y use la estrategia didáctica seleccionada: ${responses['Estrategia didáctica']}. Además, considera los campos formativos: ${responses['Campos formativos']}, los PDA: ${responses['PDA']}, los ejes articuladores: ${responses['Ejes articuladores']}, y los rasgos del perfil de egreso: ${responses['Rasgos del perfil de egreso']}.
    
    El proyecto debe durar exactamente ${responses['Duración en semanas']} semanas, con 5 días de actividades detalladas por cada semana. **Cada día incluirá exactamente ${responses['Cantidad de actividades diarias']} actividades**, sin excepción ni variación en el número. Asegúrate de que todas las actividades sean claras, prácticas y alineadas con los objetivos, la estrategia didáctica seleccionada, y que integren los PDA, ejes articuladores, y rasgos del perfil de egreso relevantes en cada actividad diaria.
    
    Estructura el contenido para que se presente claramente en formato semanal, y dentro de cada semana describe cada día por separado con las actividades correspondientes, usando la siguiente estructura:
    
    ## Semana X:
    - **Día 1: Nombre de la actividad** - Descripción de la actividad que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        1. Actividad 1: Descripción breve que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        2. Actividad 2: Descripción breve que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        3. ...(hasta ${responses['Cantidad de actividades diarias']} actividades)
    - **Día 2: Nombre de la actividad** - Descripción de la actividad.
        1. Actividad 1: Descripción breve que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        2. ...(hasta ${responses['Cantidad de actividades diarias']} actividades)
    - ... (hasta 5 días por semana)
    Repite esto por todas las semanas, especificando todas las actividades detalladas de cada día.
    `;
    try {
      const response1 = await fetch('http://localhost:3001/api/generate', {
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
      const response2 = await fetch('http://localhost:3001/api/generate', {
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

  // openPaymentModal acepta un parámetro para determinar el contenido a mostrar ("auth" o "payment")
  const openPaymentModal = (content = "auth") => {
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

  // Función para cerrar sesión: elimina token, username y reinicia el estado
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsPremium(false);
    resetChat();
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
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          whatsapp: registerWhatsapp,
          password: registerPassword,
        }),
      });
      if (!response.ok) {
        throw new Error("Error en el registro");
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', registerName);
      setIsPremium(true);
      setShowPaymentModal(false);
      setShowButtons(false);
      addMessage("Dodi", `¡Cuenta creada exitosamente, ${registerName}! Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').`);
      setStep(1);
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
      const response = await fetch('http://localhost:3001/api/login', {
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
      localStorage.setItem('token', data.token);
      const username = localStorage.getItem('username') || loginEmail;
      setIsPremium(true);
      setShowPaymentModal(false);
      setShowButtons(false);
      addMessage("Dodi", `¡Bienvenido de nuevo, ${username}! Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').`);
      setStep(1);
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
        if (freePlanCount >= 2) {
          if (isPremium) {
            openPaymentModal("payment");
          } else {
            openPaymentModal("auth");
          }
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
      newResponses["Estrategia didáctica"] = inputToSend;
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
          <img
            src="https://i.ibb.co/tqgsRcr/ejes-articuladores.png"
            alt="Ejes articuladores"
            className="image-style"
            onClick={() => openModal("https://i.ibb.co/tqgsRcr/ejes-articuladores.png")}
            style={{ cursor: 'pointer' }}
          />
        </>
      ));
      setStep(6);
    } else if (step === 6) {
      newResponses["Ejes articuladores"] = inputToSend;
      setResponses(newResponses);
      addMessage("Dodi", (
        <>
          Selecciona los rasgos del perfil de egreso.
          <br />
          <img
            src="https://i.ibb.co/V998pDq/rasgos-del-perfil-de-egreso.png"
            alt="Rasgos del perfil de egreso"
            className="image-style"
            onClick={() => openModal("https://i.ibb.co/V998pDq/rasgos-del-perfil-de-egreso.png")}
            style={{ cursor: 'pointer' }}
          />
        </>
      ));
      setStep(7);
    } else if (step === 7) {
      newResponses["Rasgos del perfil de egreso"] = inputToSend;
      setResponses(newResponses);
      addMessage("Dodi", "¿Cuál es la duración del proyecto en semanas (de 2 a 6 semanas)?");
      setStep(8);
    } else if (step === 8) {
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
        if (isPremium) {
          setUserInput('');
          setMessages([]);
          addMessage("Dodi", (
            <div style={{ textAlign: 'center' }}>
              <img 
                src="https://i.ibb.co/x1nL93H/generating.gif" 
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
        } else {
          addMessage("Dodi", "Por favor, ingresa tu número de WhatsApp para enviarte la planeación.");
          setStep(10);
        }
      } else {
        addMessage("Dodi", "Por favor ingresa un número de actividades válido entre 1 y 5.");
      }
    } else if (step === 10 && !isPremium) {
      const whatsappRegex = /^\d{10}$/;
      if (whatsappRegex.test(inputToSend)) {
        newResponses["WhatsApp"] = inputToSend;
        setResponses(newResponses);
        addMessage("Dodi", "Gracias. Ahora, por favor ingresa tu correo electrónico.");
        setStep(11);
      } else {
        addMessage("Dodi", "El número de WhatsApp debe tener 10 dígitos. Por favor, ingresa un número válido.");
      }
    } else if (step === 11 && !isPremium) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(inputToSend)) {
        setResponses(prev => ({ ...prev, correo: inputToSend }));
        setUserInput('');
        setMessages([]);
        addMessage("Dodi", (
          <div style={{ textAlign: 'center' }}>
            <img 
              src="https://i.ibb.co/x1nL93H/generating.gif" 
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
            await descargarPDF(result.planeacion, result.herramientas);
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

  return (
    <div className="chat-container">
      <img src="https://i.ibb.co/vL7vsyR/dodi.png" alt="Dodi Avatar" className="dodi-avatar" />
      <h2>Dodi - Asistente de Planeación</h2>
      {/* Botón de cerrar sesión visible cuando el usuario está autenticado */}
      {isPremium && (
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      )}
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

        {showButtons && (
          <>
            {!isPremium && (
              <button className="large-option-button" onClick={() => sendMessage("Probar mis planeaciones gratis")}>
                Probar mis planeaciones gratis
              </button>
            )}
            <button className="large-option-button" onClick={() => sendMessage("Subscribirme o pagar por cada planeación")}>
              Subscribirme o pagar por cada planeación
            </button>
          </>
        )}

        {showPaymentModal && (
          <div className="modal active">
            <div className="modal-content">
              {(!isPremium && freePlanCount >= 2) && (
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
                <PaymentOptions />
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

        {(!showButtons && step !== 3 && step !== 4) && (
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
          isPremium ? (
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
  );
};

export default DodiChatbot;
