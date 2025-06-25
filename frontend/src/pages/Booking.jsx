import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const services = [
  { label: 'Depilacja woskiem', value: 'WAXING' },
  { label: 'Manicure', value: 'MANICURE' },
  { label: 'Masaż', value: 'MASSAGE' }
];

function Booking() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: services[0].value,
    time: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  const handleDateSelect = async (date) => {
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      setError('Nie można rezerwować wizyt w przeszłości.');
      return;
    }

    setSelectedDate(selected);
    setShowPopup(true);
    setError('');
    setSuccess('');
    setFormData(f => ({ ...f, time: '' }));
    setAvailableSlots([]);
    setLoadingSlots(true);
    // Pobierz dostępne sloty z backendu
    try {
      const dateStr = selected.toISOString().slice(0, 10);
      const res = await fetch(`http://localhost:3001/api/availability?date=${dateStr}`);
      const slots = await res.json();
      if (Array.isArray(slots) && slots.length > 0) {
        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (e) {
      setError('Błąd podczas pobierania dostępnych godzin.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.time) {
      setError('Wybierz godzinę wizyty.');
      return;
    }
    const slot = availableSlots.find(s => s.startTime === formData.time);
    if (!slot) {
      setError('Wybrany slot nie jest już dostępny.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się zarezerwować wizyty.');
      }
      setSuccess('Wizyta została zarezerwowana!');
      setTimeout(() => {
        setShowPopup(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-4 drop-shadow">Beauty Salon</h1>
        <p className="text-gray-600 mb-6 text-lg">Zarezerwuj wizytę na wybrany dzień i godzinę</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors mb-8 shadow"
        >
          Panel administratora
        </button>
      </div>
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <Calendar
          localizer={localizer}
          events={[]}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          className="mb-8"
          selectable
          onSelectSlot={(slotInfo) => handleDateSelect(slotInfo.start)}
          onSelectEvent={(event) => handleDateSelect(event.start)}
          views={['month']}
          defaultView="month"
        />
      </div>
      {/* Booking Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 md:p-8 max-w-md w-full shadow-xl relative max-h-[90vh] overflow-y-auto flex flex-col">
            <button onClick={() => setShowPopup(false)} className="absolute top-2 right-2 text-gray-400 hover:text-pink-500 text-2xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-pink-600">Rezerwacja wizyty</h2>
            <p className="text-gray-600 mb-4">
              Data: <span className="font-semibold">{selectedDate?.toLocaleDateString()}</span>
            </p>
            {loadingSlots && <div className="mb-4 text-center text-pink-500">Ładowanie dostępnych godzin...</div>}
            {!loadingSlots && availableSlots.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-center">
                Brak wolnych terminów na ten dzień.
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            {availableSlots.length > 0 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usługa</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  >
                    {services.map(service => (
                      <option key={service.value} value={service.value}>{service.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Godzina</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => {
                      const time = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isSelected = formData.time === slot.startTime;
                      return (
                        <button
                          type="button"
                          key={slot.startTime}
                          onClick={() => setFormData(f => ({ ...f, time: slot.startTime }))}
                          className={`py-2 px-3 rounded border text-center font-semibold transition-all
                            ${isSelected ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-700 border-pink-300 hover:bg-pink-100'}
                          `}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                  {!formData.time && <div className="text-xs text-red-500 mt-1">Wybierz godzinę wizyty</div>}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow"
                  >
                    Zarezerwuj
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;