import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

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

// Mapowanie enuma na polskie nazwy
const serviceLabels = {
  WAXING: 'Depilacja woskiem',
  MANICURE: 'Manicure',
  MASSAGE: 'Masaż'
};

// Customowy event do widoku miesiąca
function MonthEvent({ event }) {
  return (
    <span className="font-medium text-pink-300">
      {serviceLabels[event.resource?.service] || event.resource?.service || ''} ({event.resource ? event.resource.name : ''})
    </span>
  );
}

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [actionError, setActionError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Błąd pobierania wizyt.');
        }
        const data = await res.json();
        // Mapuj na format react-big-calendar
        const mapped = data.map(app => ({
          title: `${app.name} (${app.service})`,
          start: new Date(app.startTime),
          end: new Date(app.endTime),
          resource: app
        }));
        setAppointments(mapped);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Funkcja do formatowania daty i godziny
  const formatDateTimeRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    // Użyj toLocaleString z pl-PL i wymuszoną strefą czasową użytkownika
    const startStr = startDate.toLocaleString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const endStr = endDate.toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  // Funkcja do odświeżenia wizyt po edycji/usunięciu
  const refreshAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const mapped = data.map(app => ({
        title: `${serviceLabels[app.service]} (${app.name})`,
        start: new Date(app.startTime),
        end: new Date(app.endTime),
        resource: app
      }));
      setAppointments(mapped);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Anulowanie wizyty
  const handleDelete = async () => {
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/${selectedEvent.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Błąd anulowania wizyty.');
      setSelectedEvent(null);
      setEditMode(false);
      setShowDeleteConfirm(false);
      await refreshAppointments();
    } catch (e) {
      setActionError(e.message);
    }
  };

  // Edycja wizyty
  const handleEdit = () => {
    setEditData({ ...selectedEvent });
    setEditMode(true);
    setActionError('');
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  const handleEditSave = async () => {
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/${selectedEvent.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      if (!res.ok) throw new Error('Błąd edycji wizyty.');
      const updated = await res.json();
      setSelectedEvent(updated);
      setEditMode(false);
      await refreshAppointments();
    } catch (e) {
      setActionError(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Panel administratora
            </h1>
            <p className="text-gray-600 mb-2">
              Wszystkie umówione wizyty
            </p>
          </div>
          <button onClick={handleLogout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold">Wyloguj</button>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading && <div className="text-pink-500 mb-4">Ładowanie wizyt...</div>}
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <Calendar
            localizer={localizer}
            events={appointments.map(a => ({ ...a, title: a.resource ? serviceLabels[a.resource.service] + ' (' + a.resource.name + ')' : a.title }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={['month', 'week', 'day']}
            defaultView="month"
            onSelectEvent={event => setSelectedEvent(event.resource)}
            eventPropGetter={() => ({ style: { cursor: 'pointer' } })}
            components={{ month: { event: MonthEvent } }}
          />
        </div>
      </div>
      {/* Modal ze szczegółami wizyty */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl relative">
            <button onClick={() => { setSelectedEvent(null); setEditMode(false); }} className="absolute top-2 right-2 text-gray-400 hover:text-pink-500 text-2xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-pink-600">Szczegóły wizyty</h2>
            {actionError && <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{actionError}</div>}
            {editMode ? (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Usługa:</span>
                  <select name="service" value={editData.service} onChange={handleEditChange} className="ml-2 border rounded p-1">
                    {Object.entries(serviceLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="font-semibold">Imię i nazwisko:</span>
                  <input name="name" value={editData.name} onChange={handleEditChange} className="ml-2 border rounded p-1" />
                </div>
                <div>
                  <span className="font-semibold">Email:</span>
                  <input name="email" value={editData.email} onChange={handleEditChange} className="ml-2 border rounded p-1" />
                </div>
                <div>
                  <span className="font-semibold">Telefon:</span>
                  <input name="phone" value={editData.phone} onChange={handleEditChange} className="ml-2 border rounded p-1" />
                </div>
                <div>
                  <span className="font-semibold">Data i godzina od:</span>
                  <input type="datetime-local" name="startTime" value={editData.startTime?.slice(0,16)} onChange={handleEditChange} className="ml-2 border rounded p-1" />
                </div>
                <div>
                  <span className="font-semibold">Data i godzina do:</span>
                  <input type="datetime-local" name="endTime" value={editData.endTime?.slice(0,16)} onChange={handleEditChange} className="ml-2 border rounded p-1" />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button onClick={handleEditSave} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">Zapisz</button>
                  <button onClick={() => setEditMode(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Anuluj edycję</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div><span className="font-semibold">Usługa:</span> {serviceLabels[selectedEvent.service] || selectedEvent.service}</div>
                <div><span className="font-semibold">Imię i nazwisko:</span> {selectedEvent.name}</div>
                <div><span className="font-semibold">Email:</span> {selectedEvent.email}</div>
                <div><span className="font-semibold">Telefon:</span> {selectedEvent.phone}</div>
                <div><span className="font-semibold">Data i godzina:</span> {formatDateTimeRange(selectedEvent.startTime, selectedEvent.endTime)}</div>
                <div className="flex space-x-2 mt-4">
                  <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edytuj</button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Anuluj wizytę</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal potwierdzenia usunięcia */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center">
            <h3 className="text-xl font-bold mb-4 text-red-600">Potwierdź anulowanie wizyty</h3>
            <p className="mb-6">Czy na pewno chcesz anulować tę wizytę? Tej operacji nie można cofnąć.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Tak, anuluj</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Nie</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 