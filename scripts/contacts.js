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
        <div class="contact" onclick="showContactDetails('${user.name}', '${user.email}', '${user.phone || ''}', '${user.color}', '${user.initials}')">
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

function showContactDetails(name, email, phone, color, initials) {
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
                <div class="delete-link">
                    <img src="./assets/icons-contacts/delete.svg" class="icon-delete" alt="">
                    <span>Delete</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="floating-contact-third">
        <div class="floating-contact-bottom-email">
            <div class="floating-contact-bottom-title">Email</div>
            <a href="mailto:${email}">${email}</a>
        </div>
        <div class="floating-contact-bottom-phone">
            <div class="floating-contact-bottom-title">Phone</div>
            ${phone ? `<a href="tel:${phone}">${phone}</a>` : 'No phone number'}
        </div>
    </div>
  `;

  // Floating Contact in right-panel einfügen
  const rightPanel = document.querySelector('.right-panel');
  
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
  
  // Initial Position (außerhalb des Bildschirms rechts)
  floatingContact.style.transform = 'translateX(100%)';
  floatingContact.style.opacity = '0';
  floatingContact.style.display = 'block';
  
  // Animation mit einem kleinen Delay für besseren Effekt
  setTimeout(() => {
    floatingContact.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    floatingContact.style.transform = 'translateX(0)';
    floatingContact.style.opacity = '1';
  }, 10);
}
