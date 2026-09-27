(function () {
  'use strict';

  const state = {
    token: sessionStorage.getItem('admin_token') || null,
    user: null,
    licenses: [],
    activeView: 'licenses',
    lastToken: '',
    lastClient: '',
    bootAuthCheck: false,
  };

  const $ = (id) => document.getElementById(id);

  function hasClass(el, cls) {
    return el && el.classList.contains(cls);
  }

  function showToast(message, type) {
    const toast = $('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success');
    toast.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }

  function todayIsoPrefix() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function formatDate(value) {
    try {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return value || '-';
    }
  }

  function isExpired(license) {
    return new Date(license.expires_at) < new Date();
  }

  function statusOf(license) {
    return isExpired(license) ? 'expired' : 'active';
  }

  async function api(path, options) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers.Authorization = 'Bearer ' + state.token;
    const res = await fetch(path, Object.assign({}, options, { headers }));
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.status = res.status;
      if (res.status === 401 && path !== '/api/login') {
        err.sessionExpired = true;
        if (!state.bootAuthCheck) sessionExpired();
      }
      throw err;
    }
    return data;
  }

  function clearSession() {
    state.token = null;
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token');
    renderVerifyResultReset();
  }

  function sessionExpired() {
    clearSession();
    showLogin();
    showToast('Your session has expired. Please sign in again.');
  }

  function showLogin() {
    $('login-view').hidden = false;
    $('dashboard-view').hidden = true;
  }

  function showDashboard() {
    $('login-view').hidden = true;
    $('dashboard-view').hidden = false;
  }

  function setUser(username) {
    state.user = username;
    $('signed-user').textContent = username;
  }

  async function loadCurrentUser() {
    try {
      const data = await api('/api/auth/me');
      setUser(data.user.username);
      return true;
    } catch {
      return false;
    }
  }

  function renderLicenses() {
    const count = $('license-count');
    const loading = $('licenses-loading');
    const empty = $('licenses-empty');
    const wrap = $('licenses-table-wrap');
    const tbody = $('licenses-table');

    count.textContent = state.licenses.length;

    if (state.licenses.length > 0) {
      loading.hidden = true;
      empty.hidden = true;
      wrap.hidden = false;
      tbody.innerHTML = '';
      state.licenses.forEach((license) => {
        const tr = document.createElement('tr');
        const status = statusOf(license);
        const statusLabel = status === 'active' ? 'Active' : 'Expired';

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '6px';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-secondary';
        copyBtn.style.cssText = 'font-size:11px;padding:4px 8px';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
          copyText(license.token);
          showToast('Token copied to clipboard!');
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.style.cssText = 'font-size:11px;padding:4px 8px';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteLicense(license));

        actions.appendChild(copyBtn);
        actions.appendChild(deleteBtn);

        tr.innerHTML =
          '<td><strong></strong></td>' +
          '<td><span class="badge badge-standard">Standard</span></td>' +
          '<td><span class="badge badge-' + status + '">' + statusLabel + '</span></td>' +
          '<td>' + formatDate(license.expires_at) + '</td>';
        tr.querySelector('td strong').textContent = license.client_id;
        const lastTd = document.createElement('td');
        lastTd.appendChild(actions);
        tr.appendChild(lastTd);
        tbody.appendChild(tr);
      });
    } else {
      loading.hidden = true;
      wrap.hidden = true;
      empty.hidden = false;
    }
  }

  async function loadLicenses() {
    const loading = $('licenses-loading');
    loading.hidden = false;
    $('licenses-empty').hidden = true;
    try {
      const data = await api('/api/licenses/list');
      state.licenses = data.licenses || [];
    } catch (err) {
      state.licenses = [];
      if (!err.sessionExpired) showToast(err.message, 'error');
    } finally {
      loading.hidden = true;
      renderLicenses();
    }
  }

  async function deleteLicense(license) {
    if (!window.confirm('Delete this license? This cannot be undone.')) return;
    try {
      await api('/api/licenses/delete', {
        method: 'POST',
        body: JSON.stringify({ license_id: license.license_id }),
      });
      state.licenses = state.licenses.filter((l) => l.license_id !== license.license_id);
      renderLicenses();
      showToast('License deleted');
    } catch (err) {
      if (!err.sessionExpired) showToast(err.message, 'error');
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }

  function openGenerate() {
    const formWrap = $('generate-form-wrap');
    const genWrap = $('generated-wrap');
    formWrap.hidden = false;
    genWrap.hidden = true;
    $('gen-client').value = state.lastClient;
    $('gen-client').focus();
    $('gen-duration').value = '30';
    $('gen-date').value = '';
    $('custom-date-wrap').hidden = true;
    $('generate-modal').hidden = false;
  }

  function closeGenerate() {
    $('generate-modal').hidden = true;
  }

  function onDurationChange() {
    const selected = $('gen-duration').value;
    const wrap = $('custom-date-wrap');
    wrap.hidden = selected !== 'custom';
    $('gen-date').value = selected === 'custom' ? todayIsoPrefix() : $('gen-date').value;
  }

  async function generateLicense(e) {
    e.preventDefault();
    const btn = $('generate-btn');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    try {
      const client_id = $('gen-client').value.trim();
      const duration = $('gen-duration').value;
      const payload = { client_id: client_id };
      if (duration === 'custom') {
        const date = $('gen-date').value;
        if (!date) throw new Error('Pick a custom expiry date');
        payload.custom_date = date;
      } else {
        payload.duration = duration;
      }
      const data = await api('/api/licenses/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      state.lastClient = client_id;
      state.lastToken = data.license.token;
      $('gen-token').textContent = data.license.token;
      $('generate-form-wrap').hidden = true;
      $('generated-wrap').hidden = false;
      showToast('License generated successfully!');
      await loadLicenses();
    } catch (err) {
      if (!err.sessionExpired) showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate';
    }
  }

  function downloadLic() {
    if (!state.lastToken) return;
    const blob = new Blob([state.lastToken], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (state.lastClient || 'construction-os') + '.lic';
    a.click();
    URL.revokeObjectURL(url);
    showToast('License file downloaded!');
  }

  async function verifyLicense() {
    const token = $('verify-token').value.trim();
    if (!token) return;
    const btn = $('verify-btn');
    btn.disabled = true;
    btn.textContent = 'Verifying...';
    try {
      const res = await fetch('/api/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      });
      const data = await res.json();
      renderVerifyResult(res.ok ? data : { valid: false, error: data.error || 'Verification failed' });
    } catch {
      renderVerifyResult({ valid: false, error: 'Network error' });
    } finally {
      btn.disabled = false;
      btn.textContent = 'Verify License';
    }
  }

  function verifyItem(label, value, extraClass) {
    return (
      '<div class="verify-item">' +
      '<span class="verify-label">' + label + '</span>' +
      '<span class="verify-value ' + (extraClass || '') + '"></span>' +
      '</div>'
    );
  }

  function renderVerifyResult(data) {
    const result = $('verify-result');
    result.hidden = false;
    result.className = 'verify-result ' + (data.valid ? 'valid' : 'invalid');

    if (data.valid) {
      const icon = data.expired ? '&#9888;' : '&#10003;';
      const statusClass = data.expired ? 'text-red' : 'text-green';
      result.innerHTML =
        '<div class="verify-header">' +
        '<span class="verify-icon">' + icon + '</span>' +
        '<strong>' + (data.expired ? 'Expired License' : 'Valid License') + '</strong>' +
        '</div>' +
        '<div class="verify-grid">' +
        verifyItem('Client') +
        verifyItem('Plan') +
        verifyItem('Status') +
        verifyItem('Expires') +
        verifyItem('Remaining') +
        verifyItem('Issued') +
        verifyItem('License ID') +
        '</div>';
      result.querySelectorAll('.verify-value')[0].textContent = data.client_id || '-';
      result.querySelectorAll('.verify-value')[1].textContent = data.plan_type || '-';
      result.querySelectorAll('.verify-value')[2].textContent = data.expired ? 'Expired' : 'Active';
      result.querySelectorAll('.verify-value')[2].className = 'verify-value ' + statusClass;
      result.querySelectorAll('.verify-value')[3].textContent = formatDate(data.expires_at);
      result.querySelectorAll('.verify-value')[4].textContent = data.expired ? '0 days' : data.remaining_days + ' days';
      result.querySelectorAll('.verify-value')[5].textContent = formatDate(data.issued_at);
      result.querySelectorAll('.verify-value')[6].textContent = data.license_id || '-';
    } else {
      result.innerHTML =
        '<div class="verify-header">' +
        '<span class="verify-icon">&#10007;</span>' +
        '<strong>Invalid License</strong>' +
        '</div>' +
        '<p class="helper-text" style="margin-bottom:0">' + (data.error || 'Could not verify license') + '</p>';
    }
  }

  function switchView(view) {
    state.activeView = view;
    document.querySelectorAll('.sidebar-nav li').forEach((li) => {
      li.classList.toggle('active', li.dataset.view === view);
    });
    $('page-title').textContent = view === 'licenses' ? 'Issued Licenses' : 'Verify License';
    $('licenses-view').hidden = view !== 'licenses';
    $('verify-view').hidden = view !== 'verify';
    $('open-generate-btn').style.display = view === 'licenses' ? '' : 'none';
    if (view === 'licenses') loadLicenses();
  }

  function bindEvents() {
    $('login-form').addEventListener('submit', onLogin);
    $('signout-btn').addEventListener('click', signOut);
    $('open-generate-btn').addEventListener('click', openGenerate);
    $('close-generate-btn').addEventListener('click', closeGenerate);
    $('close-generated-btn').addEventListener('click', closeGenerate);
    $('generate-modal').addEventListener('click', (e) => {
      if (e.target === $('generate-modal')) closeGenerate();
    });
    $('gen-duration').addEventListener('change', onDurationChange);
    $('generate-form').addEventListener('submit', generateLicense);
    $('copy-token-btn').addEventListener('click', () => {
      copyText(state.lastToken);
      showToast('Token copied to clipboard!');
    });
    $('download-lic-btn').addEventListener('click', downloadLic);
    $('verify-btn').addEventListener('click', verifyLicense);
    document.querySelectorAll('.sidebar-nav li').forEach((li) => {
      li.addEventListener('click', () => switchView(li.dataset.view));
    });
  }

  async function onLogin(e) {
    e.preventDefault();
    const username = $('username').value.trim();
    const password = $('password').value;
    const btn = $('login-btn');
    const errorEl = $('login-error');
    errorEl.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    try {
      const data = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username: username, password: password }),
      });
      state.token = data.token;
      sessionStorage.setItem('admin_token', data.token);
      setUser(data.user.username);
      showDashboard();
      switchView('licenses');
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  }

  function signOut() {
    clearSession();
    $('password').value = '';
    showLogin();
  }

  function renderVerifyResultReset() {
    const result = $('verify-result');
    result.hidden = true;
    result.innerHTML = '';
  }

  async function init() {
    bindEvents();
    onDurationChange();
    let authenticated = false;
    if (state.token) {
      state.bootAuthCheck = true;
      try {
        authenticated = await loadCurrentUser();
      } catch {
        authenticated = false;
      } finally {
        state.bootAuthCheck = false;
      }
    }
    if (authenticated) {
      showDashboard();
      switchView('licenses');
    } else {
      clearSession();
      showLogin();
    }
  }

  init();
})();