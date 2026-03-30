import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [specialties, setSpecialties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedMode, setSelectedMode] = useState('ONLINE')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [activeTab, setActiveTab] = useState('book')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')
  const email = localStorage.getItem('email')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/'); return }
    fetchSpecialties()
    fetchAppointments()
  }, [])

  const fetchSpecialties = () => {
    axios.get('http://localhost:8080/api/specialties', { headers })
      .then(res => setSpecialties(res.data))
  }

  const fetchDoctors = (specialtyId, mode) => {
    axios.get(`http://localhost:8080/api/doctors?specialtyId=${specialtyId}&mode=${mode}`, { headers })
      .then(res => { setDoctors(res.data); setSelectedDoctor(null); setSlots([]) })
  }

  const fetchSlots = (doctorId, date) => {
    axios.get(`http://localhost:8080/api/slots?doctorId=${doctorId}&date=${date}`, { headers })
      .then(res => setSlots(res.data))
  }

  const fetchAppointments = () => {
    axios.get(`http://localhost:8080/api/appointments/my?email=${email}`, { headers })
      .then(res => setAppointments(res.data))
  }

  const bookAppointment = (slotId) => {
    axios.post('http://localhost:8080/api/appointments', { slotId: slotId.toString(), patientEmail: email }, { headers })
      .then(() => {
        alert('Appointment booked successfully!')
        fetchAppointments()
        if (selectedDoctor && selectedDate) fetchSlots(selectedDoctor.id, selectedDate)
      })
      .catch(() => alert('Booking failed. Slot may already be taken.'))
  }

  const cancelAppointment = (id) => {
    axios.put(`http://localhost:8080/api/appointments/${id}/cancel`, {}, { headers })
      .then(() => fetchAppointments())
  }

  const handleSpecialtyChange = (e) => {
    setSelectedSpecialty(e.target.value)
    if (e.target.value) fetchDoctors(e.target.value, selectedMode)
    else { setDoctors([]); setSlots([]) }
  }

  const handleModeChange = (mode) => {
    setSelectedMode(mode)
    if (selectedSpecialty) fetchDoctors(selectedSpecialty, mode)
    setDoctors([]); setSlots([]); setSelectedDoctor(null)
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setSlots([])
    setSelectedDate('')
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    if (selectedDoctor) fetchSlots(selectedDoctor.id, e.target.value)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Doctor Appointment System</h2>
        <div className="nav-right">
          <span>Welcome, {name}</span>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="tabs">
        <button className={`tab ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>Book Appointment</button>
        <button className={`tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => { setActiveTab('my'); fetchAppointments() }}>My Appointments</button>
      </div>

      <div className="content">
        {activeTab === 'book' && (
          <div className="booking-flow">
            <div className="step-card">
              <h3>Step 1: Select Mode</h3>
              <div className="mode-toggle">
                <button className={`mode-btn ${selectedMode === 'ONLINE' ? 'active' : ''}`} onClick={() => handleModeChange('ONLINE')}>Online (Teleconsultation)</button>
                <button className={`mode-btn ${selectedMode === 'OFFLINE' ? 'active' : ''}`} onClick={() => handleModeChange('OFFLINE')}>Offline (In-Clinic)</button>
              </div>
            </div>

            <div className="step-card">
              <h3>Step 2: Select Specialty</h3>
              <select value={selectedSpecialty} onChange={handleSpecialtyChange} className="select-input">
                <option value="">-- Choose Specialty --</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {doctors.length > 0 && (
              <div className="step-card">
                <h3>Step 3: Select Doctor</h3>
                <div className="doctor-grid">
                  {doctors.map(d => (
                    <div key={d.id} className={`doctor-card ${selectedDoctor?.id === d.id ? 'selected' : ''}`} onClick={() => handleDoctorSelect(d)}>
                      <h4>{d.name}</h4>
                      <span className={`badge ${d.mode.toLowerCase()}`}>{d.mode}</span>
                      {d.mode === 'ONLINE' && d.videoLink && <p className="detail">Video: {d.videoLink}</p>}
                      {d.mode === 'OFFLINE' && d.clinicAddress && <p className="detail">Clinic: {d.clinicAddress}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDoctor && (
              <div className="step-card">
                <h3>Step 4: Select Date & Time</h3>
                <input type="date" value={selectedDate} onChange={handleDateChange} className="select-input" />
                {slots.length > 0 ? (
                  <div className="slot-grid">
                    {slots.map(s => (
                      <div key={s.id} className="slot-card">
                        <span>{s.startTime} - {s.endTime}</span>
                        <button onClick={() => bookAppointment(s.id)} className="btn btn-sm btn-primary">Book</button>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <p className="no-data">No available slots for this date.</p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my' && (
          <div className="appointments-list">
            <h3>My Appointments</h3>
            {appointments.length === 0 ? (
              <p className="no-data">No appointments yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td>{a.doctor?.name}</td>
                      <td>{a.doctor?.specialty?.name}</td>
                      <td>{a.slot?.date}</td>
                      <td>{a.slot?.startTime} - {a.slot?.endTime}</td>
                      <td><span className={`badge ${a.doctor?.mode?.toLowerCase()}`}>{a.doctor?.mode}</span></td>
                      <td><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span></td>
                      <td>
                        {a.doctor?.mode === 'ONLINE' && a.doctor?.videoLink && <span>Video: {a.doctor.videoLink}</span>}
                        {a.doctor?.mode === 'OFFLINE' && a.doctor?.clinicAddress && <span>Clinic: {a.doctor.clinicAddress}</span>}
                      </td>
                      <td>
                        {a.status === 'CONFIRMED' && (
                          <button onClick={() => cancelAppointment(a.id)} className="btn btn-sm btn-danger">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
