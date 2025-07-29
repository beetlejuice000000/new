// QB-Core Phone System JavaScript
// Complete copy-pastable JavaScript for FiveM phone interface

// Global variables
let currentScreen = 'home-screen';
let dialedNumber = '';
let contacts = [
    {
        name: 'Alex Lopez',
        number: '555-0321',
        initials: 'AL',
        color: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
    },
    {
        name: 'Mike Smith',
        number: '555-0456',
        initials: 'MS',
        color: 'linear-gradient(135deg, #e74c3c, #c0392b)'
    },
    {
        name: 'John Doe',
        number: '555-0123',
        initials: 'JD',
        color: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
        name: 'Police Dispatch',
        number: '911',
        initials: 'PD',
        color: 'linear-gradient(135deg, #f39c12, #e67e22)'
    },
    {
        name: 'Sarah Johnson',
        number: '555-0789',
        initials: 'SJ',
        color: 'linear-gradient(135deg, #2ecc71, #27ae60)'
    }
];

let conversations = [
    {
        number: '555-0123',
        name: 'John Doe',
        lastMessage: 'Hey, are you available for the job tonight?',
        time: '2:30 PM',
        unread: 2,
        initials: 'JD',
        color: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
        number: '555-0456',
        name: 'Mike Smith',
        lastMessage: 'Thanks for the help earlier!',
        time: '1:15 PM',
        unread: 0,
        initials: 'MS',
        color: 'linear-gradient(135deg, #e74c3c, #c0392b)'
    },
    {
        number: '555-0789',
        name: 'Sarah Johnson',
        lastMessage: 'Can you pick me up from the airport?',
        time: '11:45 AM',
        unread: 1,
        initials: 'SJ',
        color: 'linear-gradient(135deg, #2ecc71, #27ae60)'
    },
    {
        number: '911',
        name: 'Police Dispatch',
        lastMessage: 'Unit 23, respond to 123 Main Street',
        time: '10:20 AM',
        unread: 0,
        initials: 'PD',
        color: 'linear-gradient(135deg, #f39c12, #e67e22)'
    },
    {
        number: '555-0321',
        name: 'Alex Lopez',
        lastMessage: 'The car is ready for pickup',
        time: 'Yesterday',
        unread: 0,
        initials: 'AL',
        color: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
    }
];

let callHistory = [];
let phoneVisible = false;

// Initialize phone system
function initializePhone() {
    updateTime();
    setInterval(updateTime, 1000);
    renderContacts();
    renderConversations();
    setupEventListeners();
    console.log('QB Phone System Initialized');
}

// Time update function
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: false 
    });
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = time;
    }
}

// Navigation functions
function openApp(appName) {
    console.log('Opening app:', appName);
    
    // Hide all screens
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show requested app screen
    const targetScreen = document.getElementById(appName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = appName + '-screen';
        
        // Trigger app-specific initialization
        switch(appName) {
            case 'contacts':
                renderContacts();
                break;
            case 'messages':
                renderConversations();
                break;
            case 'phone':
                clearNumber();
                break;
        }
    }

    // Send to FiveM client
    sendNUIMessage({
        action: 'openApp',
        app: appName
    });
}

function goHome() {
    console.log('Going to home screen');
    
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('home-screen').classList.add('active');
    currentScreen = 'home-screen';

    sendNUIMessage({
        action: 'goHome'
    });
}

// Phone app functions
function dialNumber(num) {
    dialedNumber += num;
    const displayElement = document.getElementById('dialed-number');
    if (displayElement) {
        displayElement.textContent = dialedNumber;
    }
    
    // Haptic feedback simulation
    navigator.vibrate && navigator.vibrate(50);
    
    console.log('Dialed:', num, 'Current number:', dialedNumber);
}

function clearNumber() {
    dialedNumber = '';
    const displayElement = document.getElementById('dialed-number');
    if (displayElement) {
        displayElement.textContent = '';
    }
    console.log('Number cleared');
}

function deleteLastDigit() {
    if (dialedNumber.length > 0) {
        dialedNumber = dialedNumber.slice(0, -1);
        const displayElement = document.getElementById('dialed-number');
        if (displayElement) {
            displayElement.textContent = dialedNumber;
        }
    }
}

function makeCall() {
    if (dialedNumber.trim() === '') {
        console.log('No number to call');
        return;
    }
    
    console.log('Making call to:', dialedNumber);
    
    // Add to call history
    addToCallHistory(dialedNumber, 'outgoing');
    
    sendNUIMessage({
        action: 'makeCall',
        number: dialedNumber,
        type: 'outgoing'
    });
    
    // Clear number after calling
    setTimeout(() => {
        clearNumber();
    }, 1000);
}

