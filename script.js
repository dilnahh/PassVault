/**
 * ==============================================================================
 * PROJECT: PASSWORD STORAGE & VERIFICATION USING SHA-256
 * FILE: script.js
 * PURPOSE: Demonstrates client-side cryptographic hashing with Web Crypto API
 *          and secure hash-based authentication without storing plaintext passwords.
 * ==============================================================================
 * 
 * VIVA & PRESENTATION CONCEPTS EXPLAINED IN CODE:
 * 
 * 1. WHAT IS HASHING?
 *    Hashing is a one-way mathematical algorithm that converts input data of any size
 *    into a fixed-length string of bytes (digest). Unlike encryption, hashing is 
 *    IRREVERSIBLE: there is no key to decrypt it back to the original password.
 * 
 * 2. WHAT IS SHA-256?
 *    Secure Hash Algorithm 2 (256-bit), developed by the NIST and NSA. It takes an
 *    arbitrary string and produces an exact 256-bit (32-byte / 64 hexadecimal characters)
 *    unique digest. Even changing a single character completely alters the hash
 *    (known as the "Avalanche Effect").
 * 
 * 3. WHY STORE ONLY HASHES?
 *    If an attacker breaches the storage (database or localStorage), they only obtain
 *    one-way hashes. Without the actual plaintext password, the stolen records cannot
 *    directly be used to log in on other websites (preventing credential stuffing).
 * 
 * 4. HOW LOGIN VERIFICATION WORKS:
 *    Instead of decrypting the stored password, the system hashes the newly entered
 *    password during login. If hash(entered_password) === stored_hash, authentication
 *    succeeds!
 * ==============================================================================
 */

// Key used to store the user accounts array in browser localStorage
const STORAGE_KEY = 'sha256_registered_users';

/**
 * Computes the SHA-256 hash of a plaintext string using the native Web Crypto API.
 * 
 * @param {string} password - The plaintext password to hash
 * @returns {Promise<string>} - The resulting 64-character hexadecimal hash
 */
async function hashPassword(password) {
  // Step 1: Convert the plain text string into a Uint8Array of bytes using UTF-8 encoding
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Step 2: Use crypto.subtle.digest() with the standard 'SHA-256' algorithm
  // This executes a cryptographic digest inside the browser engine
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Step 3: Convert the resulting ArrayBuffer into a byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Step 4: Convert each 8-bit byte (0-255) to a 2-character hexadecimal string (00 to ff)
  // Example: byte 14 -> "0e", byte 255 -> "ff"
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  // The output is always exactly 64 hexadecimal characters
  return hashHex;
}

/**
 * Retrieves all stored user records from localStorage.
 * Format: [ { "username": "student", "passwordHash": "..." }, ... ]
 * 
 * @returns {Array<{username: string, passwordHash: string}>}
 */
function getStoredUsers() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error('Failed to parse users from localStorage:', error);
    return [];
  }
}

/**
 * Saves the user records array back to localStorage.
 * IMPORTANT: The original password is NEVER included in this object.
 * 
 * @param {Array<{username: string, passwordHash: string}>} users
 */
function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Displays an inline status message inside a designated message container.
 * 
 * @param {string} elementId - ID of the message container element
 * @param {string} text - Message text to display
 * @param {'success' | 'error' | 'info'} type - Visual styling type
 */
function showMessage(elementId, text, type = 'info') {
  const container = document.getElementById(elementId);
  if (!container) return;

  container.className = `alert-box alert-${type}`;
  container.innerHTML = `
    <span class="alert-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="alert-text">${text}</span>
  `;
  container.style.display = 'flex';
}

/**
 * Clears an inline status message.
 * 
 * @param {string} elementId - ID of the message container element
 */
function clearMessage(elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.style.display = 'none';
  container.className = 'alert-box';
  container.innerHTML = '';
}

