document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart
  initCart();
  
  // Initialize menu filters
  initMenuFilters();
  
  // Initialize form validation
  initFormValidation();
  
  // Add animations and enhancements
  enhanceUI();
  
  // Initialize smooth scrolling
  initSmoothScroll();
});
// Cart functionality
let cart = [];
const DELIVERY_FEE = 40;

function initCart() {
  // Add event listeners to add to cart buttons
  const addToCartButtons = document.querySelectorAll('.btn[data-action="add-to-cart"]');
  
  addToCartButtons.forEach(button => {
    const name = button.getAttribute('data-name');
    const price = parseInt(button.getAttribute('data-price'));
    
    if (name && price) {
      button.addEventListener('click', () => addToCart(name, price));
    }
  });
  
  // Initialize checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => processCheckout());
  }
  
  // Load cart from localStorage
  loadCart();
  
  // Show empty cart message if needed
  updateCartDisplay();
}

function addToCart(name, price) {
  // Find existing item in cart
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Get the image URL for the item - fixed selector method
    let imgUrl = 'default-coffee.jpg'; // Default image
    
    // Find the correct menu item using proper DOM traversal
    const menuItems = document.querySelectorAll('.item');
    menuItems.forEach(item => {
      const itemTitle = item.querySelector('.item-info h3');
      if (itemTitle && itemTitle.textContent.trim() === name) {
        const imgElement = item.querySelector('.item-img img');
        if (imgElement && imgElement.src) {
          imgUrl = imgElement.src;
        }
      }
    });
    
    cart.push({
      name,
      price,
      quantity: 1,
      imgUrl
    });
  }
  
  // Show toast notification
  showToast(`${name} added to cart!`);
  
  // Update cart display
  updateCartDisplay();
  
  // Save cart to localStorage
  saveCart();
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cart-items');
  const emptyCart = document.getElementById('empty-cart');
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  // Clear current items
  if (cartItems) {
    cartItems.innerHTML = '';
  }
  
  if (cart.length === 0) {
    // Show empty cart message
    if (emptyCart) emptyCart.style.display = 'block';
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (subtotalElement) subtotalElement.textContent = '0';
    if (totalElement) totalElement.textContent = '0';
    return;
  }
  
  // Hide empty cart message
  if (emptyCart) emptyCart.style.display = 'none';
  if (checkoutBtn) checkoutBtn.disabled = false;
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + DELIVERY_FEE;
  
  // Update total elements
  if (subtotalElement) subtotalElement.textContent = subtotal;
  if (totalElement) totalElement.textContent = total;
  
  // Add items to cart list
  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.imgUrl}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-control">
          <button class="quantity-btn decrease" data-name="${item.name}">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn increase" data-name="${item.name}">+</button>
        </div>
        <button class="remove-btn" data-name="${item.name}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    cartItems.appendChild(li);
  });
  
  // Add event listeners to quantity buttons
  const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
  const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
  const removeButtons = document.querySelectorAll('.remove-btn');
  
  decreaseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      updateQuantity(name, -1);
    });
  });
  
  increaseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      updateQuantity(name, 1);
    });
  });
  
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      removeFromCart(name);
    });
  });
}

function updateQuantity(name, change) {
  const item = cart.find(item => item.name === name);
  if (!item) return;
  
  item.quantity += change;
  
  if (item.quantity <= 0) {
    // Remove item if quantity is 0 or less
    removeFromCart(name);
  } else {
    updateCartDisplay();
    saveCart();
  }
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCartDisplay();
  saveCart();
  showToast(`${name} removed from cart`);
}

function saveCart() {
  localStorage.setItem('DV8Cart', JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem('DV8Cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
      console.error('Error loading cart:', e);
    }
  }
}

