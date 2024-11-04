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

    const submitDataToServer = async (file, otherData) => {
        const formData = new FormData();
        formData.append('comprobante', file); // Agrega el archivo
        formData.append('Nivel y grado educativo', otherData['Nivel y grado educativo']);
        formData.append('Situación problema', otherData['Situación problema']);
        formData.append('Estrategia didáctica', otherData['Estrategia didáctica']);
        formData.append('Campos formativos', otherData['Campos formativos']);
        formData.append('PDA', otherData['PDA']);
        formData.append('Ejes articuladores', otherData['Ejes articuladores']);
        formData.append('Perfil egreso', otherData['Perfil egreso']);
        formData.append('Duración semanas', otherData['Duración semanas']);
        formData.append('Actividades diarias', otherData['Actividades diarias']);
        formData.append('Whatsapp', otherData['Whatsapp']);
        formData.append('Correo', otherData['Correo']);
        
    
        try {
            const response = await fetch('https://chi-1.onrender.com/api/save', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) throw new Error('Error al enviar los datos');
            
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
        } catch (error) {
            console.error('Error al subir datos al servidor:', error);
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
                // Actualizamos `responses` de forma controlada
                setResponses((prevResponses) => {
                    const updatedResponses = {
                        ...prevResponses,
                        correo: inputToSend  // Usamos el nombre 'correo' en minúsculas para que coincida con el backend
                    };
        
                    if (requirePaymentProof) {
                        addMessage("Dodi", "Gracias. Ahora, por favor sube tu comprobante de pago en formato PNG, JPG o PDF.");
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
                    
                                                    // Crear y llenar el FormData
                                                    const formData = new FormData();
                                                    formData.append('comprobante', file);  // Agregar el archivo al FormData
                                                    formData.append('nivelGrado', responses['Nivel y grado educativo']);
                                                    formData.append('situacionProblema', responses['Situación problema']);
                                                    formData.append('estrategiaDidactica', responses['Estrategia didáctica']);
                                                    formData.append('camposFormativos', responses['Campos formativos']);
                                                    formData.append('PDA', responses['PDA']);
                                                    formData.append('ejesArticuladores', responses['Ejes articuladores']);
                                                    formData.append('rasgosPerfilEgreso', responses['Rasgos del perfil de egreso']);
                                                    formData.append('duracionSemanas', Number(responses['Duración en semanas']));
                                                    formData.append('actividadesDiarias', Number(responses['Cantidad de actividades diarias']));
                                                    formData.append('whatsapp', responses['WhatsApp']);
                                                    formData.append('correo', responses['correo']);
                    
                                                    // Verifica si los datos se están agregando correctamente
                                                    console.log('FormData a enviar:', {
                                                        nivelGrado: responses['Nivel y grado educativo'],
                                                        situacionProblema: responses['Situación problema'],
                                                        estrategiaDidactica: responses['Estrategia didáctica'],
                                                        camposFormativos: responses['Campos formativos'],
                                                        PDA: responses['PDA'],
                                                        ejesArticuladores: responses['Ejes articuladores'],
                                                        rasgosPerfilEgreso: responses['Rasgos del perfil de egreso'],
                                                        duracionSemanas: responses['Duración en semanas'],
                                                        actividadesDiarias: responses['Cantidad de actividades diarias'],
                                                        whatsapp: responses['WhatsApp'],
                                                        correo: responses['correo'],
                                                        comprobante: file
                                                    });
                    
                                                    // Enviar el FormData al servidor
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
                    
                                                    setStep(13);
                                                    addMessage("Dodi", "¡Gracias! Hemos recibido tu comprobante de pago. Te enviaremos la planeación en las próximas 2 horas.");
                                                }
                                            }}
                                        />
                                        <p className="file-upload-instructions">Formatos permitidos: PNG, JPG, PDF.</p>
                                    </div>
                                )
                            }
                        ]);
                    }
        
                    return updatedResponses;  // Retornamos el nuevo estado de responses
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
                                <p>Realiza tu pago en OXXO al número de tarjeta: 1234 5678 9012 3456</p>
                                <p>O directamente en el banco o transferencia al número de cuenta: 1234567890</p>
                                <p>CLABE: 012345678901234567</p>
                                <p>Precios:</p>
                                <ul>
                                    <li>1 Planeación: $50 MXN</li>
                                    <li>3 Planeaciones: $100 MXN</li>
                                </ul>
                            </div>
                            <button className="continue-button" onClick={() => {
                                setShowPaymentModal(false);
                                setShowButtons(false);
                                setRequirePaymentProof(true);
                                addMessage("Dodi", "Indica el nivel y grado educativo del proyecto (Ej: '3° de primaria').");
                                setStep(1);
                            }}>Continuar</button>
                            <button className="close-button" onClick={closePaymentModal}>Cerrar</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="button-group">
                        <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en proyectos")}>Aprendizaje basado en Proyectos</button>
                        <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en la indagación")}>Aprendizaje basado en Indagación (STEM)</button>
                        <button className="option-button" onClick={() => sendMessage("Aprendizaje basado en problemas")}>Aprendizaje basado en Problemas</button>
                        <button className="option-button" onClick={() => sendMessage("Aprendizaje servicio")}>Aprendizaje basado en Servicio</button>
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
        </div>
    );
};

export default DodiChatbot;
