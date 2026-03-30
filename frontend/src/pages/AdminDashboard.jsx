import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('specialties')
  const [specialties, setSpecialties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [summary, setSummary] = useState(null)

  const [specName, setSpecName] = useState('')
  const [docName, setDocName] = useState('')
  const [docSpecialty, setDocSpecialty] = useState('')
  const [docMode, setDocMode] = useState('ONLINE')
  const [docVideoLink, setDocVideoLink] = useState('')
  const [docClinicAddress, setDocClinicAddress] = useState('')

  const [slotDoctor, setSlotDoctor] = useState('')
  const [slotDate, setSlotDate] = useState('')
  const [slotStart, setSlotStart] = useState('')
  const [slotEnd, setSlotEnd] = useState('')
  const [uploadResult, setUploadResult] = useState(null)

  const [summaryDate, setSummaryDate] = useState('')

  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token || localStorage.getItem('role') !== 'ADMIN') { navigate('/'); return }
    fetchSpecialties()
    fetchAllDoctors()
  }, [])

  const fetchSpecialties = () => {
    axios.get('http://localhost:8080/api/specialties', { headers }).then(res => setSpecialties(res.data))
  }

  const fetchAllDoctors = () => {
    axios.get('http://localhost:8080/api/doctors/all', { headers }).then(res => setDoctors(res.data)).catch(() => {})
  }

  const fetchAppointments = (date) => {
    axios.get(`http://localhost:8080/api/appointments/all?date=${date}`, { headers }).then(res => setAppointments(res.data)).catch(() => {})
    axios.get(`http://localhost:8080/api/appointments/summary?date=${date}`, { headers }).then(res => setSummary(res.data)).catch(() => {})
  }

  const [formError, setFormError] = useState('')

  const addSpecialty = (e) => {
    e.preventDefault()
    if (!specName.trim()) { setFormError('Please enter a specialty name'); return }
    setFormError('')
    axios.post('http://localhost:8080/api/specialties', { name: specName }, { headers })
      .then(() => { fetchSpecialties(); setSpecName(''); alert('Specialty added!') })
  }

  const addDoctor = (e) => {
    e.preventDefault()
    if (!docName.trim()) { setFormError('Please enter the doctor name'); return }
    if (!docSpecialty) { setFormError('Please select a specialty'); return }
    if (docMode === 'ONLINE' && !docVideoLink.trim()) { setFormError('Please enter a video consultation link'); return }
    if (docMode === 'OFFLINE' && !docClinicAddress.trim()) { setFormError('Please enter the clinic address'); return }
    setFormError('')
    axios.post('http://localhost:8080/api/doctors', {
      name: docName, specialtyId: docSpecialty, mode: docMode, videoLink: docVideoLink, clinicAddress: docClinicAddress
    }, { headers })
      .then(() => { fetchAllDoctors(); setDocName(''); setDocVideoLink(''); setDocClinicAddress(''); alert('Doctor added!') })
  }

  const addSlot = (e) => {
    e.preventDefault()
    if (!slotDoctor) { setFormError('Please select a doctor'); return }
    if (!slotDate) { setFormError('Please select a date'); return }
    if (!slotStart) { setFormError('Please enter start time'); return }
    if (!slotEnd) { setFormError('Please enter end time'); return }
    if (slotStart >= slotEnd) { setFormError('End time must be after start time'); return }
    setFormError('')
    axios.post('http://localhost:8080/api/slots', {
      doctorId: slotDoctor, date: slotDate, startTime: slotStart, endTime: slotEnd
    }, { headers })
      .then(() => { alert('Slot created!'); setSlotStart(''); setSlotEnd('') })
  }

  const uploadCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    axios.post('http://localhost:8080/api/slots/upload', formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        setUploadResult(res.data)
        alert(`${res.data.created} slots created!` + (res.data.errors.length > 0 ? ` ${res.data.errors.length} errors.` : ''))
        e.target.value = ''
      })
      .catch(() => alert('Upload failed'))
  }

  const updateStatus = (id, status) => {
    axios.put(`http://localhost:8080/api/appointments/${id}/status`, { status }, { headers })
      .then(() => { if (summaryDate) fetchAppointments(summaryDate) })
  }

  const logout = () => { localStorage.clear(); navigate('/') }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Admin Panel - Doctor Appointment System</h2>
        <div className="nav-right">
          <span>Administrator</span>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="tabs">
        <button className={`tab ${activeTab === 'specialties' ? 'active' : ''}`} onClick={() => setActiveTab('specialties')}>Specialties</button>
        <button className={`tab ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>Doctors</button>
        <button className={`tab ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>Time Slots</button>
        <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>Appointments & Summary</button>
      </div>

      <div className="content">
        {formError && <div className="error-msg" style={{marginBottom: '20px'}}>{formError}</div>}
        {activeTab === 'specialties' && (
          <div className="admin-section">
            <div className="step-card">
              <h3>Add New Specialty</h3>
              <form onSubmit={addSpecialty} className="inline-form">
                <input placeholder="e.g. Cardiology, Dermatology, Pediatrics..." value={specName} onChange={e => setSpecName(e.target.value)} required />
                <button type="submit" className="btn btn-primary">Add Specialty</button>
              </form>
            </div>
            <div className="step-card">
              <h3>All Specialties ({specialties.length})</h3>
              <div className="tag-list">
                {specialties.map(s => (
                  <span key={s.id} className="tag">{s.name}</span>
                ))}
              </div>
              {specialties.length === 0 && <p className="no-data">No specialties added yet. Add your first specialty above.</p>}
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="admin-section">
            <div className="step-card">
              <h3>Register New Doctor</h3>
              <form onSubmit={addDoctor} className="form-grid">
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input placeholder="Dr. Full Name" value={docName} onChange={e => setDocName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Specialty</label>
                  <select value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)} required className="select-input">
                    <option value="">-- Select Specialty --</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Consultation Mode</label>
                  <div style={{display: 'flex', gap: '20px', marginTop: '8px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: docMode === 'ONLINE' ? '#2563eb' : '#64748b'}}>
                      <input type="radio" name="docMode" value="ONLINE" checked={docMode === 'ONLINE'} onChange={e => setDocMode(e.target.value)} style={{width: '18px', height: '18px', accentColor: '#3b82f6'}} />
                      Online (Teleconsultation)
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: docMode === 'OFFLINE' ? '#ea580c' : '#64748b'}}>
                      <input type="radio" name="docMode" value="OFFLINE" checked={docMode === 'OFFLINE'} onChange={e => setDocMode(e.target.value)} style={{width: '18px', height: '18px', accentColor: '#ea580c'}} />
                      Offline (In-Clinic)
                    </label>
                  </div>
                </div>
                {docMode === 'ONLINE' && (
                  <div className="form-group">
                    <label>Video Consultation Link</label>
                    <input placeholder="https://meet.google.com/..." value={docVideoLink} onChange={e => setDocVideoLink(e.target.value)} />
                  </div>
                )}
                {docMode === 'OFFLINE' && (
                  <div className="form-group">
                    <label>Clinic Address</label>
                    <input placeholder="123 Medical Centre, City" value={docClinicAddress} onChange={e => setDocClinicAddress(e.target.value)} />
                  </div>
                )}
                <button type="submit" className="btn btn-primary">Register Doctor</button>
              </form>
            </div>
            <div className="step-card">
              <h3>All Doctors ({doctors.length})</h3>
              {doctors.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Specialty</th><th>Mode</th><th>Contact/Location</th></tr>
                  </thead>
                  <tbody>
                    {doctors.map(d => (
                      <tr key={d.id}>
                        <td style={{fontWeight: 600}}>{d.name}</td>
                        <td>{d.specialty?.name}</td>
                        <td><span className={`badge ${d.mode.toLowerCase()}`}>{d.mode}</span></td>
                        <td style={{color: '#64748b', fontSize: '13px'}}>{d.mode === 'ONLINE' ? d.videoLink : d.clinicAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="no-data">No doctors registered yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="admin-section">
            <div className="step-card">
              <h3>Create Appointment Slot</h3>
              <form onSubmit={addSlot} className="form-grid">
                <div className="form-group">
                  <label>Doctor</label>
                  <select value={slotDoctor} onChange={e => setSlotDoctor(e.target.value)} required className="select-input">
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.mode})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={slotStart} onChange={e => setSlotStart(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={slotEnd} onChange={e => setSlotEnd(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Create Slot</button>
              </form>
            </div>
            <div className="step-card">
              <h3>Bulk Upload Slots (CSV)</h3>
              <p style={{color: '#94a3b8', marginBottom: '16px', fontSize: '14px'}}>
                Upload a CSV file with format: <code style={{background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '6px', fontSize: '13px'}}>doctorId,date,startTime,endTime</code>
              </p>
              <div className="json-example" style={{background: '#f0f4ff', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#334155', lineHeight: '1.8'}}>
                <div style={{color: '#64748b', marginBottom: '4px'}}>Example CSV:</div>
                <div>doctorId,date,startTime,endTime</div>
                <div>1,2026-03-30,09:00,09:30</div>
                <div>1,2026-03-30,09:30,10:00</div>
                <div>2,2026-03-30,10:00,10:30</div>
              </div>
              <input type="file" accept=".csv" onChange={uploadCSV} style={{marginBottom: '16px'}} />
              {uploadResult && (
                <div style={{marginTop: '12px'}}>
                  <p style={{color: '#22c55e', fontWeight: 700}}>{uploadResult.created} slots created successfully</p>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div style={{marginTop: '8px'}}>
                      {uploadResult.errors.map((err, i) => (
                        <p key={i} style={{color: '#ef4444', fontSize: '13px'}}>{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="admin-section">
            <div className="step-card">
              <h3>Daily Summary & Appointments</h3>
              <div className="inline-form" style={{marginBottom: '24px'}}>
                <input type="date" value={summaryDate} onChange={e => { setSummaryDate(e.target.value); fetchAppointments(e.target.value) }} />
              </div>

              {summary && summary.total > 0 && (
                <div className="summary-grid">
                  <div className="summary-card blue">
                    <div className="label">Total Appointments</div>
                    <div className="value">{summary.total}</div>
                  </div>
                  {summary.byMode && Object.entries(summary.byMode).map(([mode, count]) => (
                    <div key={mode} className={`summary-card ${mode === 'ONLINE' ? 'green' : 'orange'}`}>
                      <div className="label">{mode}</div>
                      <div className="value">{count}</div>
                    </div>
                  ))}
                  {summary.byStatus && Object.entries(summary.byStatus).map(([status, count]) => (
                    <div key={status} className="summary-card red">
                      <div className="label">{status.replace('_', ' ')}</div>
                      <div className="value">{count}</div>
                    </div>
                  ))}
                </div>
              )}

              {summary && summary.bySpecialty && Object.keys(summary.bySpecialty).length > 0 && (
                <div className="step-card" style={{marginBottom: '20px', background: '#f8fafc'}}>
                  <h3>By Specialty</h3>
                  <div className="tag-list">
                    {Object.entries(summary.bySpecialty).map(([name, count]) => (
                      <span key={name} className="tag">{name}: {count}</span>
                    ))}
                  </div>
                </div>
              )}

              {appointments.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr><th>Patient</th><th>Doctor</th><th>Specialty</th><th>Date</th><th>Time</th><th>Mode</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id}>
                        <td style={{fontWeight: 600}}>{a.patient?.name}</td>
                        <td>{a.doctor?.name}</td>
                        <td>{a.doctor?.specialty?.name}</td>
                        <td>{a.slot?.date}</td>
                        <td>{a.slot?.startTime} - {a.slot?.endTime}</td>
                        <td><span className={`badge ${a.doctor?.mode?.toLowerCase()}`}>{a.doctor?.mode}</span></td>
                        <td><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span></td>
                        <td>
                          {a.status === 'CONFIRMED' && (
                            <div className="action-btns">
                              <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="btn btn-sm btn-success">Complete</button>
                              <button onClick={() => updateStatus(a.id, 'NO_SHOW')} className="btn btn-sm btn-danger">No Show</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : summaryDate ? <p className="no-data">No appointments for this date.</p> : <p className="no-data">Select a date to view appointments and summary.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
