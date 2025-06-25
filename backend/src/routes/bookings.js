import express from 'express';
import { verifyToken } from './auth.js';
import { sendConfirmationEmail } from '../utils/mailer.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Funkcja pomocnicza do tworzenia daty w lokalnej strefie czasowej
function createLocalDate(dateString) {
  // Jeśli to już pełna data ISO, zwróć ją bez zmian
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  
  // Jeśli to tylko data (YYYY-MM-DD), dodaj czas lokalny
  return new Date(dateString + 'T00:00:00');
}

// Funkcja do tworzenia daty z czasem w lokalnej strefie czasowej
function createLocalDateTime(dateString, timeString) {
  return new Date(`${dateString}T${timeString}`);
}

// Get available time slots for a specific date
router.get('/availability', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    // Tworzenie dat z lokalną strefą czasową zamiast UTC
    const startOfDay = createLocalDateTime(date, '09:00:00');
    const endOfDay = createLocalDateTime(date, '17:00:00');

    // Get all appointments for the specified date
    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    // Generate all possible 30-minute slots
    const slots = [];
    let currentSlot = new Date(startOfDay);

    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot.getTime() + 30 * 60000);
      
      // Check if slot is available
      const isAvailable = !appointments.some(
        app => 
          (app.startTime < slotEnd && app.endTime > currentSlot)
      );

      if (isAvailable) {
        slots.push({
          startTime: currentSlot.toISOString(),
          endTime: slotEnd.toISOString(),
        });
      }

      currentSlot = slotEnd;
    }

    res.json(slots);
  } catch (error) {
    console.error('Błąd w /api/availability:', error);
    res.status(500).json({ error: 'Failed to get availability', details: error.message });
  }
});

// Create a new appointment
router.post('/appointments', async (req, res) => {
  const { name, email, phone, service, startTime, endTime } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !service || !startTime || !endTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Tworzenie dat bez automatycznej konwersji na UTC
    const appointmentStartTime = new Date(startTime);
    const appointmentEndTime = new Date(endTime);

    // Check if the slot is available
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            AND: [
              { startTime: { lte: appointmentStartTime } },
              { endTime: { gt: appointmentStartTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: appointmentEndTime } },
              { endTime: { gte: appointmentEndTime } },
            ],
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'Time slot is not available' });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        name,
        email,
        phone,
        service,
        startTime: appointmentStartTime,
        endTime: appointmentEndTime,
      },
    });

    // Send confirmation email
    await sendConfirmationEmail({
      to: email,
      appointment: {
        ...appointment,
        service,
        startTime: appointmentStartTime,
        endTime: appointmentEndTime,
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Błąd przy tworzeniu wizyty:', error);
    res.status(500).json({ error: 'Failed to create appointment', details: error.message });
  }
});

// Get all appointments (protected route for admin)
router.get('/appointments', verifyToken, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        startTime: 'asc',
      },
    });
    
    // Zwracamy daty w formacie ISO, ale zachowując lokalną strefę czasową
    const appointmentsWithLocalTime = appointments.map(appointment => ({
      ...appointment,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
    }));
    
    res.json(appointmentsWithLocalTime);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Usuń wizytę
router.delete('/appointments/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.appointment.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment', details: error.message });
  }
});

// Edytuj wizytę
router.patch('/appointments/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, phone, service, startTime, endTime } = req.body;
    
    const updated = await prisma.appointment.update({
      where: { id },
      data: { 
        name, 
        email, 
        phone, 
        service, 
        startTime: new Date(startTime), 
        endTime: new Date(endTime) 
      }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment', details: error.message });
  }
});

export default router;