// ==============================================================================
// REGISTRATION FORM LOGIC (register.html)
// ==============================================================================
function initRegistrationPage() {
  const registerForm = document.getElementById('registerForm');
  const passwordInput = document.getElementById('regPassword');
  const liveHashDisplay = document.getElementById('liveHashPreview');

  if (!registerForm) return;

  // Real-time educational hash preview: demonstrates hashing as you type!
  if (passwordInput && liveHashDisplay) {
    passwordInput.addEventListener('input', async (e) => {
      const val = e.target.value;
      if (val.length === 0) {
        liveHashDisplay.textContent = 'Hash will appear here as you type...';
        liveHashDisplay.classList.remove('has-hash');
      } else {
        const hash = await hashPassword(val);
        liveHashDisplay.textContent = hash;
        liveHashDisplay.classList.add('has-hash');
      }
    });
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage('registerMessage');

    const usernameInput = document.getElementById('regUsername');
    const confirmPasswordInput = document.getElementById('regConfirmPassword');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 1. Validation: Ensure all fields are filled
    if (!username || !password || !confirmPassword) {
      showMessage('registerMessage', 'All fields are required.', 'error');
      return;
    }

    // 2. Validation: Username length check
    if (username.length < 3) {
      showMessage('registerMessage', 'Username must be at least 3 characters long.', 'error');
      return;
    }

    // 3. Validation: Password length check
    if (password.length < 4) {
      showMessage('registerMessage', 'Password must be at least 4 characters long.', 'error');
      return;
    }

    // 4. Validation: Passwords must match
    if (password !== confirmPassword) {
      showMessage('registerMessage', 'Passwords do not match. Please re-enter.', 'error');
      return;
    }

    // 5. Validation: Check if username already exists in localStorage (case-insensitive)
    const users = getStoredUsers();
    const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());

    if (userExists) {
      showMessage('registerMessage', `The username "${username}" is already taken. Please choose another.`, 'error');
      return;
    }

    // 6. SECURE STEP: Compute SHA-256 hash of the password
    // Notice: We do NOT store plaintext password anywhere!
    const passwordHash = await hashPassword(password);

    // 7. Store ONLY the username and the cryptographic hash
    const newUser = {
      username: username,
      passwordHash: passwordHash
    };

    users.push(newUser);
    saveStoredUsers(users);

    // 8. Visual feedback & reset
    registerForm.reset();
    if (liveHashDisplay) {
      liveHashDisplay.textContent = 'Hash will appear here as you type...';
      liveHashDisplay.classList.remove('has-hash');
    }

    showMessage(
      'registerMessage',
      `Registration successful for <strong>${username}</strong>! Your password was hashed with SHA-256 and stored safely. You can now <a href="index.html" class="alert-link">go to Login →</a>`,
      'success'
    );

    // Refresh stored hashes table if present on the page
    renderStoredHashesTable();
  });
}

// ==============================================================================
// LOGIN FORM LOGIC (index.html)
// ==============================================================================
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage('loginMessage');

    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // 1. Validation: Ensure fields are not blank
    if (!username || !password) {
      showMessage('loginMessage', 'Please enter both your username and password.', 'error');
      return;
    }

    // 2. Fetch all registered users from localStorage
    const users = getStoredUsers();

    // 3. Find if the user exists
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    // 4. Compute the SHA-256 hash of the entered password
    const enteredPasswordHash = await hashPassword(password);

    // 5. Verification step:
    // If the user exists AND their stored hash exactly matches the newly calculated hash:
    if (existingUser && existingUser.passwordHash === enteredPasswordHash) {
      showMessage(
        'loginMessage',
        `<strong>Login Successful!</strong> Welcome back, <em>${existingUser.username}</em>. The calculated hash matched the stored record perfectly.`,
        'success'
      );
      loginForm.reset();
    } else {
      // SECURITY BEST PRACTICE:
      // Show a generic message without disclosing whether the username or password specifically failed.
      // This prevents attackers from enumerating valid usernames.
      showMessage('loginMessage', 'Invalid Username or Password.', 'error');
    }
  });
}