function processCheckout() {
  // Show confirmation modal
  showModal('Checkout', `
    <p>Thank you for your order!</p>
    <p>Your order total is ₹${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + DELIVERY_FEE}</p>
    <p>Your coffee will be on its way soon!</p>
  `);
  
  // Clear cart
  cart = [];
  updateCartDisplay();
  saveCart();
}
function initFormValidation() {
  const contactForm = document.getElementById('contact-form');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validateForm(this)) {
        showModal('Success', 'Your message has been sent successfully!');
        this.reset();
      }
    });
  }
  
  if (registerForm) {
    console.log('Register form found');
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Register form submitted');
      if (validateForm(this)) {
        // Get form values
        const username = this.querySelector('#reg-name').value;
        const email = this.querySelector('#reg-email').value;
        const password = this.querySelector('#reg-password').value;
        
        // Store user in localStorage (simple implementation)
        registerUser(username, email, password);
        
        showModal('Registration Successful', 'Your account has been created successfully! You can now log in.');
        this.reset();
      }
    });
  }
  
  if (loginForm) {
    console.log('Login form found');
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Login form submitted');
      if (validateForm(this)) {
        // Get form values
        const email = this.querySelector('#login-email').value;
        const password = this.querySelector('#login-password').value;
        
        // Authenticate user (simple implementation)
        if (authenticateUser(email, password)) {
          showModal('Login Successful', 'You have been logged in successfully!');
          this.reset();
          
          // Update UI for logged in user
          updateUserUI(email);
        } else {
          showModal('Login Failed', 'Invalid email or password. Please try again.');
        }
      }
    });
  }
  
  // Newsletter form
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('Thank you for subscribing to our newsletter!');
      this.reset();
    });
  }
}

function registerUser(username, email, password) {
  // Get existing users or initialize empty array
  let users = JSON.parse(localStorage.getItem('DV8Users') || '[]');
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    showModal('Registration Failed', 'User with this email already exists.');
    return false;
  }
  
  // Add new user
  users.push({
    username,
    email,
    password: hashPassword(password), // Simple hashing for demo
    created: new Date().toISOString()
  });
  
  // Save to localStorage
  localStorage.setItem('DV8Users', JSON.stringify(users));
  return true;
}

function authenticateUser(email, password) {
  // Get existing users
  let users = JSON.parse(localStorage.getItem('DV8Users') || '[]');
  
  // Find user by email
  const user = users.find(user => user.email === email);
  if (!user) return false;
  
  // Check password
  if (user.password === hashPassword(password)) {
    // Set current user
    localStorage.setItem('DV8CurrentUser', JSON.stringify({
      username: user.username,
      email: user.email,
      loggedInAt: new Date().toISOString()
    }));
    return true;
  }
  
  return false;
}

function hashPassword(password) {
  // Simple hashing function for demo purposes
  // In a real application, use a proper hashing library
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

function updateUserUI(email) {
  // Get user data
  let users = JSON.parse(localStorage.getItem('DV8Users') || '[]');
  const user = users.find(user => user.email === email);
  
  if (!user) return;
  
  // Update header with user info
  const accountLink = document.querySelector('.nav-link[href="#account"]');
  if (accountLink) {
    accountLink.textContent = `Welcome, ${user.username}`;
  }
  
  // Show logout button
  const loginBtn = document.querySelector('.login-btn');
  const logoutBtn = document.querySelector('.logout-btn');
  
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', logoutUser);
  }
}

function logoutUser() {
  // Remove current user
  localStorage.removeItem('DV8CurrentUser');
  
  // Update UI
  const accountLink = document.querySelector('.nav-link[href="#account"]');
  if (accountLink) {
    accountLink.textContent = 'Account';
  }
  
  // Show login button
  const loginBtn = document.querySelector('.login-btn');
  const logoutBtn = document.querySelector('.logout-btn');
  
  if (loginBtn) loginBtn.style.display = 'inline-block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  
  showToast('You have been logged out successfully!');
}
function initMenuFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.item');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get filter value
      const filter = button.getAttribute('data-filter');
      
      // Show/hide menu items
      menuItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
          
          // Add animation
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 100);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
  
  // Initialize with 'all' filter
  if (filterButtons.length > 0) {
    filterButtons[0].click();
  }
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    if (input.hasAttribute('required') && !input.value.trim()) {
      isValid = false;
      showInputError(input, 'This field is required');
    } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
      isValid = false;
      showInputError(input, 'Please enter a valid email address');
    } else if (input.type === 'password' && input.value && input.value.length < 6) {
      isValid = false;
      showInputError(input, 'Password must be at least 6 characters');
    } else {
      removeInputError(input);
    }
  });
  
  return isValid;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showInputError(input, message) {
  // Remove any existing error
  removeInputError(input);
  
  // Add error class
  input.classList.add('error');
  
  // Create error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  // Insert after input
  input.parentNode.appendChild(errorDiv);
}

