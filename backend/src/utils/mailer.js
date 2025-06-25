import nodemailer from 'nodemailer';

let transporter;

if (process.env.NODE_ENV === 'development') {
  // In development, just log emails to console
  transporter = {
    sendMail: (mailOptions) => {
      console.log('Email would be sent in production:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:', mailOptions.html || mailOptions.text);
      return Promise.resolve({ response: 'Logged to console in development' });
    }
  };
} else {
  // In production, use real email service
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const serviceLabels = {
  WAXING: 'Depilacja woskiem',
  MANICURE: 'Manicure',
  MASSAGE: 'Masaż'
};

const sendConfirmationEmail = async ({ to, appointment }) => {
  const serviceLabel = serviceLabels[appointment.service] || appointment.service;
  const emailContent = `
    <h1>Potwierdzenie rezerwacji wizyty</h1>
    <p>Szanowna Pani/Szanowny Panie ${appointment.name},</p>
    <p>Twoja wizyta została potwierdzona na:</p>
    <ul>
      <li><strong>Usługa:</strong> ${serviceLabel}</li>
      <li><strong>Data i godzina:</strong> ${formatDate(appointment.startTime)}</li>
      <li><strong>Czas trwania:</strong> 30 minut</li>
    </ul>
    <p>Adres: Beauty Salon, ul. Piękna 10, Warszawa</p>
    <p>W razie potrzeby zmiany lub anulowania wizyty prosimy o kontakt.</p>
    <p>Dziękujemy za wybór naszego salonu!</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'development@beautysalon.com',
      to,
      subject: 'Potwierdzenie rezerwacji - Beauty Salon',
      html: emailContent,
    });
    console.log('Wysłano potwierdzenie e-mail do:', to);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't throw the error to prevent breaking the appointment creation
  }
};

export { sendConfirmationEmail };
