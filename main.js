document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    let lastScrollTop = 0;

    // Scroll hide/show header
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.classList.add('hide');
        } else if (scrollTop < lastScrollTop) {
            header.classList.remove('hide');
        }
        
        lastScrollTop = scrollTop;
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
});


// ABOUT ARTIST ACCORDION

function toggleAccordion(element) {
    const parent = element.parentElement;
    const isActive = parent.classList.contains('active');
    
    // Close all accordion items
    document.querySelectorAll('.accordion-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // If the clicked item wasn't active, open it
    if (!isActive) {
      parent.classList.add('active');
    }
  }
  
  // Open the first accordion item by default
  document.querySelector('.accordion-item').classList.add('active');


//   WORK SECTION READING ENHACEMENT

   // Simple interaction to enhance reading experience
   document.querySelectorAll('.line').forEach(line => {
    line.addEventListener('mouseover', function() {
        this.style.transform = 'translateX(10px)';
    });
    
    line.addEventListener('mouseout', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Scroll indicators functionality
document.querySelectorAll('.scroll-indicator').forEach(indicator => {
    indicator.addEventListener('click', function() {
        const poem = this.parentElement;
        poem.scrollTop += 100;
    });
});

