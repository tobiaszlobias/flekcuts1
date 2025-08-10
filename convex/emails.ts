// convex/emails.ts - Email templates

interface EmailData {
  customerName: string;
  service: string;
  date: string;
  time: string;
  customerEmail?: string;
}

interface StatusEmailData extends EmailData {
  newStatus: string;
  statusMessage: string;
}

// Email template for appointment confirmation
const appointmentConfirmation = (data: EmailData) => {
  const subject = `Potvrzení rezervace - FlekCuts`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .highlight { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✂️ FlekCuts</h1>
          <h2>Rezervace potvrzena!</h2>
        </div>
        <div class="content">
          <p>Dobrý den ${data.customerName},</p>
          
          <p>Děkujeme za vaši rezervaci. Vaše objednávka byla úspěšně potvrzena.</p>
          
          <div class="highlight">
            <h3>📋 Detaily rezervace:</h3>
            <p><strong>Služba:</strong> ${data.service}</p>
            <p><strong>Datum:</strong> ${data.date}</p>
            <p><strong>Čas:</strong> ${data.time}</p>
          </div>
          
          <p>Těšíme se na vaši návštěvu! Pokud potřebujete rezervaci zrušit nebo přeložit, kontaktujte nás prosím s předstihem.</p>
          
          <p>S pozdravem,<br>
          Tým FlekCuts</p>
        </div>
        <div class="footer">
          <p>FlekCuts - Váš stylový barbershop</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    FlekCuts - Potvrzení rezervace
    
    Dobrý den ${data.customerName},
    
    Děkujeme za vaši rezervaci. Vaše objednávka byla úspěšně potvrzena.
    
    Detaily rezervace:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    
    Těšíme se na vaši návštěvu!
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Email template for appointment reminder
const appointmentReminder = (data: EmailData) => {
  const subject = `Připomínka termínu - FlekCuts zítra`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ FlekCuts</h1>
          <h2>Připomínka termínu</h2>
        </div>
        <div class="content">
          <p>Dobrý den ${data.customerName},</p>
          
          <p>Připomínáme vám, že máte zítra rezervaci v našem barbershopu.</p>
          
          <div class="highlight">
            <h3>📋 Váš termín zítra:</h3>
            <p><strong>Služba:</strong> ${data.service}</p>
            <p><strong>Datum:</strong> ${data.date}</p>
            <p><strong>Čas:</strong> ${data.time}</p>
          </div>
          
          <p>Těšíme se na vás! Pokud nemůžete dorazit, dejte nám prosím vědět co nejdříve.</p>
          
          <p>S pozdravem,<br>
          Tým FlekCuts</p>
        </div>
        <div class="footer">
          <p>FlekCuts - Váš stylový barbershop</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    FlekCuts - Připomínka termínu
    
    Dobrý den ${data.customerName},
    
    Připomínáme vám, že máte zítra rezervaci v našem barbershopu.
    
    Váš termín zítra:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    
    Těšíme se na vás!
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Email template for status updates
const statusUpdate = (data: StatusEmailData) => {
  const subject = `Změna stavu rezervace - FlekCuts`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#28a745";
      case "cancelled":
        return "#dc3545";
      case "pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .highlight { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .status { color: ${getStatusColor(data.newStatus)}; font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 FlekCuts</h1>
          <h2>Aktualizace rezervace</h2>
        </div>
        <div class="content">
          <p>Dobrý den ${data.customerName},</p>
          
          <p>Informujeme vás o změně stavu vaší rezervace:</p>
          
          <div class="highlight">
            <p class="status">📌 ${data.statusMessage}</p>
            
            <h3>📋 Detaily rezervace:</h3>
            <p><strong>Služba:</strong> ${data.service}</p>
            <p><strong>Datum:</strong> ${data.date}</p>
            <p><strong>Čas:</strong> ${data.time}</p>
          </div>
          
          <p>Pokud máte jakékoli dotazy, neváhejte nás kontaktovat.</p>
          
          <p>S pozdravem,<br>
          Tým FlekCuts</p>
        </div>
        <div class="footer">
          <p>FlekCuts - Váš stylový barbershop</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    FlekCuts - Aktualizace rezervace
    
    Dobrý den ${data.customerName},
    
    Informujeme vás o změně stavu vaší rezervace:
    ${data.statusMessage}
    
    Detaily rezervace:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Email template for cancellation confirmation
const cancellationConfirmation = (data: EmailData) => {
  const subject = `Potvrzení zrušení rezervace - FlekCuts`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #6c757d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .highlight { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ FlekCuts</h1>
          <h2>Rezervace zrušena</h2>
        </div>
        <div class="content">
          <p>Dobrý den ${data.customerName},</p>
          
          <p>Potvrzujeme, že vaše rezervace byla úspěšně zrušena.</p>
          
          <div class="highlight">
            <h3>📋 Zrušená rezervace:</h3>
            <p><strong>Služba:</strong> ${data.service}</p>
            <p><strong>Datum:</strong> ${data.date}</p>
            <p><strong>Čas:</strong> ${data.time}</p>
          </div>
          
          <p>Budeme se těšit na vaši návštěvu příště. Pro novou rezervaci nás můžete kontaktovat kdykoli.</p>
          
          <p>S pozdravem,<br>
          Tým FlekCuts</p>
        </div>
        <div class="footer">
          <p>FlekCuts - Váš stylový barbershop</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    FlekCuts - Rezervace zrušena
    
    Dobrý den ${data.customerName},
    
    Potvrzujeme, že vaše rezervace byla úspěšně zrušena.
    
    Zrušená rezervace:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    
    Budeme se těšit na vaši návštěvu příště!
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Export all templates
export const emailTemplates = {
  appointmentConfirmation,
  appointmentReminder,
  statusUpdate,
  cancellationConfirmation,
};
