import React from 'https://esm.sh/react@18.3.1?dev';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1?dev';

const STORAGE_KEY = 'barberSalonQueue';

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // ignore storage failures
  }
}

function nextTicketNumber(counter) {
  return `U${String(counter).padStart(3, '0')}`;
}

function App() {
  const saved = React.useMemo(() => loadState(), []);
  const [queue, setQueue] = React.useState(saved?.queue ?? []);
  const [current, setCurrent] = React.useState(saved?.current ?? null);
  const [nextTicket, setNextTicket] = React.useState(saved?.nextTicket ?? 1);
  const [newCustomer, setNewCustomer] = React.useState('');
  const [newService, setNewService] = React.useState('Haircut');
  const [observerName, setObserverName] = React.useState('');
  const [staffMode, setStaffMode] = React.useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
  const [staffPassword, setStaffPassword] = React.useState('');
  const [notice, setNotice] = React.useState('Welcome! Add a customer to the queue or check your status.');
  const adminMenuRef = React.useRef(null);

  React.useEffect(() => {
    saveState({ queue, current, nextTicket });
  }, [queue, current, nextTicket]);

  React.useEffect(() => {
    if (!adminMenuOpen) return undefined;

    const handleClickOutside = event => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminMenuOpen]);

  const waitingCount = queue.length;

  const addCustomer = () => {
    const trimmed = newCustomer.trim();
    if (!trimmed) {
      setNotice('Enter a customer name before adding to the queue.');
      return;
    }

    const alreadyWaiting = queue.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (current && current.name.toLowerCase() === trimmed.toLowerCase()) {
      setNotice(`\u201c${trimmed}\u201d is already being served.`);
      return;
    }
    if (alreadyWaiting) {
      setNotice(`\u201c${trimmed}\u201d is already in the queue.`);
      return;
    }

    const ticket = nextTicketNumber(nextTicket);
    const nextCustomer = { id: Date.now().toString(), name: trimmed, ticket, service: newService };
    setQueue(prev => [...prev, nextCustomer]);
    setNextTicket(prev => prev + 1);
    setNewCustomer('');
    setNewService('Haircut');
    setNotice(`Added ${trimmed} (${ticket}) for ${newService} to the waiting list.`);
  };

  const callNext = () => {
    if (current) {
      setNotice(`Finish serving ${current.name} before calling the next customer.`);
      return;
    }
    if (queue.length === 0) {
      setNotice('No customers are waiting right now.');
      return;
    }

    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    setNotice(`Now serving ${next.name} (${next.ticket}).`);
  };

  const finishService = () => {
    if (!current) {
      setNotice('No customer is currently being served.');
      return;
    }
    const finishedName = current.name;
    setCurrent(null);
    setNotice(`${finishedName} has finished service. Ready to call the next customer.`);
  };

  const clearQueue = () => {
    if (!window.confirm('Clear the entire queue and reset the system?')) {
      return;
    }
    setQueue([]);
    setCurrent(null);
    setNextTicket(1);
    setNotice('Queue cleared. Ready for new customers.');
    setObserverName('');
    setStaffMode(false);
    setStaffPassword('');
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const toggleAdminMenu = () => {
    setAdminMenuOpen(prev => !prev);
    setNotice('Admin login menu toggled.');
  };

  const enterStaffMode = () => {
    if (staffPassword.trim() === 'UH2026') {
      setStaffMode(true);
      setAdminMenuOpen(false);
      setStaffPassword('');
      setNotice('Staff mode enabled. You can now add customers.');
    } else {
      setNotice('Wrong staff code.');
    }
  };

  const exitStaffMode = () => {
    setStaffMode(false);
    setNotice('Staff mode disabled. Add controls are hidden.');
  };

  const observerStatus = () => {
    const trimmed = observerName.trim();
    if (!trimmed) {
      return 'Enter your name to see your place in line.';
    }
    if (current && current.name.toLowerCase() === trimmed.toLowerCase()) {
      return `It is your turn now, ${trimmed}! Please step up to the chair.`;
    }
    const position = queue.findIndex(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (position === -1) {
      return `${trimmed} is not in the queue yet.`;
    }
    const beforeCount = position;
    return `Hello ${trimmed}, there ${beforeCount === 1 ? 'is 1 customer' : `are ${beforeCount} customers`} ahead of you.`;
  };

  return (
    React.createElement('div', null,
      React.createElement('header', null,
        React.createElement('div', { className: 'brand-bar' },
          React.createElement('span', { className: 'brand-badge' }, 'UH'),
          React.createElement('div', { className: 'brand-copy' },
            React.createElement('h1', null, 'Unique Haircut Queue'),
            React.createElement('p', null, 'Premium queue management for salon guests and stylists.')
          )
        ),
        React.createElement('div', { className: 'admin-menu-container', ref: adminMenuRef },
          React.createElement('button', { type: 'button', className: 'admin-login-btn', onClick: toggleAdminMenu }, 'Admin'),
          adminMenuOpen && React.createElement('div', { className: 'admin-menu' },
            React.createElement('input', {
              type: 'password',
              value: staffPassword,
              onChange: e => setStaffPassword(e.target.value),
              placeholder: 'Staff code',
              className: 'staff-password',
            }),
            React.createElement('button', { type: 'button', className: 'primary', onClick: enterStaffMode }, 'Login')
          )
        )
      ),
      React.createElement('div', { className: 'grid grid-2' },
        React.createElement('section', { className: 'card control-card' },
          React.createElement('h2', null, 'Queue Control'),
          React.createElement('div', { className: 'status' },
            React.createElement('div', null,
              React.createElement('strong', null, 'Now serving'),
              React.createElement('div', null, current ? `${current.ticket} — ${current.name} (${current.service})` : 'No one right now')
            ),
            React.createElement('div', null,
              React.createElement('strong', null, 'Waiting customers'),
              React.createElement('div', null, waitingCount)
            )
          ),
          staffMode && React.createElement('div', { className: 'staff-banner' },
            React.createElement('span', null, 'Staff mode active: add customers and manage the queue.'),
            React.createElement('button', { type: 'button', className: 'secondary', onClick: exitStaffMode }, 'Exit Staff Mode')
          ),
          staffMode && React.createElement('div', { style: { marginTop: '18px' } },
            React.createElement('label', null, 'Customer name'),
            React.createElement('input', {
              value: newCustomer,
              onChange: e => setNewCustomer(e.target.value),
              placeholder: 'Enter a customer name',
            }),
            React.createElement('label', null, 'Service type'),
            React.createElement('select', {
              value: newService,
              onChange: e => setNewService(e.target.value),
            },
              React.createElement('option', { value: 'Haircut' }, 'Haircut'),
              React.createElement('option', { value: 'Beard Trim' }, 'Beard Trim'),
              React.createElement('option', { value: 'Style & Finish' }, 'Style & Finish'),
              React.createElement('option', { value: 'Line-Up' }, 'Line-Up')
            ),
            React.createElement('div', { className: 'button-row' },
              React.createElement('button', { type: 'button', className: 'primary', onClick: addCustomer }, 'Add to Queue'),
              React.createElement('button', { type: 'button', className: 'secondary', onClick: callNext }, 'Call Next'),
              React.createElement('button', { type: 'button', className: 'danger', onClick: finishService }, 'Finish Service')
            ),
            React.createElement('button', { type: 'button', className: 'secondary', onClick: clearQueue, style: { marginTop: '12px' } }, 'Clear Queue')
          )
        ),
        React.createElement('section', { className: 'card' },
          React.createElement('h2', null, 'Customer Status'),
          React.createElement('div', { className: 'status' },
            React.createElement('label', null, 'Your name'),
            React.createElement('input', {
              value: observerName,
              onChange: e => setObserverName(e.target.value),
              placeholder: 'Type your name to check your status',
            }),
            React.createElement('div', { className: 'message-box' }, observerStatus())
          )
        )
      ),
      React.createElement('section', { className: 'card list-card' },
        React.createElement('h2', null, 'Waiting List'),
        queue.length === 0
          ? React.createElement('div', { className: 'empty-state' }, 'No waiting customers yet. Add someone to the queue.')
          : queue.map((customer, index) => (
            React.createElement('div', { key: customer.id, className: 'list-item' },
              React.createElement('div', null,
                React.createElement('span', null, `${index + 1}. ${customer.ticket} — ${customer.name}`),
                React.createElement('small', null, customer.service)
              ),
              React.createElement('span', null, `${index + 1 === 1 ? 'Next' : `#${index + 1}`}`)
            )
          ))
      ),
      React.createElement('section', { className: 'showcase' },
        React.createElement('div', {
          className: 'showcase-card',
          style: { backgroundImage: 'url(https://images.unsplash.com/photo-1502378735452-bc7d86632805?auto=format&fit=crop&w=1400&q=80)' }
        },
          React.createElement('div', { className: 'overlay' },
            React.createElement('h3', null, 'Textured Fade'),
            React.createElement('p', null, 'A modern African textured fade with crisp edges and defined top for a sharp look.')
          )
        ),
        React.createElement('div', {
          className: 'showcase-card',
          style: { backgroundImage: 'url(https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1400&q=80)' }
        },
          React.createElement('div', { className: 'overlay' },
            React.createElement('h3', null, 'Classic Taper'),
            React.createElement('p', null, 'A timeless men’s taper haircut with polished sides and a neat, refined top.')
          )
        )
      )
    )
  );
}

const container = document.getElementById('root');
ReactDOM.createRoot(container).render(React.createElement(App));
