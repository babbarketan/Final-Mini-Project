const socket = io('http://localhost:8000');

// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const translateFromSelect = document.getElementById('translateFrom');
const translateToSelect = document.getElementById('translateTo');

// Load previous messages from local storage if available
const previousMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];

// Function to append a message to the container
const appendMessage = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
};

// Function to update local storage with new message
const updateLocalStorage = (messageData) => {
    previousMessages.push(messageData);
    localStorage.setItem('chatMessages', JSON.stringify(previousMessages));
};

// Display previous messages
previousMessages.forEach(messageData => {
    appendMessage(`${messageData.name}: ${messageData.message}`, 'left');
});

// Ask new user for their name and let the server know
const name = prompt('Enter your name to join');
socket.emit('new-user-joined', name);

// If a new user joins, receive their name from the server
socket.on('user-joined', name => {
    appendMessage(`${name} joined the chat`, 'right');
});

// If server sends a message, receive it
socket.on('receive', data => {
    appendMessage(`${data.name}: ${data.message}`, 'left');
    updateLocalStorage(data);
});

// If a user leaves the chat, append the info to the container
socket.on('left', name => {
    appendMessage(`${name} left the chat`, 'right');
});

// If the form gets submitted, send server the message
form.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    const translateFrom = translateFromSelect.value;
    const translateTo = translateToSelect.value;
    appendMessage(`You: ${message}`, 'right');
    socket.emit('send', { message, translateFrom, translateTo });
    updateLocalStorage({ name: 'You', message }); // Save own message to local storage
    messageInput.value = '';
});
