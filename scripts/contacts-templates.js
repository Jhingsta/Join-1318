function renderLetterSection(letter) {
  return `
    <div class="letter-section">
      <div class="letter">${letter}</div>
      <div class="hl"></div>
    </div>
  `;
}

function renderContact(user) {
  return `
    <div class="contact" id="contact-${user.email.replace(/[^a-zA-Z0-9]/g, '')}" 
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