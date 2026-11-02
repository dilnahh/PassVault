# PASSWORD STORAGE & VERIFICATION USING SHA-256

A beginner-friendly, educational cybersecurity web project demonstrating how user registration and authentication work using one-way cryptographic hashing (**SHA-256**) without storing plaintext passwords.

---

## 1. Project Objective

The primary objective of this project is to illustrate the fundamental principles of **secure password storage** and **hash-based authentication**. It demonstrates that systems should never store passwords as readable text, but instead store a one-way mathematical digest produced by a cryptographic hash function like SHA-256.

Key learning goals include:
- Understanding the difference between **hashing** and **encryption**.
- Demonstrating the **Web Crypto API** (`crypto.subtle.digest`) built into modern browsers.
- Observing how client-side storage (`localStorage`) retains only usernames and hashes.
- Learning how authentication verification is performed without decrypting passwords.

---

## 2. Problem Statement

Historically, many insecure web services stored user credentials as **plaintext** (or using reversible two-way encryption) in databases. 

### Why is storing plaintext passwords dangerous?
1. **Data Breaches:** If an attacker breaches the database, every single user's password is leaked immediately.
2. **Credential Stuffing:** Users frequently reuse the same password across multiple websites (banking, social media, email). A leak on one site compromises accounts everywhere.
3. **Insider Threats:** Malicious employees or system administrators can read and misuse user passwords directly.

### The Solution:
Store only a **one-way cryptographic hash**. Even if an attacker steals the storage file or database, they obtain only irreversible alphanumeric strings, not the original passwords.

---

## 3. Technologies Used

This project strictly adheres to pure standard client-side web technologies:

- **HTML5:** Semantic markup structure for forms, badges, tables, and accessibility.
- **CSS3:** Clean, modern, responsive styling with soft gradients, rounded cards, and responsive grids.
- **Vanilla JavaScript (ES6+):** Async/await control flow, DOM manipulation, form validation, and event handling.
- **Web Crypto API (`SubtleCrypto`):** Hardware-accelerated native browser cryptography (`crypto.subtle.digest('SHA-256', ...)`).
- **Browser `localStorage`:** Client-side persistent key-value store acting as a mock database.

> **Zero External Dependencies:** No Node.js, Python, Flask, React, jQuery, or third-party cryptographic libraries are required.

---

## 4. Project Structure

```
Password-Hashing-Project/
│
├── index.html        # Main landing and login page with live storage inspector
├── register.html     # User registration page with real-time hash preview
├── style.css         # Clean, responsive styles with indigo/purple accents
├── script.js         # Core hashing logic, localStorage management, and validation
└── README.md         # Comprehensive project documentation and viva guide
```

---

## 5. What is Password Hashing?

**Hashing** is a mathematical algorithm that converts an arbitrary length input string into a fixed-length output string known as a **hash**, **digest**, or **fingerprint**.

### Core Properties of Cryptographic Hash Functions:
1. **One-Way (Pre-image Resistance):** Given an input $x$, it is easy to calculate $H(x)$. However, given $H(x)$, it is computationally impossible to determine the original input $x$.
2. **Deterministic:** The exact same input will always generate the exact same hash output every single time.
3. **Fixed Length:** Regardless of whether the input is a 4-letter password or an entire encyclopedia, the hash output is always the same fixed length (e.g., 256 bits).
4. **Avalanche Effect:** Changing even a single character or punctuation mark in the input produces an entirely different, unpredictable hash.
5. **Collision Resistance:** It is computationally infeasible to find two different inputs $x$ and $y$ such that $H(x) = H(y)$.

### Hashing vs. Encryption:
| Feature | Hashing | Encryption |
| :--- | :--- | :--- |
| **Direction** | One-way (Irreversible) | Two-way (Reversible) |
| **Key Required?** | No key needed | Requires private/public key |
| **Purpose** | Verification, integrity, authentication | Confidential data transmission |
| **Reversibility** | Cannot be decrypted back | Can be decrypted with key |

