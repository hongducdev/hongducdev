ScrollReveal({ 
    reset: true,
    distance: '50px',
    duration: 2500,
    delay: 500 
});

ScrollReveal().reveal('#header-text, .title-content', { delay: 300, origin: 'left' });
ScrollReveal().reveal('#header-image', { delay: 400, origin: 'right' });
ScrollReveal().reveal('#header-btn', { delay: 300, origin: 'bottom' });

ScrollReveal().reveal('#project-1', { delay: 300, origin: 'right' });
ScrollReveal().reveal('#project-2', { delay: 300, origin: 'left' });
ScrollReveal().reveal('#project-3', { delay: 300, origin: 'right' });

ScrollReveal().reveal('.skill-item', { delay: 300, origin: 'bottom' });

ScrollReveal().reveal('.name-contact, .avt-contact', { delay: 300, origin: 'bottom' });
ScrollReveal().reveal('.item-contact-1', { delay: 400, origin: 'bottom' });
ScrollReveal().reveal('.item-contact-2', { delay: 450, origin: 'bottom' });
ScrollReveal().reveal('.desc-contact', { delay: 500, origin: 'left' });
ScrollReveal().reveal('.social-item-1', { delay: 550, origin: 'bottom' });
ScrollReveal().reveal('.social-item-2', { delay: 600, origin: 'bottom' });
ScrollReveal().reveal('.social-item-3', { delay: 650, origin: 'bottom' });


const menuMobileBtn = document.querySelector('.menu-mobile-btn');
const navbarMobile = document.querySelector('.navbar-mobile')
const overlay = document.querySelector('.overlay');
const navbarList = document.querySelector('.navbar-list');

isOpen = false;

menuMobileBtn.addEventListener('click', () => {
    if(!isOpen) {
        navbarMobile.classList.remove('hidden')
        overlay.classList.remove('hidden')
        isOpen = true;
        menuMobileBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 fill-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        `
    } else {
        navbarMobile.classList.add('hidden')
        overlay.classList.add('hidden')
        isOpen = false;
        menuMobileBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 fill-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
        `
    }
})

navbarList.addEventListener('click', (e) => {
    const navbarItem = e.target.closest('.navbar-item');
    if(navbarItem) {
        navbarMobile.classList.add('hidden')
        overlay.classList.add('hidden')
        isOpen = false;
        menuMobileBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 fill-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
        `
    }
})

var mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.classList.remove('hidden');
  } else {
    mybutton.classList.add('hidden');
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