function removeInputError(input) {
  input.classList.remove('error');
  const errorMessage = input.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

function enhanceUI() {
  // Add parallax effect to hero section
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
      const heroImage = heroSection.querySelector('.hero-image');
      if (heroImage) {
        heroImage.style.transform = `translateY(${scrollPosition * 0.1}px) rotate(2deg)`;
      }
    }
  });
  
  // Add hover effects to menu items
  const menuItems = document.querySelectorAll('.item');
  menuItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
      this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    });
  });
  
  // Add image lazy loading
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.loading = 'lazy';
    
    // Add error handler for images
    img.onerror = function() {
      this.src = 'default-coffee.jpg'; // Fallback image
    };
  });
  
  // Add animation to features
  const features = document.querySelectorAll('.feature');
  features.forEach((feature, index) => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      feature.style.transition = 'all 0.5s ease';
      feature.style.opacity = '1';
      feature.style.transform = 'translateY(0)';
    }, 200 * (index + 1));
  });
  
  // Check if user is already logged in
  const currentUser = localStorage.getItem('DV8CurrentUser');
  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser);
      updateUserUI(userData.email);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  // Add scrolling animation to sections
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };
    
    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    sections.forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(50px)';
      section.style.transition = 'all 0.8s ease';
      sectionObserver.observe(section);
    });
  }
  
  // Add CSS class for animation
  addStyles();
}
function initSmoothScroll() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function showToast(message, duration = 3000) {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Show toast with animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Hide and remove toast after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    // Remove after animation completes
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

function showModal(title, content) {
  // Remove existing modal
  const existingModal = document.querySelector('.modal-backdrop');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal elements
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  
  const modalElement = document.createElement('div');
  modalElement.className = 'modal';
  
  modalElement.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      ${content}
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary modal-ok">OK</button>
    </div>
  `;
  
  modalBackdrop.appendChild(modalElement);
  document.body.appendChild(modalBackdrop);
  
  // Add event listeners
  const closeBtn = modalElement.querySelector('.modal-close');
  const okBtn = modalElement.querySelector('.modal-ok');
  
  closeBtn.addEventListener('click', () => {
    modalBackdrop.classList.remove('active');
    setTimeout(() => {
      modalBackdrop.remove();
    }, 300);
  });
  
  okBtn.addEventListener('click', () => {
    modalBackdrop.classList.remove('active');
    setTimeout(() => {
      modalBackdrop.remove();
    }, 300);
  });
  
  // Show modal with animation
  setTimeout(() => {
    modalBackdrop.classList.add('active');
  }, 10);
}

function addStyles() {
  // Add CSS styles programmatically
  const style = document.createElement('style');
  style.textContent = `
    section.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .error { border-color:rgb(176, 129, 11) !important; }
    .error-message {
      color:rgb(225, 151, 3);
      font-size: 0.8rem;
      margin-top: 5px;
    }
    
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(184, 115, 51, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    }
    
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .modal {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      transform: scale(0.9);
      transition: all 0.3s ease;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .modal-title {
      font-size: 1.5rem;
      margin: 0;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color:rgb(0, 0, 0);
    }
    
    .modal-body {
      margin-bottom: 20px;
    }
    
    .modal-footer {
      text-align: right;
    }
    
    .modal-backdrop.active {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-backdrop.active .modal {
      transform: scale(1);
    }
    
    .btn.clicked {
      transform: scale(0.95);
      transition: transform 0.2s;
    }
  `;
  document.head.appendChild(style);
}
