import React, { useState } from 'react';

function PaymentOptions() {
  const [isLoading, setIsLoading] = useState(false);

  // Tus priceIds creados en Stripe
  const PRICE_MENSUAL = "price_1QwqYsBXXQPM9lokE7X6CwgP"; 
  const PRICE_ANUAL = "price_1QwIbABXXQPM9lokVvS2dh67";

  const handleCheckout = async (priceId) => {
    try {
      setIsLoading(true);
      // Llamas a tu backend 
      const response = await fetch("http://localhost:3001/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId })
      });
      if (!response.ok) {
        throw new Error("Error al crear la sesión de checkout");
      }
      const data = await response.json();

      // data.url es la URL de Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error al iniciar checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Elige tu Plan</h2>
      
      <button onClick={() => handleCheckout(PRICE_MENSUAL)} disabled={isLoading}>
        Suscribirme Mensual
      </button>
      <button 
        onClick={() => handleCheckout(PRICE_ANUAL)} 
        disabled={isLoading}
        style={{ marginLeft: 10 }}
      >
        Suscribirme Anual
      </button>
      
      {isLoading && <p>Procesando...</p>}
    </div>
  );
}

export default PaymentOptions;
