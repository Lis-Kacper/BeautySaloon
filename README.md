# Beauty Saloon – System rezerwacji wizyt

## Opis projektu
System rezerwacji online dla salonu beauty, umożliwiający klientom rezerwację wizyt przez kalendarz, a administratorowi zarządzanie wszystkimi wizytami. Projekt zawiera nowoczesny frontend, bezpieczny backend oraz bazę danych w chmurze.

## Link do strony na Netlify 
- **https://salonbeauty2137.netlify.app**


## Użyte technologie

### Frontend
- **React** – budowa interfejsu użytkownika
- **React Router** – routing między stronami
- **Tailwind CSS** – nowoczesne stylowanie
- **React Big Calendar** – widok kalendarza rezerwacji
- **Netlify** – hosting frontendu w chmurze (darmowy, automatyczny deploy z GitHuba)

### Backend
- **Node.js + Express** – REST API
- **Prisma ORM** – obsługa bazy danych
- **Nodemailer** – wysyłka powiadomień e-mail
- **Render.com** – hosting backendu w chmurze (darmowy, automatyczny deploy z GitHuba)

### Baza danych
- **Supabase** – zarządzany PostgreSQL w chmurze (darmowy plan)

## Logowanie do panelu administratora
- Wejdź na stronę i kliknij "Panel administratora" lub przejdź do `/login`.
- Użyj przykładowych danych logowania:
  - **Login:** `admin`
  - **Hasło:** `admin123`


## Jak to działa?
1. **Klient** wchodzi na stronę (frontend na Netlify), widzi kalendarz i dostępne terminy.
2. Po wybraniu terminu i usługi, klient wypełnia formularz rezerwacji.
3. **Frontend** wysyła żądanie do **backendu** (Render), który sprawdza dostępność i zapisuje wizytę w bazie (Supabase).
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
- **Frontend:** Netlify (darmowy hosting, automatyczny deploy z GitHuba)
- **Backend:** Render.com (darmowy hosting, automatyczny deploy z GitHuba)
- **Baza danych:** Supabase (darmowy PostgreSQL)

---

> Projekt stworzony na zaliczenie – pełna dokumentacja i kod źródłowy dostępne w repozytorium. 
