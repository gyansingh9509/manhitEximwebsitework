
document.addEventListener("DOMContentLoaded", () => {
  const clickableItems = document.querySelectorAll('.clickable');
    const detailsDiv = document.getElementById('partner-details');

    clickableItems.forEach(item => {
      item.addEventListener('click', () => {
        const info = item.getAttribute('data-info');
        detailsDiv.innerHTML = `<p>${info}</p>`;
      });
    });
});



// function toggleMobileNav() {
//   var navList = document.querySelector('nav ul');
//   var headerIcons = document.querySelector('.header-icons');
//   if (navList && headerIcons) {
//     navList.classList.toggle('show');
//     headerIcons.classList.toggle('show');
//   }
//   document.body.onclick = function(e) {
//     if (
//       !e.target.closest('nav') &&
//       !e.target.closest('.hamburger')
//     ) {
//       navList.classList.remove('show');
//       headerIcons.classList.remove('show');
//     }
//   };
// }



document.getElementById('hamburger-menu').onclick = function(e) {
  e.stopPropagation();
  var navRow = document.querySelector('.nav-row');
  navRow.classList.toggle('show');
};
// Optional: close menu when clicking outside
document.addEventListener('click', function(e) {
  var navRow = document.querySelector('.nav-row');
  if (navRow && navRow.classList.contains('show') && !e.target.closest('.nav-row')) {
    navRow.classList.remove('show');
  }
});