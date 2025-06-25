import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const services = ['WAXING', 'MANICURE', 'MASSAGE'];
const names = ['Anna Nowak', 'Jan Kowalski', 'Maria Wiśniewska', 'Piotr Zieliński', 'Katarzyna Lewandowska'];
const emails = ['anna@test.com', 'jan@test.com', 'maria@test.com', 'piotr@test.com', 'kasia@test.com'];
const phones = ['123456789', '987654321', '555666777', '111222333', '444555666'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDateInNextMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // Losuj dzień w przedziale od dziś do za miesiąc
  const randomDay = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  // Ustaw losową godzinę w zakresie 9:00–17:30 (ostatni slot na 30 min)
  const hour = 9 + Math.floor(Math.random() * 9); // 9–17
  const minute = Math.random() < 0.5 ? 0 : 30; // 0 lub 30

  randomDay.setHours(hour, minute, 0, 0);
  return randomDay;
}

async function main() {
  const howMany = 400; // Zmień na dowolną liczbę wizyt
  for (let i = 0; i < howMany; i++) {
    const startTime = getRandomDateInNextMonth();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minut
    await prisma.appointment.create({
      data: {
        name: getRandom(names),
        email: getRandom(emails),
        phone: getRandom(phones),
        service: getRandom(services),
        startTime,
        endTime,
      }
    });
  }
  console.log(`Dodano ${howMany} losowych wizyt!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 