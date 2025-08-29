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
      // Eindeutige ID für jeden Kontakt basierend auf Email (da diese einzigartig sein sollte)
      const contactId = user.email.replace(/[^a-zA-Z0-9]/g, '');
      html += `
        <div class="contact" id="contact-${contactId}" onclick="showContactDetails('${user.name}', '${user.email}', '${user.phone || ''}', '${user.color}', '${user.initials}', '${contactId}')">
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

function showContactDetails(name, email, phone, color, initials, contactId) {

  // Alle anderen Kontakte deaktivieren
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
  
  // Aktuellen Kontakt aktivieren
  const currentContact = document.getElementById(`contact-${contactId}`);
  if (currentContact) {
    currentContact.classList.add('active');
  }
  // Floating Contact Template erstellen
  const floatingContactHtml = `
    <div class="floating-contact-first">Contact Information</div>

    <div class="floating-contact-second">
        <div class="avatar-big" style="background-color: ${color};">${initials}</div>
        <div class="floating-contact-name">
            <div class="floating-contact-name-big">${name}</div>
            <div class="floating-contact-name-bottom">
                <div class="edit-link">
                    <img src="./assets/icons-contacts/edit.svg" class="icon-edit" alt="">
                    <span>Edit</span>
                </div>
                <div class="delete-link" onclick="deleteContact('${email}')">
                    <img src="./assets/icons-contacts/delete.svg" class="icon-delete" alt="">
                    <span>Delete</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="floating-contact-third">
        <div class="floating-contact-bottom-email">
            <div class="floating-contact-bottom-title">Email</div>
            <span class="floating-contact-email">${email}</span>
        </div>
        <div class="floating-contact-bottom-phone">
            <div class="floating-contact-bottom-title">Phone</div>
            <span>${phone || 'No phone number'}</span>
        </div>
    </div>
  `;

  // Floating Contact in right-panel einfügen
  const rightPanel = document.getElementById('right-panel');
  
  // Erst das floating-contact div erstellen falls es nicht existiert
  let floatingContact = document.getElementById('floating-contact');
  if (!floatingContact) {
    floatingContact = document.createElement('div');
    floatingContact.className = 'floating-contact';
    floatingContact.id = 'floating-contact';
    rightPanel.appendChild(floatingContact);
  }

  // Inhalt setzen
  floatingContact.innerHTML = floatingContactHtml;
  
  // Slide-in Animation starten
  slideInContact();
}

function slideInContact() {
  const floatingContact = document.getElementById('floating-contact');
  
  // Element erst komplett ausblenden und Transition temporär deaktivieren
  floatingContact.style.transition = 'none';
  floatingContact.style.transform = 'translateX(100%)';
  floatingContact.style.opacity = '0';
  
  // Sicherstellen dass das Element sichtbar ist
  floatingContact.classList.add('show');
  
  // Kurz warten, dann Animation starten
  setTimeout(() => {
    floatingContact.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    floatingContact.style.transform = 'translateX(0)';
    floatingContact.style.opacity = '1';
  }, 10);
}

// User löschen
async function deleteContact(email) {
  try {
    // Alle User laden um den richtigen Schlüssel zu finden
    const response = await fetch(`${BASE_URL}users.json`);
    const data = await response.json();
    
    let userKey = null;
    if (data) {
      // Finde den Firebase-Key des Users mit der entsprechenden Email
      for (const [key, user] of Object.entries(data)) {
        if (user.email === email) {
          userKey = key;
          break;
        }
      }
    }
    
    if (userKey) {
      // User mit dem gefundenen Key löschen
      const deleteResponse = await fetch(`${BASE_URL}users/${userKey}.json`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log("User deleted successfully");
        // Panel schließen und Liste neu laden
        closeFloatingContact();
        loadUsers();
      } else {
        console.error("Failed to delete user:", deleteResponse.status);
      }
    } else {
      console.error("User not found");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

// Funktion zum Schließen des Panels:
function closeFloatingContact() {
  const floatingContact = document.getElementById('floating-contact');
  if (floatingContact) {
    floatingContact.classList.remove('show');
  }
  
  // Alle aktiven Kontakte deselektieren
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
}