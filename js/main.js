// main.js - client-side logic using localStorage/sessionStorage
const STORAGE_KEY = 'shreek_clients_v2';
const SESSION_KEY = 'shreek_session_v2';

// Helpers
function uid() { return 'c_' + Math.random().toString(36).slice(2, 9); }
function loadClients() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveClients(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function planDiscount(plan) { return plan === 'silver' ? 10 : plan === 'gold' ? 15 : plan === 'basic' ? 5 : 0; }
const $ = id => document.getElementById(id);

// Show Client Dashboard
function showClientDashboard(id) {
  const clients = loadClients();
  const user = clients.find(c => c.id === id);
  if (!user) return;

  const sec = $('clientDashboard'); if (!sec) return;
  const info = $('clientInfo');
  if (info) {
    info.innerHTML = `
      <h5>${user.name} <small class="text-muted">(${user.plan || 'No membership'})</small></h5>
      <p><strong>Email:</strong> ${user.email}<br>
      <strong>Phone:</strong> ${user.phone}<br>
      <strong>Address:</strong> ${user.address || '-'}</p>
      <p><strong>Member Discount:</strong> ${planDiscount(user.plan)}%</p>
    `;
  }

  const histContainer = $('clientHistory');
  const hist = user.history && user.history.length
    ? user.history.map(h => `<div class="p-2 border rounded mb-2">${h}</div>`).join('')
    : '<div class="text-muted">No history yet.</div>';
  if (histContainer) histContainer.innerHTML = hist;

  sec.classList.remove('d-none');
  window.scrollTo({ top: sec.offsetTop - 20, behavior: 'smooth' });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Set current year
  const y = $('year'); if (y) y.textContent = new Date().getFullYear();

  // Restore session
  const s = sessionStorage.getItem(SESSION_KEY);
  if (s) {
    try {
      const obj = JSON.parse(s);
      showClientDashboard(obj.id);
    } catch { }
  }

  // Modal triggers
  if ($('openRegister')) $('openRegister').addEventListener('click', () => new bootstrap.Modal($('modalRegister')).show());
  if ($('openLogin')) $('openLogin').addEventListener('click', () => new bootstrap.Modal($('modalLogin')).show());
  if ($('joinNow')) $('joinNow').addEventListener('click', () => new bootstrap.Modal($('modalRegister')).show());
  if ($('joinBasic')) $('joinBasic').addEventListener('click', () => { if ($('regPlan')) $('regPlan').value = 'basic'; new bootstrap.Modal($('modalRegister')).show(); });
  if ($('joinSilver')) $('joinSilver').addEventListener('click', () => { if ($('regPlan')) $('regPlan').value = 'silver'; new bootstrap.Modal($('modalRegister')).show(); });
  if ($('joinGold')) $('joinGold').addEventListener('click', () => { if ($('regPlan')) $('regPlan').value = 'gold'; new bootstrap.Modal($('modalRegister')).show(); });

  // Register Form
  const registerForm = $('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('regName').value.trim();
      const email = $('regEmail').value.trim().toLowerCase();
      const phone = $('regPhone').value.trim();
      const plan = $('regPlan').value;
      const pass = $('regPassword').value;

      const clients = loadClients();
      if (clients.find(c => c.email === email)) return;

      const client = { id: uid(), name, email, phone, address: '', plan, password: pass, joined: new Date().toISOString(), history: [] };
      clients.push(client);
      saveClients(clients);
      new bootstrap.Modal($('modalRegister')).hide();
      registerForm.reset();
    });
  }

  // Login Form
  const loginForm = $('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('loginEmail').value.trim().toLowerCase();
      const pass = $('loginPassword').value;

      const clients = loadClients();
      const user = clients.find(c => c.email === email && c.password === pass);
      if (!user) return;

      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, email: user.email }));
      new bootstrap.Modal($('modalLogin')).hide();
      showClientDashboard(user.id);
    });
  }

  // Service Request Form
  const reqForm = $('requestForm');
  if (reqForm) {
    reqForm.addEventListener('submit', e => {
      e.preventDefault();
      const n = $('reqName').value.trim();
      const c = $('reqContact').value.trim();
      const s1 = $('reqService').value;
      const d = $('reqDetails').value.trim();

      const clients = loadClients();
      const matched = clients.find(cli => cli.email === c || cli.phone === c);
      const note = `${new Date().toLocaleString()}: ${s1} — ${d} (Contact: ${c})`;

      if (matched) {
        matched.history.push(note);
        saveClients(clients);
      }

      reqForm.reset();
    });
  }

  // Logout button
  if ($('logoutClient')) {
    $('logoutClient').addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      const dash = $('clientDashboard'); if (dash) dash.classList.add('d-none');
      location.reload();
    });
  }
});

// Admin helpers
function getAllClients() { return loadClients(); }
function exportClientsCSV() {
  const clients = loadClients();
  if (!clients.length) return;

  const rows = [['id', 'name', 'email', 'phone', 'plan', 'joined']];
  clients.forEach(c => rows.push([c.id, c.name, c.email, c.phone, c.plan, c.joined]));
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'clients.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// Sample seed
function seedSample() {
  if (loadClients().length) return;
  const s = [{
    id: uid(),
    name: 'Krishana',
    email: 'krishana@example.com',
    phone: '9779767990237',
    address: 'Chabahil',
    plan: 'gold',
    password: 'pass123',
    joined: new Date().toISOString(),
    history: ['Registered']
  }];
  saveClients(s);
}