// ==============================================================================
// EDUCATIONAL DEMO & STORED HASHES INSPECTOR
// ==============================================================================
function renderStoredHashesTable() {
  const container = document.getElementById('storedUsersList');
  const countBadge = document.getElementById('storedUsersCount');
  if (!container) return;

  const users = getStoredUsers();

  if (countBadge) {
    countBadge.textContent = `${users.length} user${users.length === 1 ? '' : 's'}`;
  }

  if (users.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No users stored yet in <code>localStorage</code>.</p>
        <p class="empty-hint">Register a new user or click "Load Demo Sample" below to inspect how hashes appear in storage.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="hash-table">
        <thead>
          <tr>
            <th style="width: 25%">Username</th>
            <th style="width: 15%">Algorithm</th>
            <th style="width: 50%">Stored SHA-256 Hash</th>
            <th style="width: 10%">Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  users.forEach((user, index) => {
    // Sanitize username for HTML injection safety
    const safeUsername = user.username.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeHash = user.passwordHash;

    html += `
      <tr>
        <td class="username-cell">
          <span class="user-avatar">${safeUsername.charAt(0).toUpperCase()}</span>
          <strong>${safeUsername}</strong>
        </td>
        <td>
          <span class="badge-algo">SHA-256</span>
        </td>
        <td>
          <div class="hash-wrapper">
            <code class="hash-code" title="${safeHash}">${safeHash}</code>
            <button type="button" class="btn-copy" onclick="copyHashToClipboard('${safeHash}', this)" title="Copy Hash">Copy</button>
          </div>
        </td>
        <td>
          <button type="button" class="btn-delete" onclick="deleteUser(${index})" title="Delete this user record">✕</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Copies a hash string to the user's clipboard and provides quick button feedback.
 */
window.copyHashToClipboard = async function (text, btnElement) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = btnElement.textContent;
    btnElement.textContent = 'Copied!';
    btnElement.classList.add('copied');
    setTimeout(() => {
      btnElement.textContent = originalText;
      btnElement.classList.remove('copied');
    }, 1500);
  } catch (err) {
    console.error('Failed to copy hash:', err);
  }
};

/**
 * Deletes a single user record from localStorage by index.
 */
window.deleteUser = function (index) {
  const users = getStoredUsers();
  if (index >= 0 && index < users.length) {
    users.splice(index, 1);
    saveStoredUsers(users);
    renderStoredHashesTable();
  }
};

/**
 * Seeds sample demonstrative data for viva presentations.
 */
function setupDemoButtons() {
  const seedBtn = document.getElementById('seedDemoBtn');
  const clearBtn = document.getElementById('clearDemoBtn');

  if (seedBtn) {
    seedBtn.addEventListener('click', async () => {
      // Sample demonstration users (hashes for 'cyber123' and 'secret2026')
      const sample1Hash = await hashPassword('cyber123');
      const sample2Hash = await hashPassword('secret2026');

      const sampleUsers = [
        { username: 'student_alex', passwordHash: sample1Hash },
        { username: 'prof_sharma', passwordHash: sample2Hash }
      ];

      saveStoredUsers(sampleUsers);
      renderStoredHashesTable();

      const msg = document.getElementById('loginMessage') || document.getElementById('registerMessage');
      if (msg) {
        showMessage(msg.id, 'Demo accounts loaded: <strong>student_alex</strong> (pw: <code>cyber123</code>) and <strong>prof_sharma</strong> (pw: <code>secret2026</code>).', 'info');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all stored user hashes from localStorage?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderStoredHashesTable();
        const msg = document.getElementById('loginMessage') || document.getElementById('registerMessage');
        if (msg) {
          clearMessage(msg.id);
        }
      }
    });
  }
}

// ==============================================================================
// INITIALIZATION ON DOM CONTENT LOADED
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initRegistrationPage();
  initLoginPage();
  renderStoredHashesTable();
  setupDemoButtons();
});
