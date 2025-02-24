import React, { useState, useEffect } from 'react';
import './DodiChatbot.scss';


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
    const [requirePaymentProof, setRequirePaymentProof] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    // Estados para almacenar los textos generados
    const [planeacionTexto, setPlaneacionTexto] = useState('');
    const [herramientasEvaluacionTexto, setHerramientasEvaluacionTexto] = useState('');
    const [isPDFReady, setIsPDFReady] = useState(false); 
    const [showDownloadModal, setShowDownloadModal] = useState(false);




    const chatBox = React.createRef();

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
        setSelectedPaymentOption(null);
        setShowPaymentDetails(false);
        addMessage("Dodi", "¡Hola! ¿En qué puedo ayudarte hoy?");
    };

    const descargarPDF = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planeacion: planeacionTexto,
                    herramientasEvaluacion: herramientasEvaluacionTexto,
                }),
            });
    
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
    

    const enviarDatosPlanAlServidor = async () => {
        const prompt1 = `
    Actúa como un docente experto en planeación y proyectos interdisciplinarios. Realiza un proyecto para el nivel y grado: ${responses['Nivel y grado educativo']}, que incluya la situación problema: ${responses['Situación problema']}, y use la estrategia didáctica seleccionada: ${responses['Estrategia didáctica']}. Además, considera los campos formativos: ${responses['Campos formativos']}, los PDA: ${responses['PDA']}, los ejes articuladores: ${responses['Ejes articuladores']}, y los rasgos del perfil de egreso: ${responses['Rasgos del perfil de egreso']}. 
    
    El proyecto debe durar exactamente ${responses['Duración en semanas']} semanas, con 5 días de actividades detalladas por cada semana. **Cada día incluirá exactamente ${responses['Cantidad de actividades diarias']} actividades**, sin excepción ni variación en el número. Asegúrate de que todas las actividades sean claras, prácticas y alineadas con los objetivos, la estrategia didáctica seleccionada, y que integren los PDA, ejes articuladores, y rasgos del perfil de egreso relevantes en cada actividad diaria.

    Estructura el contenido para que se presente claramente en formato semanal, y dentro de cada semana describe cada día por separado con las actividades correspondientes, usando la estructura solicitada.

    El formato esperado es:
    
    ## Semana X:
    - **Día 1: Nombre de la actividad** - Descripción de la actividad que alinee con ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        1. Actividad 1: Descripción breve que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        2. Actividad 2: Descripción breve que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        3. ...(hasta ${responses['Cantidad de actividades diarias']} actividades)
    - **Día 2: Nombre de la actividad** - Descripción de la actividad.
        1. Actividad 1: Descripción breve que integre ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
        2. ...(hasta ${responses['Cantidad de actividades diarias']} actividades)
    - ... (hasta 5 días por semana)

    Al final del proyecto, agrega una breve reflexión o conclusión sobre el impacto esperado del proyecto en los estudiantes, considerando el desarrollo de competencias alineadas con ${responses['PDA']}, ${responses['Ejes articuladores']}, y ${responses['Rasgos del perfil de egreso']}.
`;
        try {
            // Primer prompt para obtener el texto del proyecto
            const response1 = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt1 }),
            });
    
            if (!response1.ok) {
                throw new Error('Error al enviar el primer prompt');
            }
    
            const data1 = await response1.json();
            setPlaneacionTexto(data1.data); // Almacenar el texto de planeación en el estado
    
            // Segundo prompt para obtener la rúbrica de evaluación
            const prompt2 = `Dame una rúbrica de evaluación en formato JSON para el proyecto que me diste: "${data1.data}". Incluye 5 criterios de exigencia, cada uno con 4 niveles de cumplimiento ("regular", "bien", "muy bien" y "excelente"). El formato debe ser un array de objetos JSON como: [{"criterio": "Nombre del criterio", "regular": "Descripción regular", "bien": "Descripción bien", "muyBien": "Descripción muy bien", "excelente": "Descripción excelente"}] y que cada descripción tenga menos de 20 palabras.`;
    
            const response2 = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt2 }),
            });
    
            if (!response2.ok) {
                throw new Error('Error al enviar el segundo prompt');
            }
    
            const data2 = await response2.json();
            
            // Limpia el texto del formato adicional antes de usarlo directamente como texto
            const cleanedData = data2.data.replace(/```json|```/g, '');  // Elimina los delimitadores de bloque de código
            
            setHerramientasEvaluacionTexto(cleanedData); // Almacenar el texto de la rúbrica como string sin parsearlo
            
            // Habilitar el botón de descarga
            setIsPDFReady(true);
    
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

    const openPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedPaymentOption(null);
        setShowPaymentDetails(false);
    };

    const selectPaymentOption = (option) => {
        setSelectedPaymentOption(option);
        setShowPaymentDetails(true);
    };

    const sendMessage = async (selectedOption = null) => {
        const inputToSend = selectedOption ? selectedOption : userInput.trim();
        if (!inputToSend) return;

        addMessage("Usuario", inputToSend);
        const newResponses = { ...responses };

        if (step === 0) {
            if (inputToSend.toLowerCase() === "probar mis planeaciones gratis") {
                if (freePlanCount >= 2) {
                    addMessage("Dodi", "Lo siento, ya has usado tus 2 planeaciones gratuitas. Suscríbete o paga por cada planeación.");
                    setShowButtons(true);
                    return;
                }
                updateFreePlanCount();
                setShowButtons(false);
                addMessage("Dodi", "Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').");
                setStep(1);
            } else if (inputToSend.toLowerCase() === "subscribirme o pagar por cada planeación") {
                setShowButtons(false);
                openPaymentModal();
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
                newResponses["Duración en semanas"] = weeks.toString();  // Convertir a string para enviar correctamente
                setResponses(newResponses); 
                addMessage("Dodi", "¿Cuántas actividades diarias se realizarán (número de 1 a 5)?");
                setStep(9);
            } else {
                addMessage("Dodi", "Por favor ingresa un número de semanas válido entre 2 y 6.");
            }
        }
        
        else if (step === 9) {
            const activities = parseInt(inputToSend, 10);
            if (!isNaN(activities) && activities >= 1 && activities <= 5) {
                newResponses["Cantidad de actividades diarias"] = activities.toString();  // Convertir a string para enviar correctamente
                setResponses(newResponses); 
                addMessage("Dodi", "Por favor, ingresa tu número de WhatsApp para enviarte la planeación.");
                setStep(10);
            } else {
                addMessage("Dodi", "Por favor ingresa un número de actividades válido entre 1 y 5.");
            }
        }
        else if (step === 10) {
            const whatsappRegex = /^\d{10}$/;
            if (whatsappRegex.test(inputToSend)) {
                newResponses["WhatsApp"] = inputToSend;
                setResponses(newResponses); 
                addMessage("Dodi", "Gracias. Ahora, por favor ingresa tu correo electrónico.");
                setStep(11);
            } else {
                addMessage("Dodi", "El número de WhatsApp debe tener 10 dígitos. Por favor, ingresa un número válido.");
            }
        }  else if (step === 11) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (emailRegex.test(inputToSend)) {
                setResponses((prevResponses) => {
                    const updatedResponses = {
                        ...prevResponses,
                        correo: inputToSend // Usamos el nombre 'correo' en minúsculas para que coincida con el backend
                    };
        
                    // Esta función enviará los datos al servidor con o sin comprobante
                    const enviarDatosAlServidor = async (file = null) => {
                        const formData = new FormData();
                        
                        if (file) {
                            formData.append('comprobante', file); // Agregar el archivo si está presente
                        }
                        formData.append('nivelGrado', updatedResponses['Nivel y grado educativo']);
                        formData.append('situacionProblema', updatedResponses['Situación problema']);
                        formData.append('estrategiaDidactica', updatedResponses['Estrategia didáctica']);
                        formData.append('camposFormativos', updatedResponses['Campos formativos']);
                        formData.append('PDA', updatedResponses['PDA']);
                        formData.append('ejesArticuladores', updatedResponses['Ejes articuladores']);
                        formData.append('rasgosPerfilEgreso', updatedResponses['Rasgos del perfil de egreso']);
                        formData.append('duracionSemanas', Number(updatedResponses['Duración en semanas']));
                        formData.append('actividadesDiarias', Number(updatedResponses['Cantidad de actividades diarias']));
                        formData.append('whatsapp', updatedResponses['WhatsApp']);
                        formData.append('correo', updatedResponses['correo']);

                        for (let [key, value] of formData.entries()) { 
                            console.log(key, value);
                        }

                        try {
                            const response = await fetch('http://localhost:3001/api/save', {
                                method: 'POST',
                                body: formData,
                            });
                    
                            if (!response.ok) throw new Error('Error al enviar los datos');
                    
                            const data = await response.json();
                            console.log('Respuesta del servidor:', data);
                        } catch (error) {
                            console.error('Error al subir datos al servidor:', error);
                        }
                    };
                    
                    setResponses(updatedResponses);

        
        
                    if (requirePaymentProof) {
                        addMessage("Dodi", "Gracias. Ahora, por favor sube una foto de tu comprobante de pago en formato PNG, JPG . (solo archivos de Maximo 10 Mb)");
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                sender: "Dodi",
                                message: (
                                    <div className="file-upload">
                                        <input
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.pdf"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    addMessage("Usuario", `Comprobante de pago subido: ${file.name}`);
        
                                                    // Enviar los datos junto con el comprobante
                                                    await enviarDatosAlServidor(file);
                                                    enviarDatosPlanAlServidor(); // Enviar el prompt concatenado al backend
                                                    setStep(13);
                                                    addMessage("Dodi", "¡Gracias! Generando tu planeación...");
                                                }
                                            }}
                                        />
                                        <p className="file-upload-instructions">Formatos permitidos: PNG, JPG, PDF.</p>
                                    </div>
                                )
                            }
                        ]);
                    } else {
                        // Si no se requiere comprobante, enviar los datos directamente
                        enviarDatosAlServidor(null);
                        setStep(13);
                        addMessage("Dodi", "¡Gracias! Hemos recibido tu solicitud. Te enviaremos la planeación en las próximas 2 horas.");
                    }
        
                    return updatedResponses; // Retornamos el nuevo estado de responses
                });
            } else {
                addMessage("Dodi", "El correo electrónico ingresado no es válido. Por favor, ingresa un correo electrónico válido.");
            }
        }
        
        
        
        setResponses(newResponses);
        setUserInput('');
    };

    const addMessage = (sender, message) => {
        setMessages((prevMessages) => [...prevMessages, { sender, message }]);
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
            <div className="chat-box" ref={chatBox}>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === "Dodi" ? "bot-message" : "user-message"}>
                        {msg.message}
                    </div>
                ))}

                {isModalActive && (
                    <div className="modal active" onClick={closeModal}>
                        <span className="close-button" onClick={closeModal}>&times;</span>
                        <img src={selectedImage} alt="Zoomed" className="modal-content" />
                    </div>
                )}

                {showButtons && (
                    <>
                        <button className="large-option-button" onClick={() => sendMessage("Probar mis planeaciones gratis")}>Probar mis planeaciones gratis</button>
                        <button onClick={() => sendMessage("Subscribirme o pagar por cada planeación")} className="large-option-button">
                            Subscribirme o pagar por cada planeación
                        </button>
                    </>
                )}

                {showPaymentModal && (
                    <div className="modal active">
                        <div className="modal-content">
                            <h3>Información de Pago</h3>
                            <div className="payment-info">
                                <p>Realiza tu pago en OXXO al número de tarjeta: 4217 4700 2877 4202</p>
                                <p>O transferencia al número de CLABE:</p>
                                <p>646010146401739026</p>
                                <p>Banco STP a nombre de Cesar Alberto Velásquez Ríos</p>
                                <p>Precios:</p>
                                <ul>
                                    <li>1 Planeación: $25 MXN</li>
                                    <li>3 Planeaciones: $50 MXN</li>
                                </ul>
                                <p> (Al finalizar te pediremos una foto del comprobante de pago, favor de tenerlo a la mano)</p>
                            </div>
                            <button className="continue-button" onClick={() => {
                                setShowPaymentModal(false);
                                setShowButtons(false);
                                setRequirePaymentProof(true);
                                addMessage("Dodi", "Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').");
                                setStep(1);
                            }}>Continuar al chat</button>
                            <button className="close-button" onClick={closePaymentModal}>Cerrar</button>
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
                        <button className={`option-button ${selectedCampos.includes('Lenguaje') ? 'selected' : ''}`} onClick={() => toggleCampo('Lenguaje')}>Lenguaje</button>
                        <button className={`option-button ${selectedCampos.includes('Saberes y pensamiento científico') ? 'selected' : ''}`} onClick={() => toggleCampo('Saberes y pensamiento científico')}>Saberes y pensamiento científico</button>
                        <button className={`option-button ${selectedCampos.includes('Ética, naturaleza y sociedades') ? 'selected' : ''}`} onClick={() => toggleCampo('Ética, naturaleza y sociedades')}>Ética, naturaleza y sociedades</button>
                        <button className={`option-button ${selectedCampos.includes('De lo humano y lo comunitario') ? 'selected' : ''}`} onClick={() => toggleCampo('De lo humano y lo comunitario')}>De lo humano y lo comunitario</button>
                        <button className="send-button" onClick={sendCampos}>Enviar</button>
                    </div>
                )}

                {!showButtons && step !== 3 && step !== 4 && (
                    <>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Escribe tu respuesta aquí..."
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            value={userInput}
                        />
                        <button className="send-button" onClick={() => sendMessage()}>Enviar</button>
                    </>
                )}
            </div>
        
            <button className="reset-button" onClick={resetChat}>Reiniciar Chat</button>

            <div>
        {/* Otros elementos del chat */}

        {/* Botón de descarga PDF, visible cuando el PDF está listo */}
        {isPDFReady && (
            <button onClick={() => descargarPDF()}>
                Descargar Planeación y Evaluación en PDF
            </button>
        )}
    </div>
        </div>
    );
};

export default DodiChatbot;
