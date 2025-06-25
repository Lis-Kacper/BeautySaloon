import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const names = [
  'Jan Kowalski', 'Anna Nowak', 'Piotr Zieliński', 'Katarzyna Wiśniewska', 'Marek Lewandowski',
  'Agnieszka Wójcik', 'Tomasz Kamiński', 'Ewa Kaczmarek', 'Paweł Mazur', 'Magdalena Dąbrowska',
  'Kamil Jabłoński', 'Joanna Król', 'Michał Pawlak', 'Aleksandra Szymańska', 'Grzegorz Baran',
  'Karolina Górska', 'Łukasz Rutkowski', 'Natalia Sikora', 'Marcin Piątek', 'Patrycja Lis'
];
const emails = names.map(n => n.toLowerCase().replace(/ /g, '.') + '@test.com');
const phones = Array.from({length: 20}, (_, i) => '500100' + (100 + i));
const services = ['WAXING', 'MANICURE', 'MASSAGE'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  const slotsPerDay = 16; // 09:00-17:00 co 30 min
  let usedSlots = new Set();
  for (let i = 0; i < 20; i++) {
    let dayOffset, slotIdx, slotKey;
    do {
      dayOffset = getRandomInt(1, 21); // 1-21 dni w przyszłość
      slotIdx = getRandomInt(0, slotsPerDay - 1);
      slotKey = `${dayOffset}-${slotIdx}`;
    } while (usedSlots.has(slotKey));
    usedSlots.add(slotKey);
    const start = new Date(today);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(9 + Math.floor(slotIdx / 2), slotIdx % 2 === 0 ? 0 : 30, 0, 0);
    const end = new Date(start.getTime() + 30 * 60000);
    await prisma.appointment.create({
      data: {
        name: names[i % names.length],
        email: emails[i % emails.length],
        phone: phones[i % phones.length],
        service: services[getRandomInt(0, services.length - 1)],
        startTime: start,
        endTime: end
      }
    });
  }
  await prisma.$disconnect();
  console.log('Dodano 20 losowych wizyt!');
}

seed(); 