function addToCallHistory(number, type) {
    const contact = contacts.find(c => c.number === number);
    const historyEntry = {
        number: number,
        name: contact ? contact.name : number,
        type: type, // 'incoming', 'outgoing', 'missed'
        time: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        }),
        date: new Date().toLocaleDateString()
    };
    
    callHistory.unshift(historyEntry);
    
    // Keep only last 50 calls
    if (callHistory.length > 50) {
        callHistory = callHistory.slice(0, 50);
    }
}

function showRecents() {
    console.log('Showing call history');
    sendNUIMessage({
        action: 'showRecents',
        history: callHistory
    });
}

// Messages app functions
function newMessage() {
    console.log('Opening new message composer');
    sendNUIMessage({
        action: 'newMessage'
    });
}

function openConversation(number) {
    console.log('Opening conversation with:', number);
    
    // Mark conversation as read
    const conversation = conversations.find(c => c.number === number);
    if (conversation) {
        conversation.unread = 0;
        renderConversations();
    }
    
    sendNUIMessage({
        action: 'openConversation',
        number: number,
        contact: contacts.find(c => c.number === number) || { name: number, number: number }
    });
}

function searchConversations(query) {
    console.log('Searching conversations for:', query);
    
    const conversationsList = document.getElementById('conversations-list');
    if (!conversationsList) return;
    
    const filteredConversations = conversations.filter(conv => 
        conv.name.toLowerCase().includes(query.toLowerCase()) ||
        conv.number.includes(query) ||
        conv.lastMessage.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredConversations.length === 0 && query.length > 0) {
        conversationsList.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #6c757d; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">🔍</div>
                <h3>No conversations found</h3>
                <p>Try searching with a different term</p>
            </div>
        `;
    } else {
        renderConversations(filteredConversations);
    }
}

function renderConversations(conversationsToRender = conversations) {
    const conversationsList = document.getElementById('conversations-list');
    if (!conversationsList) return;
    
    conversationsList.innerHTML = conversationsToRender.map(conv => `
        <div class="conversation" onclick="openConversation('${conv.number}')">
            <div class="avatar" style="background: ${conv.color};">${conv.initials}</div>
            <div class="conversation-info">
                <div class="conversation-header">
                    <div class="contact-name">${conv.name}</div>
                    <div class="msg-time">${conv.time}</div>
                </div>
                <div class="last-message">${conv.lastMessage}</div>
            </div>
            ${conv.unread > 0 ? `<div class="unread-badge">${conv.unread}</div>` : ''}
        </div>
    `).join('');
}

// Contacts app functions
function addContact() {
    console.log('Adding new contact');
    sendNUIMessage({
        action: 'addContact'
    });
}

function contactAction(number) {
    console.log('Contact action for:', number);
    
    const contact = contacts.find(c => c.number === number);
    if (contact) {
        sendNUIMessage({
            action: 'contactAction',
            contact: contact
        });
    }
}

function searchContacts(query) {
    console.log('Searching contacts for:', query);
    
    const contactsList = document.getElementById('contacts-list');
    if (!contactsList) return;
    
    const filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        contact.number.includes(query)
    );

    if (filteredContacts.length === 0 && query.length > 0) {
        contactsList.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #6c757d; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">👥</div>
                <h3>No contacts found</h3>
                <p>Try searching with a different term</p>
            </div>
        `;
    } else {
        renderContacts(filteredContacts);
    }
}

function renderContacts(contactsToRender = contacts) {
    const contactsList = document.getElementById('contacts-list');
    if (!contactsList) return;
    
    contactsList.innerHTML = contactsToRender.map(contact => `
        <div class="contact" onclick="contactAction('${contact.number}')">
            <div class="contact-avatar" style="background: ${contact.color};">${contact.initials}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-number">${contact.number}</div>
            </div>
        </div>
    `).join('');
}

// Data management functions
function addNewContact(name, number) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #e74c3c, #c0392b)',
        'linear-gradient(135deg, #2ecc71, #27ae60)',
        'linear-gradient(135deg, #f39c12, #e67e22)',
        'linear-gradient(135deg, #9b59b6, #8e44ad)',
        'linear-gradient(135deg, #1abc9c, #16a085)',
        'linear-gradient(135deg, #34495e, #2c3e50)'
    ];
    
    const newContact = {
        name: name,
        number: number,
        initials: initials,
        color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    contacts.push(newContact);
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
    
    console.log('Added new contact:', newContact);
}

function addNewConversation(number, name, message) {
    const contact = contacts.find(c => c.number === number);
    const existingConv = conversations.find(c => c.number === number);
    
    if (existingConv) {
        existingConv.lastMessage = message;
        existingConv.time = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        existingConv.unread += 1;
    } else {
        const newConversation = {
            number: number,
            name: contact ? contact.name : name || number,
            lastMessage: message,
            time: new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            }),
            unread: 1,
            initials: contact ? contact.initials : (name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : number.slice(-2)),
            color: contact ? contact.color : 'linear-gradient(135deg, #95a5a6, #7f8c8d)'
        };
        conversations.unshift(newConversation);
    }
    
    renderConversations();
}

