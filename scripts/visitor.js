const urlParams = new URLSearchParams(window.location.search);
const isVisitor = urlParams.get('from') === 'visitor';

// Sidebar-Pfad wählen
const sidebarPath = isVisitor ? './sidebar-visitor.html' : './sidebar.html';

// Dynamisch das w3-include-html Attribut setzen
document.getElementById('sidebar-container').setAttribute('w3-include-html', sidebarPath);

// Header-Elemente anpassen wenn Visitor
function adjustHeaderForVisitor() {
    if (isVisitor) {
        document.getElementById('user-logo-svg').style.display = 'none';
    }
}