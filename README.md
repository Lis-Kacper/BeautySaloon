# Beauty Saloon – System rezerwacji wizyt

## Opis projektu
System rezerwacji online dla salonu beauty, umożliwiający klientom rezerwację wizyt przez kalendarz, a administratorowi zarządzanie wszystkimi wizytami. Projekt zawiera nowoczesny frontend, bezpieczny backend oraz bazę danych w chmurze.

## Użyte technologie

### Frontend
- **React** – budowa interfejsu użytkownika
- **React Router** – routing między stronami
- **Tailwind CSS** – nowoczesne stylowanie
- **React Big Calendar** – widok kalendarza rezerwacji
- **Netlify** (lub Vercel) – hosting frontendu w chmurze (darmowy, automatyczny deploy z GitHuba)

### Backend
- **Node.js + Express** – REST API
- **Prisma ORM** – obsługa bazy danych
- **Nodemailer** – wysyłka powiadomień e-mail
- **Render.com** (lub Railway.app) – hosting backendu w chmurze (darmowy, automatyczny deploy z GitHuba)

### Baza danych
- **Supabase** (lub Neon.tech) – zarządzany PostgreSQL w chmurze (darmowy plan)

## Jak to działa?
1. **Klient** wchodzi na stronę (frontend na Netlify/Vercel), widzi kalendarz i dostępne terminy.
2. Po wybraniu terminu i usługi, klient wypełnia formularz rezerwacji.
3. **Frontend** wysyła żądanie do **backendu** (Render/Railway), który sprawdza dostępność i zapisuje wizytę w bazie (Supabase/Neon).
4. Po udanej rezerwacji klient otrzymuje e-mail z potwierdzeniem.
5. **Administrator** loguje się do panelu admina, gdzie może przeglądać, edytować i anulować wizyty.
6. Wszystkie dane przechowywane są bezpiecznie w chmurze, a komunikacja odbywa się przez REST API.

## Funkcjonalności
- Rezerwacja wizyt przez kalendarz (tylko wolne sloty)
- Powiadomienia e-mail o rezerwacji
- Panel admina do zarządzania wizytami
- Logowanie admina (JWT)
- Walidacja danych i bezpieczeństwo
- Nowoczesny, responsywny interfejs

## Deployment (chmurowy)
- **Frontend:** Netlify lub Vercel (darmowy hosting, automatyczny deploy z GitHuba)
- **Backend:** Render.com lub Railway.app (darmowy hosting, automatyczny deploy z GitHuba)
- **Baza danych:** Supabase lub Neon.tech (darmowy PostgreSQL)

---

> Projekt stworzony na zaliczenie – pełna dokumentacja i kod źródłowy dostępne w repozytorium. 