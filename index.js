import('socket.io').then((io) => {
    const server = io.default(8000);
    
    const users = {};

    server.on('connection', socket => {
        // If any new user joins, let other users connected to the server know!
        socket.on('new-user-joined', name => {
            users[socket.id] = name;
            socket.broadcast.emit('user-joined', name);
        });

        // If someone sends a message, broadcast it to other people
        socket.on('send', async data => {
            let { message, translateFrom, translateTo } = data;
            try {
                // Translate the message
                const apiUrl = `https://api.mymemory.translated.net/get?q=${message}&langpair=${translateFrom}|${translateTo}`;
                const { default: fetch } = await import('node-fetch');
                const response = await fetch(apiUrl);
                const translationData = await response.json();
                const translatedMessage = translationData.responseData.translatedText;

                // Broadcast the translated message to other users
                socket.broadcast.emit('receive', { message: translatedMessage, name: users[socket.id] });
            } catch (error) {
                console.error('Translation Error:', error.message);
                socket.broadcast.emit('receive', { message: 'Error occurred while translating message', name: users[socket.id] });
            }
        });

        // If someone leaves the chat, let others know 
        socket.on('disconnect', () => {
            socket.broadcast.emit('left', users[socket.id]);
            delete users[socket.id];
        });
    });
}).catch(error => {
    console.error('Error loading socket.io:', error);
});