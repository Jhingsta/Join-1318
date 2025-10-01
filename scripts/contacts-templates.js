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

function getAddContactOverlayTemplate() {
  return `
      <div class="overlay-add-contact" id="overlay-add-contact">
        <div class="overlay-add-contact-top">
          <button class="overlay-close-button" onclick="closeContactOverlay()" aria-label="Close window">
            <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.0001 17.8642L9.46673 24.389C9.22229 24.6331 8.91118 24.7552 8.5334 24.7552C8.15562 24.7552 7.84451 24.6331 7.60007 24.389C7.35562 24.1449 7.2334 23.8342 7.2334 23.4569C7.2334 23.0796 7.35562 22.7689 7.60007 22.5248L14.1334 16L7.60007 9.47527C7.35562 9.23115 7.2334 8.92045 7.2334 8.54316C7.2334 8.16588 7.35562 7.85518 7.60007 7.61106C7.84451 7.36693 8.15562 7.24487 8.5334 7.24487C8.91118 7.24487 9.22229 7.36693 9.46673 7.61106L16.0001 14.1358L22.5334 7.61106C22.7778 7.36693 23.089 7.24487 23.4667 7.24487C23.8445 7.24487 24.1556 7.36693 24.4001 7.61106C24.6445 7.85518 24.7667 8.16588 24.7667 8.54316C24.7667 8.92045 24.6445 9.23115 24.4001 9.47527L17.8667 16L24.4001 22.5248C24.6445 22.7689 24.7667 23.0796 24.7667 23.4569C24.7667 23.8342 24.6445 24.1449 24.4001 24.389C24.1556 24.6331 23.8445 24.7552 23.4667 24.7552C23.089 24.7552 22.7778 24.6331 22.5334 24.389L16.0001 17.8642Z" fill="white"/>
            </svg>
          </button>

          <div class="overlay-contact-top-box">
            <img src="./assets/icons-header/logo-all-white.svg" alt="" class="icon-logo">
            <div class="overlay-contact-top-box-title">Add contact</div>
            <div class="overlay-add-contact-top-box-subtitle">Tasks are better with a team!</div>
          </div>
        </div>

        <div class="overlay-contact-bottom">
          <div class="overlay-contact-userbox">
            <div class="avatar-big-placeholder">
              <img src="./assets/icons-contacts/person-white.svg" alt="" class="icon-avatar-placeholder">
            </div>

            <div class="overlay-contact-form" aria-label="Add contact form">
              <div class="form-group">
                <label for="overlay-add-name" class="visually-hidden">Name</label>
                <input id="overlay-add-name" name="name" type="text" placeholder="Name">
                <img src="./assets/icons-signup/person.svg" alt="" class="input-icon">
              </div>

              <div class="form-group">
                <label for="overlay-add-email" class="visually-hidden">Email</label>
                <input id="overlay-add-email" name="email" type="text" placeholder="Email">
                <img src="./assets/icons-signup/mail.svg" alt="" class="input-icon">
              </div>

              <div class="form-group">
                <label for="overlay-add-phone" class="visually-hidden">Phone</label>
                <input id="overlay-add-phone" name="phone" type="text" placeholder="Phone">
                <img src="./assets/icons-contacts/call.svg" alt="" class="input-icon">
              </div>

              <div class="error-message"></div>
            </div>

            <div class="buttons-container">
              <button class="cancel-btn" onclick="closeContactOverlay()">
                Cancel<img src="./assets/icons-contacts/cancel.png" alt="">
              </button>
              <button class="create-btn" onclick="createContact()">
                Create contact
                <img src="./assets/icons-contacts/check.png" alt="">
              </button>
            </div>
          </div>
        </div>
      </div>
  `;
}

function getEditContactOverlayTemplate(user) {
  return `
    <div class="overlay-edit-contact" id="overlay-edit-contact">
        <div class="overlay-edit-contact-top">
            <button class="overlay-close-button" onclick="closeContactOverlay()" aria-label="Close window">
                <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.0001 17.8642L9.46673 24.389C9.22229 24.6331 8.91118 24.7552 8.5334 24.7552C8.15562 24.7552 7.84451 24.6331 7.60007 24.389C7.35562 24.1449 7.2334 23.8342 7.2334 23.4569C7.2334 23.0796 7.35562 22.7689 7.60007 22.5248L14.1334 16L7.60007 9.47527C7.35562 9.23115 7.2334 8.92045 7.2334 8.54316C7.2334 8.16588 7.35562 7.85518 7.60007 7.61106C7.84451 7.36693 8.15562 7.24487 8.5334 7.24487C8.91118 7.24487 9.22229 7.36693 9.46673 7.61106L16.0001 14.1358L22.5334 7.61106C22.7778 7.36693 23.089 7.24487 23.4667 7.24487C23.8445 7.24487 24.1556 7.36693 24.4001 7.61106C24.6445 7.85518 24.7667 8.16588 24.7667 8.54316C24.7667 8.92045 24.6445 9.23115 24.4001 9.47527L17.8667 16L24.4001 22.5248C24.6445 22.7689 24.7667 23.0796 24.7667 23.4569C24.7667 23.8342 24.6445 24.1449 24.4001 24.389C24.1556 24.6331 23.8445 24.7552 23.4667 24.7552C23.089 24.7552 22.7778 24.6331 22.5334 24.389L16.0001 17.8642Z" fill="white"/>
                </svg>
            </button>

            <div class="overlay-contact-top-box">
                <img src="./assets/icons-header/logo-all-white.svg" alt="" class="icon-logo">
                <div class="overlay-contact-top-box-title">Edit contact</div>
                <div class="overlay-add-contact-top-box-subtitle">Tasks are better with a team!</div>
            </div>
        </div>

        <div class="overlay-contact-bottom">
            <div class="overlay-contact-userbox">
                <div class="avatar-big" style="background-color: ${user.color};">${user.initials}</div>

                <div class="overlay-contact-form" aria-label="Edit contact form">
                    <div class="form-group">
                        <label for="overlay-edit-name" class="visually-hidden">Name</label>
                        <input id="overlay-edit-name" name="name" type="text" placeholder="Name" value="${user.name}">
                        <img src="./assets/icons-signup/person.svg" alt="" class="input-icon">
                    </div>

                    <div class="form-group">
                        <label for="overlay-edit-email" class="visually-hidden">Email</label>
                        <input id="overlay-edit-email" name="email" type="text" placeholder="Email" value="${user.email}">                        
                        <img src="./assets/icons-signup/mail.svg" alt="" class="input-icon">
                    </div>

                    <div class="form-group">
                        <label for="overlay-edit-phone" class="visually-hidden">Phone</label>
                        <input id="overlay-edit-phone" name="phone" type="text" placeholder="Phone" value="${user.phone || ''}">                        
                        <img src="./assets/icons-contacts/call.svg" alt="" class="input-icon">
                    </div>

                    <div class="error-message"></div>
                </div>

                <div class="buttons-container">
                    <button class="delete-btn" onclick="deleteContact('${user.email}')">Delete</button>
                    <button class="save-btn" onclick="updateContact('${user.email}', '${user.color}')"><span class="save-btn-text">Save</span>
                    <img src="./assets/icons-contacts/check.png" alt=""></button>
                </div>
            </div>
        </div>
    </div>
  `;
}

function getSuccessMessageTemplate() {
  return `<div class="success-message">Contact successfully created</div>`;
}