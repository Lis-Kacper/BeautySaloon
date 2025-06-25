import express from 'express';
import { verifyToken } from './auth.js';
import { sendConfirmationEmail } from '../utils/mailer.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get available time slots for a specific date
router.get('/availability', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const startOfDay = new Date(`${date}T09:00:00`);
    const endOfDay = new Date(`${date}T17:00:00`);

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
          (app.startTime <= currentSlot && app.endTime > currentSlot) ||
          (app.startTime < slotEnd && app.endTime >= slotEnd)
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
    res.status(500).json({ error: 'Failed to get availability' });
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
    // Check if the slot is available
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
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
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    // Send confirmation email
    await sendConfirmationEmail({
      to: email,
      appointment: {
        ...appointment,
        service,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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
    res.json(appointments);
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
      data: { name, email, phone, service, startTime: new Date(startTime), endTime: new Date(endTime) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment', details: error.message });
  }
});

export default router;