function getLetterSectionTemplate(letter) {
  return `
    <div class="letter-section">
      <div class="letter">${letter}</div>
      <div class="hl"></div>
    </div>
  `;
}

function getContactTemplate(user) {
  return `
    <div class="contact" role="listitem" id="contact-${user.email.replace(/[^a-zA-Z0-9]/g, '')}" 
         onclick="showFloatingContact('${user.name}', '${user.email}', '${user.phone || ''}', '${user.color}', '${user.initials}', '${user.email.replace(/[^a-zA-Z0-9]/g, '')}')">
      <div class="avatar" style="background-color:${user.color};">
        ${user.initials}
      </div>
      <div class="contact-info">
        <div class="name">${user.name}</div>
        <div class="email">${user.email}</div>
      </div>
    </div>
  `;
}

function getFloatingContactTemplate(name, email, phone, color, initials) {
  return `
    <div class="floating-contact-first">
      <span>Contact Information</span>
      <button onclick="closeFloatingContact()" class="arrow-left"></button>
    </div>

    <div class="floating-contact-second">
        <div class="avatar-big" style="background-color: ${color};">${initials}</div>
        <div class="floating-contact-name">
            <div class="floating-contact-name-big">${name}</div>
            <div class="floating-contact-name-bottom">
                <div class="edit-link" onclick="showEditContactOverlay({name:'${name}', email:'${email}', phone:'${phone || ''}', color:'${color}', initials:'${initials}'})">
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
}

function getMobileOverlayTemplate(name, email, phone, color, initials) {
  return `
    <div id="mobile-floating-contact" class="mobile-floating-contact">
      ${getMobileMenuButtonTemplate(name, email, phone, color, initials)}
    </div>
  `;
}

function getMobileMenuButtonTemplate(name, email, phone, color, initials) {
  return `
    <button class="mobile-overlay-menu-btn" 
            onclick="openMobileContactMenu('${name}', '${email}', '${phone || ''}', '${color}', '${initials}')" 
            aria-label="Open contact options menu">
    </button>
  `;
}

function getMobileContactMenuTemplate(name, email, phone, color, initials) {
  return `
    <div class="mobile-contact-options">
      <div class="mobile-edit-link" onclick="showEditContactOverlay({name:'${name}', email:'${email}', phone:'${phone || ''}', color:'${color}', initials:'${initials}'})">
        <img src="./assets/icons-contacts/edit.svg" class="icon-edit" alt="">
        <span>Edit</span>
      </div>
      <div class="mobile-delete-link" onclick="deleteContact('${email}')">
        <img src="./assets/icons-contacts/delete.svg" class="icon-delete" alt="">
        <span>Delete</span>
      </div>
    </div>
  `;
}