---

## 6. What is SHA-256?

**SHA-256** stands for **Secure Hash Algorithm 2 (256-bit)**. It is part of the SHA-2 family designed by the United States National Security Agency (NSA) and published by NIST (National Institute of Standards and Technology).

- **Output Size:** 256 bits (32 bytes).
- **Representation:** 64 hexadecimal characters (`0-9` and `a-f`), where each hex digit represents 4 bits ($64 \times 4 = 256\text{ bits}$).
- **Example:**
  - Password: `Password123!`
  - SHA-256: `6328325a74288b3ca0f0f5b991b106201a7d656093d6b0e8b3e8e24c29a65d0a`

In this project, the Web Crypto API performs this natively:
```javascript
const encoder = new TextEncoder();
const data = encoder.encode(password);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
```

---

## 7. Registration Process

During registration, user credentials undergo the following sequence:

```
[ User Enters Username & Password ]
                ↓
    [ Client Form Validation ]
  (Check required fields & password match)
                ↓
  [ Check Duplicate Username in Storage ]
                ↓
   [ Web Crypto API: SHA-256 Hashing ]
  (TextEncoder → crypto.subtle.digest)
                ↓
     [ 64-Character Hex String ]
                ↓
[ Store { username, passwordHash } in localStorage ]
                ↓
[ Original Plaintext Password Discarded from Memory ]
```

1. The user inputs their desired `username`, `password`, and `confirmPassword`.
2. The form validates that both password fields match and meet basic length requirements.
3. JavaScript checks `localStorage` to ensure the username does not already exist.
4. `hashPassword()` hashes the password using SHA-256.
5. The object `{ username: "...", passwordHash: "..." }` is saved to `localStorage`.
6. The plaintext password variable is discarded.

---

## 8. Login Verification Process

Authentication occurs without decrypting or retrieving any saved passwords:

```
[ User Enters Username & Password ]
                ↓
    [ Find User in localStorage ]
                ↓
 [ Hash Entered Password with SHA-256 ]
                ↓
   [ Compare Calculated Hash vs. Stored Hash ]
                ↓
     ┌───────────────────────┴───────────────────────┐
     ↓                                               ↓
[ Hashes Match ]                               [ Hashes Mismatch ]
     ↓                                               ↓
"Login Successful"                          "Invalid Username or Password"
```

1. The user inputs their `username` and `password`.
2. The script searches `localStorage` for an account matching the username.
3. The candidate password is fed into `hashPassword()` to produce a 64-character hash.
4. The newly calculated candidate hash is compared to the stored hash using exact string equality (`===`).
5. **Result:**
   - If they match: Access is granted ("Login Successful").
   - If they do not match or the user is not found: Access is denied with a generic error message: *"Invalid Username or Password"*.
   - **Viva Defense Tip:** A generic message is used intentionally to prevent **username enumeration** (attackers cannot deduce whether a username exists).

---

## 9. How `localStorage` is Used

Browser `localStorage` persists data across browser tabs and refreshes without expiring.

In this project, users are stored under the key:
`sha256_registered_users`

### Data Schema:
```json
[
  {
    "username": "student_alex",
    "passwordHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
  },
  {
    "username": "prof_sharma",
    "passwordHash": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
  }
]
```

### Inspecting LocalStorage in Browser DevTools:
1. Open the page in Google Chrome, Edge, or Firefox.
2. Press `F12` (or Right-Click → **Inspect**).
3. Switch to the **Application** tab (or **Storage** tab in Firefox).
4. Expand **Local Storage** on the left and click the site origin.
5. Notice that **only** `username` and `passwordHash` exist. The original plaintext password is never recorded anywhere!

---

## 10. Security Demonstration for Viva / Presentation

To deliver an effective demonstration to professors or examiners:

