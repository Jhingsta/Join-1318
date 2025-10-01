/**
 * Checks if the current user is in visitor mode based on the URL parameter.
 * @type {boolean} `true` if the URL parameter `from=visitor` is set, otherwise `false`.
 */
let urlParams = new URLSearchParams(window.location.search);
let isVisitor = urlParams.get('from') === 'visitor';

/**
 * Selects the appropriate sidebar path based on visitor mode.
 * @type {string} The path to the sidebar file (`sidebar-visitor.html` for visitors, `sidebar.html` otherwise).
 */
let sidebarPath = isVisitor ? './sidebar-visitor.html' : './sidebar.html';

/**
 * Dynamically sets the `w3-include-html` attribute for the sidebar container.
 */
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