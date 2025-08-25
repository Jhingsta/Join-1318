const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];

function init() {
    loadUsers();
}

async function loadUsers() {
  try {
    const response = await fetch(`${BASE_URL}users.json`);
    const data = await response.json();

    if (data) {
      // Da Firebase-RTDB Objekte liefert, in ein Array umwandeln:
      users = Object.values(data);
      console.log("Users loaded successfully:", users);

      // Kontakte rendern
      const html = renderContacts(users);
      document.getElementById("contacts-list").innerHTML = html;

    } else {
      console.log("No users found in database");
      users = [];
    }
  } catch (error) {
    console.error("Error loading users:", error);
    users = [];
  }
}

function renderContacts(contacts) {
  // alphabetisch sortieren
  const sorted = contacts.sort((a, b) => a.name.localeCompare(b.name));

  // nach Buchstaben gruppieren
  const grouped = sorted.reduce((acc, contact) => {
    const letter = contact.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});

  // HTML zusammenbauen mit for-Schleifen
  let html = "";

  for (const letter in grouped) {
    html += `
      <div class="letter-section">
        <div class="letter">${letter}</div>
        <div class="hl"></div>
      </div>
    `;

    const users = grouped[letter];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      html += `
        <div class="contact">
          <div class="avatar" style="background-color:${user.color};">${user.initials}</div>
          <div class="contact-info">
            <div class="name">${user.name}</div>
            <div class="email">${user.email}</div>
          </div>
        </div>
      `;
    }
  }

  return html;
}