1. **Demonstrate Registration:**
   - Go to `register.html`.
   - Type a password into the password field.
   - Point out the **Real-Time SHA-256 Digest Preview** updating instantaneously as you type, showing the 64-character output.
   - Click **Register with SHA-256 Hash**.
   - Show the newly created entry appearing in the **Browser localStorage Inspector** table below.

2. **Demonstrate Zero Plaintext Storage:**
   - Point to the Inspector table.
   - Highlight that only the username and the cryptographic hash are stored.
   - Show that the plaintext password is completely absent.

3. **Demonstrate Login Verification:**
   - Return to `index.html`.
   - Enter the correct username and password $\rightarrow$ observe **Login Successful**.
   - Enter an incorrect password $\rightarrow$ observe **Invalid Username or Password**.
   - Explain how the candidate password was hashed on the fly and compared.

4. **Demonstrate the Avalanche Effect:**
   - Register user `userA` with password `Pass1`.
   - Register user `userB` with password `Pass2`.
   - Compare both 64-character hashes side by side. Point out how changing a single character completely alters the entire hash string.

---

## 11. Limitations & Production Security Note

> [!IMPORTANT]
> **Academic Demonstration vs. Production Architecture**
> While SHA-256 is an excellent cryptographic primitive for data integrity and educational demonstrations, **plain SHA-256 is NOT recommended for production password storage in real-world systems.**

### Why plain SHA-256 is insufficient in production:
1. **Speed & GPU Cracking:** SHA-256 was designed to be fast for verifying file downloads and block chains. Modern GPUs can calculate billions of SHA-256 hashes per second, making brute-force attacks against unsalted passwords feasible.
2. **Rainbow Tables:** Precomputed lookup tables of millions of common password hashes can instantly reverse unsalted SHA-256 hashes.
3. **Identical Passwords:** Two users with the same password will have identical hashes if no salt is applied.

### Recommended Production Algorithms:
In modern web applications, password storage should utilize **slow, memory-hard, salted algorithms**:
- **Argon2id:** The winner of the Password Hashing Competition (PHC); industry gold standard with configurable time and memory costs.
- **bcrypt:** Adaptive hashing function based on the Blowfish cipher with automatic salting and configurable work factor.
- **scrypt:** Memory-hard hashing algorithm resistant to hardware ASIC attacks.
- **PBKDF2:** Password-Based Key Derivation Function 2, widely used across enterprise platforms.

---

## 12. How to Run the Project

No build tools, compilers, or package managers are needed!

### Method 1: Using VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Click **File** $\rightarrow$ **Open Folder...**
3. Select the `Password-Hashing-Project` directory.
4. Install the extension **Live Server** (by Ritwick Dey) if not already installed.
5. Right-click `index.html` and choose **"Open with Live Server"**.
6. The app will open in your default browser at `http://127.0.0.1:5500/index.html`.

### Method 2: Direct Browser Opening
1. Open your computer file explorer.
2. Navigate into `Password-Hashing-Project`.
3. Double-click `index.html` (or drag and drop it into Chrome, Edge, Brave, Safari, or Firefox).

---

## 13. Viva Examination Q&A Cheat Sheet

| Question | Short Answer |
| :--- | :--- |
| **Q: What is the output length of SHA-256?** | Always 256 bits (32 bytes), represented as 64 hexadecimal characters. |
| **Q: Can you decrypt an SHA-256 hash?** | No. Hashing is a one-way mathematical function. It can only be verified by hashing an input and comparing. |
| **Q: Where does the Web Crypto API run?** | Inside the browser's native JavaScript runtime environment via `window.crypto.subtle`. |
| **Q: Why not tell the user "Password incorrect"?** | Giving specific errors allows attackers to enumerate valid usernames. Generic errors prevent this. |
| **Q: What is a Salt in password storage?** | A random unique string added to the password before hashing to ensure identical passwords produce unique hashes and defeat rainbow tables. |