// Utility functions
function sendNUIMessage(data) {
    if (window.invokeNative) {
        window.invokeNative('sendNuiMessage', JSON.stringify(data));
    }
    
    // Also try PostMessage for different FiveM setups
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(data, '*');
    }
    
    console.log('Sent NUI message:', data);
}

function playNotificationSound() {
    // Create a simple notification sound
    if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

function showNotification(title, message, duration = 3000) {
    console.log('Notification:', title, message);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        text-align: center;
        backdrop-filter: blur(10px);
        animation: slideDown 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">${title}</div>
        <div style="opacity: 0.8;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Event listeners setup
function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (!phoneVisible) return;
        
        switch(event.key) {
            case 'Escape':
                hidePhone();
                break;
            case 'Backspace':
                if (currentScreen === 'phone-screen') {
                    deleteLastDigit();
                }
                break;
            case 'Enter':
                if (currentScreen === 'phone-screen' && dialedNumber) {
                    makeCall();
                }
                break;
            default:
                // Handle number input
                if (currentScreen === 'phone-screen' && /^[0-9*#]$/.test(event.key)) {
                    dialNumber(event.key);
                }
                break;
        }
    });
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
    
    // Handle touch events for mobile-like experience
    let touchStartY = 0;
    document.addEventListener('touchstart', function(event) {
        touchStartY = event.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(event) {
        const touchEndY = event.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;
        
        // Swipe up to close phone (if implemented)
        if (diffY > 100) {
            console.log('Swipe up detected');
        }
    });
}

// Phone visibility functions
function showPhone() {
    phoneVisible = true;
    document.body.style.display = 'flex';
    goHome();
    console.log('Phone shown');
}

function hidePhone() {
    phoneVisible = false;
    document.body.style.display = 'none';
    sendNUIMessage({ action: 'closePhone' });
    console.log('Phone hidden');
}

// Message handling from FiveM
window.addEventListener('message', function(event) {
    const data = event.data;
    
    console.log('Received message:', data);
    
    switch(data.action) {
        case 'show':
        case 'showPhone':
            showPhone();
            break;
            
        case 'hide':
        case 'hidePhone':
            hidePhone();
            break;
            
        case 'openApp':
            if (data.app) {
                openApp(data.app);
            }
            break;
            
        case 'goHome':
            goHome();
            break;
            
        case 'updateContacts':
            if (data.contacts) {
                contacts = data.contacts;
                renderContacts();
            }
            break;
            
        case 'updateConversations':
            if (data.conversations) {
                conversations = data.conversations;
                renderConversations();
            }
            break;
            
        case 'incomingCall':
            if (data.number && data.name) {
                handleIncomingCall(data.number, data.name);
            }
            break;
            
        case 'newMessage':
            if (data.number && data.message) {
                addNewConversation(data.number, data.name || data.number, data.message);
                playNotificationSound();
                showNotification('New Message', `${data.name || data.number}: ${data.message}`);
            }
            break;
            
        case 'callEnded':
            console.log('Call ended');
            addToCallHistory(data.number, data.type || 'outgoing');
            break;
            
        case 'addContact':
            if (data.name && data.number) {
                addNewContact(data.name, data.number);
            }
            break;
            
        case 'notification':
            if (data.title && data.message) {
                showNotification(data.title, data.message, data.duration);
                if (data.sound !== false) {
                    playNotificationSound();
                }
            }
            break;
    }
});

function handleIncomingCall(number, name) {
    console.log('Incoming call from:', name, number);
    
    addToCallHistory(number, 'incoming');
    playNotificationSound();
    
    // You can implement incoming call UI here
    showNotification('Incoming Call', `${name} is calling...`, 5000);
    
    sendNUIMessage({
        action: 'incomingCallUI',
        number: number,
        name: name
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePhone);
} else {
    initializePhone();
}

// Export functions for external use (if needed)
window.QBPhone = {
    showPhone,
    hidePhone,
    openApp,
    goHome,
    dialNumber,
    makeCall,
    addNewContact,
    addNewConversation,
    sendNUIMessage,
    showNotification
};

$(document).ready(function() {
    window.addEventListener('message', function(event) {
        if (event.data.action === "openPhone") {
            $(".phone-container").fadeIn();
        }

        if (event.data.action === "closePhone") {
            $(".phone-container").fadeOut();
        }
    });
});

SetNuiFocus(true, true) -- only when needed


console.log('QB-Core Phone JavaScript loaded successfully');
