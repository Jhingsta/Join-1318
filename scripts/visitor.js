let urlParams = new URLSearchParams(window.location.search);
let isVisitor = urlParams.get('from') === 'visitor';
let sidebarPath = isVisitor ? './sidebar-visitor.html' : './sidebar.html';

document.getElementById('sidebar-container').setAttribute('w3-include-html', sidebarPath);

/**
 * Adjusts the header elements for visitor mode by hiding specific icons.
 * Hides the user logo and help icon if the user is in visitor mode.
 */
function adjustHeaderForVisitor() {
    if (isVisitor) {
        document.getElementById('user-logo-svg').style.display = 'none';
        document.getElementById('help-icon').style.display = 'none';
    }
}