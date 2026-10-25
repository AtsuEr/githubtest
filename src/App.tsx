import {
  Activity,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'

type Patient = {
  id: string
  initials: string
  name: string
  age: number
  pronouns: string
  room: string
  mrn: string
  condition: string
  status: 'Stable' | 'Observation' | 'Critical'
  allergies: string[]
  lastVisit: string
  color: string
}

type Note = {
  id: string
  type: string
  title: string
  author: string
  role: string
  date: string
  time: string
  body: string
  signed: boolean
}

const patients: Patient[] = [
  {
    id: 'pt-001',
    initials: 'EM',
    name: 'Elena Morales',
    age: 64,
    pronouns: 'she/her',
    room: '4B · 412',
    mrn: 'MRN 842019',
    condition: 'Post-operative monitoring',
    status: 'Stable',
    allergies: ['Penicillin'],
    lastVisit: 'Today, 08:42',
    color: '#d3e5ff',
  },
  {
    id: 'pt-002',
    initials: 'JW',
    name: 'James Wilson',
    age: 57,
    pronouns: 'he/him',
    room: '3A · 307',
    mrn: 'MRN 314587',
    condition: 'Congestive heart failure',
    status: 'Observation',
    allergies: ['Latex', 'Sulfa'],
    lastVisit: 'Today, 07:18',
    color: '#d9efe2',
  },
  {
    id: 'pt-003',
    initials: 'AK',
    name: 'Aisha Khan',
    age: 39,
    pronouns: 'she/her',
    room: '5C · 521',
    mrn: 'MRN 729104',
    condition: 'Pneumonia',
    status: 'Stable',
    allergies: [],
    lastVisit: 'Yesterday, 16:20',
    color: '#f3dded',
  },
  {
    id: 'pt-004',
    initials: 'RB',
    name: 'Robert Brooks',
    age: 71,
    pronouns: 'he/him',
    room: '2D · 204',
    mrn: 'MRN 566280',
    condition: 'Acute kidney injury',
    status: 'Critical',
    allergies: ['NSAIDs'],
    lastVisit: 'Yesterday, 14:05',
    color: '#f7e3c6',
  },
]

const initialNotes: Record<string, Note[]> = {
  'pt-001': [
    {
      id: 'n-101',
      type: 'Progress note',
      title: 'Post-operative day 2',
      author: 'Dr. Sarah Chen',
      role: 'Attending physician',
      date: 'Today',
      time: '08:42',
      body: 'Patient is alert and comfortable. Pain is well controlled with the current regimen. Surgical site is clean, dry, and intact. Tolerating oral intake and ambulating with assistance.',
      signed: true,
    },
    {
      id: 'n-102',
      type: 'Nursing note',
      title: 'Morning assessment',
      author: 'Maya Thompson, RN',
      role: 'Registered nurse',
      date: 'Today',
      time: '06:15',
      body: 'Vital signs stable overnight. Patient reported pain score of 3/10 at 04:00, improved after scheduled analgesia. No nausea or dizziness reported.',
      signed: true,
    },
    {
      id: 'n-103',
      type: 'Consultation',
      title: 'Physical therapy evaluation',
      author: 'Jordan Lee, DPT',
      role: 'Physical therapist',
      date: 'Yesterday',
      time: '15:30',
      body: 'Patient completed bed mobility and transfer training. Ambulated 60 feet with rolling walker and contact guard. Recommend twice-daily mobility sessions.',
      signed: true,
    },
  ],
}

const noteTypes = ['Progress note', 'Nursing note', 'Consultation', 'Discharge summary']

function StatusPill({ status }: { status: Patient['status'] }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>
}

function App() {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id)
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState('Patients')
  const [notes, setNotes] = useState(initialNotes)
  const [showEditor, setShowEditor] = useState(false)
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [noteFilter, setNoteFilter] = useState('All notes')
  const [toast, setToast] = useState('')

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0]
  const patientNotes = notes[selectedPatient.id] ?? []

  const filteredPatients = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return patients
    return patients.filter((patient) =>
      [patient.name, patient.mrn, patient.room, patient.condition]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [query])

  const filteredNotes =
    noteFilter === 'All notes'
      ? patientNotes
      : patientNotes.filter((note) => note.type === noteFilter)

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const addNote = (note: Omit<Note, 'id' | 'author' | 'role' | 'date' | 'time'>) => {
    const now = new Date()
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      author: 'Dr. Sarah Chen',
      role: 'Attending physician',
      date: 'Today',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setNotes((current) => ({
      ...current,
      [selectedPatient.id]: [newNote, ...(current[selectedPatient.id] ?? [])],
    }))
    setShowEditor(false)
    flash(note.signed ? 'Note signed and saved' : 'Draft saved securely')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><HeartPulse size={22} /></span>
          <span>CareNote</span>
          <button className="mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <nav className="primary-nav" aria-label="Primary">
          {[
            ['Overview', LayoutDashboard],
            ['Patients', Users],
            ['Tasks', ClipboardList],
            ['Messages', MessageSquareText],
          ].map(([label, Icon]) => (
            <button
              className={activeView === label ? 'nav-item active' : 'nav-item'}
              key={label as string}
              onClick={() => {
                setActiveView(label as string)
                setMobileNavOpen(false)
                if (label !== 'Patients') flash(`${label} is ready for backend integration`)
              }}
            >
              <Icon size={19} />
              <span>{label as string}</span>
              {label === 'Tasks' && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="security-card">
          <ShieldCheck size={20} />
          <div>
            <strong>Protected workspace</strong>
            <span>Encrypted · Audit logged</span>
          </div>
        </div>
        <nav className="secondary-nav">
          <button className="nav-item" onClick={() => flash('Settings panel coming next')}>
            <Settings size={19} /> Settings
          </button>
          <button className="nav-item" onClick={() => flash('Signed out of demo workspace')}>
            <LogOut size={19} /> Sign out
          </button>
        </nav>
        <div className="profile-card">
          <div className="avatar avatar-dark">SC</div>
          <div>
            <strong>Dr. Sarah Chen</strong>
            <span>Internal Medicine</span>
          </div>
          <MoreHorizontal size={18} />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-title">
            <span>Northstar Medical Center</span>
            <strong>Inpatient care</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications" onClick={() => flash('No new clinical alerts')}>
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <button className="shift-button" onClick={() => flash('Shift schedule synchronized')}>
              <Clock3 size={17} />
              Shift ends 19:00
              <ChevronDown size={15} />
            </button>
          </div>
        </header>

        <div className="workspace">
          <section className="page-heading">
            <div>
              <p className="eyebrow">Clinical workspace</p>
              <h1>Patient notes</h1>
              <p>Review patient history, document care, and coordinate the next step.</p>
            </div>
            <button className="primary-button" onClick={() => setShowNewPatient(true)}>
              <Plus size={18} /> Add patient
            </button>
          </section>

          <section className="stats-grid">
            <article>
              <span className="stat-icon blue"><Users size={20} /></span>
              <div><strong>18</strong><span>Patients assigned</span></div>
              <small>3 new today</small>
            </article>
            <article>
              <span className="stat-icon amber"><ClipboardList size={20} /></span>
              <div><strong>4</strong><span>Notes to complete</span></div>
              <small>2 due this shift</small>
            </article>
            <article>
              <span className="stat-icon green"><Check size={20} /></span>
              <div><strong>12</strong><span>Notes signed</span></div>
              <small>Today</small>
            </article>
          </section>

          <section className="clinical-grid">
            <div className="patient-panel panel">
              <div className="panel-header">
                <div>
                  <h2>My patients</h2>
                  <span>{filteredPatients.length} on this unit</span>
                </div>
                <button className="icon-button" aria-label="Patient list options"><MoreHorizontal size={19} /></button>
              </div>
              <label className="search-box">
                <Search size={17} />
                <input
                  aria-label="Search patients"
                  placeholder="Search name, MRN, room..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <kbd>⌘ K</kbd>
              </label>
              <div className="patient-list">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    className={selectedPatient.id === patient.id ? 'patient-row selected' : 'patient-row'}
                    onClick={() => setSelectedPatientId(patient.id)}
                  >
                    <span className="avatar" style={{ background: patient.color }}>{patient.initials}</span>
                    <span className="patient-row-copy">
                      <span className="patient-name-line">
                        <strong>{patient.name}</strong>
                        <StatusPill status={patient.status} />
                      </span>
                      <span>{patient.room} · {patient.condition}</span>
                      <small>{patient.lastVisit}</small>
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))}
                {filteredPatients.length === 0 && (
                  <div className="empty-state">
                    <Search size={24} />
                    <strong>No patients found</strong>
                    <span>Try a name, room, or medical record number.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="record-panel panel">
              <div className="patient-summary">
                <div className="avatar avatar-large" style={{ background: selectedPatient.color }}>
                  {selectedPatient.initials}
                </div>
                <div className="patient-heading">
                  <div>
                    <h2>{selectedPatient.name}</h2>
                    <span>{selectedPatient.age} years · {selectedPatient.pronouns}</span>
                  </div>
                  <StatusPill status={selectedPatient.status} />
                </div>
                <button className="icon-button"><MoreHorizontal size={19} /></button>
              </div>
              <div className="patient-metadata">
                <div><span>Location</span><strong>{selectedPatient.room}</strong></div>
                <div><span>Medical record</span><strong>{selectedPatient.mrn}</strong></div>
                <div>
                  <span>Allergies</span>
                  <strong className={selectedPatient.allergies.length ? 'allergy' : ''}>
                    {selectedPatient.allergies.length ? selectedPatient.allergies.join(', ') : 'None recorded'}
                  </strong>
                </div>
              </div>

              <div className="record-toolbar">
                <div className="tabs" role="tablist">
                  <button className="tab active">Notes <span>{patientNotes.length}</span></button>
                  <button className="tab" onClick={() => flash('Results view ready for integration')}>Results</button>
                  <button className="tab" onClick={() => flash('Medication view ready for integration')}>Medications</button>
                </div>
                <button className="primary-button compact" onClick={() => setShowEditor(true)}>
                  <Plus size={17} /> New note
                </button>
              </div>

              <div className="note-controls">
                <div className="segmented-control">
                  {['All notes', ...noteTypes.slice(0, 2)].map((type) => (
                    <button
                      key={type}
                      className={noteFilter === type ? 'active' : ''}
                      onClick={() => setNoteFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <button className="sort-button">Newest first <ChevronDown size={14} /></button>
              </div>

              <div className="notes-timeline">
                {filteredNotes.map((note) => (
                  <article className="note-card" key={note.id}>
                    <div className="timeline-marker">
                      <span><FileText size={16} /></span>
                    </div>
                    <div className="note-content">
                      <div className="note-topline">
                        <span className="note-type">{note.type}</span>
                        <span>{note.date}, {note.time}</span>
                        <button aria-label="Note actions"><MoreHorizontal size={18} /></button>
                      </div>
                      <h3>{note.title}</h3>
                      <p>{note.body}</p>
                      <div className="note-footer">
                        <span className="mini-avatar">SC</span>
                        <div><strong>{note.author}</strong><span>{note.role}</span></div>
                        {note.signed && <span className="signed"><LockKeyhole size={13} /> Signed</span>}
                      </div>
                    </div>
                  </article>
                ))}
                {filteredNotes.length === 0 && (
                  <div className="notes-empty">
                    <FileText size={26} />
                    <strong>No {noteFilter.toLowerCase()} yet</strong>
                    <button onClick={() => setShowEditor(true)}>Create the first note</button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {showEditor && (
        <NoteEditor
          patient={selectedPatient}
          onClose={() => setShowEditor(false)}
          onSave={addNote}
        />
      )}

      {showNewPatient && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal small-modal" role="dialog" aria-modal="true" aria-labelledby="new-patient-title">
            <button className="modal-close" aria-label="Close" onClick={() => setShowNewPatient(false)}><X size={20} /></button>
            <span className="modal-symbol"><Users size={23} /></span>
            <h2 id="new-patient-title">Add a patient</h2>
            <p>Patient registration connects to the hospital ADT feed in a production workspace.</p>
            <label>Medical record number<input placeholder="Enter MRN" /></label>
            <button className="primary-button full" onClick={() => {
              setShowNewPatient(false)
              flash('Demo mode: connect the ADT feed to add patients')
            }}>Find patient</button>
          </div>
        </div>
      )}

      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
    </div>
  )
}

function NoteEditor({
  patient,
  onClose,
  onSave,
}: {
  patient: Patient
  onClose: () => void
  onSave: (note: Omit<Note, 'id' | 'author' | 'role' | 'date' | 'time'>) => void
}) {
  const [type, setType] = useState(noteTypes[0])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [section, setSection] = useState('Subjective')

  const canSave = title.trim().length > 2 && body.trim().length > 5
  const save = (signed: boolean) => {
    if (!canSave) return
    onSave({ type, title, body, signed })
  }

  return (
    <div className="editor-backdrop">
      <section className="note-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <header className="editor-header">
          <button className="icon-button" onClick={onClose} aria-label="Close editor"><ChevronLeft size={20} /></button>
          <div>
            <span>New clinical note</span>
            <strong id="editor-title">{patient.name}</strong>
          </div>
          <div className="editor-status"><span className="save-dot" /> Saved locally</div>
          <button className="secondary-button" disabled={!canSave} onClick={() => save(false)}>Save draft</button>
          <button className="primary-button compact" disabled={!canSave} onClick={() => save(true)}>Sign note</button>
        </header>
        <div className="editor-body">
          <aside className="editor-sidebar">
            <div className="editor-patient">
              <span className="avatar" style={{ background: patient.color }}>{patient.initials}</span>
              <div><strong>{patient.name}</strong><span>{patient.mrn}</span></div>
            </div>
            <p className="editor-label">Note outline</p>
            {['Subjective', 'Objective', 'Assessment', 'Plan'].map((item, index) => (
              <button
                key={item}
                className={section === item ? 'outline-item active' : 'outline-item'}
                onClick={() => setSection(item)}
              >
                <span>{index + 1}</span>{item}
                {section === item && <Check size={15} />}
              </button>
            ))}
            <div className="template-card">
              <Sparkles size={18} />
              <strong>Smart template</strong>
              <span>SOAP note structure applied</span>
            </div>
          </aside>
          <div className="editor-canvas">
            <div className="editor-fields">
              <label>
                Note type
                <select value={type} onChange={(event) => setType(event.target.value)}>
                  {noteTypes.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>
                Service date
                <div className="input-with-icon"><CalendarDays size={17} /><input value="Today" readOnly /></div>
              </label>
            </div>
            <label className="title-field">
              Title
              <input
                autoFocus
                placeholder="Briefly describe this encounter"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <div className="section-heading">
              <div><span>Current section</span><h2>{section}</h2></div>
              <button className="ai-button" onClick={() => setBody((current) => current || 'Patient reports continued improvement with pain controlled on the current regimen. Denies nausea, dizziness, or shortness of breath.')}>
                <Sparkles size={16} /> Draft from visit
              </button>
            </div>
            <div className="format-bar">
              <button><strong>B</strong></button><button><em>I</em></button><span />
              <button>• List</button><button>1. List</button>
            </div>
            <textarea
              aria-label="Clinical note body"
              placeholder={`Document the ${section.toLowerCase()} findings here...`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <div className="privacy-notice">
              <LockKeyhole size={15} />
              This draft is encrypted and visible only to the care team.
            </div>
          </div>
          <aside className="editor-context">
            <p className="editor-label">Patient context</p>
            <div className="context-card">
              <span>Primary concern</span><strong>{patient.condition}</strong>
            </div>
            <div className="context-card">
              <span>Allergies</span>
              <strong className={patient.allergies.length ? 'allergy' : ''}>
                {patient.allergies.length ? patient.allergies.join(', ') : 'None recorded'}
              </strong>
            </div>
            <div className="context-card">
              <span>Latest vitals</span>
              <div className="vitals"><strong>118/76</strong><small>BP</small><strong>72</strong><small>HR</small></div>
            </div>
            <button className="context-link"><Activity size={16} /> View full chart <ChevronRight size={15} /></button>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default App
