<script>
    document.addEventListener('DOMContentLoaded', function () {
        // Your existing JavaScript code here

        function updateTabTitle() {
            var websocketUrl = 'wss://listen.wbor.org/api/live/nowplaying/websocket';
            var retryInterval = 5000; // 5 seconds
            var streamdiv = document.getElementById('streamdiv');
            var recentlyplayeddiv = document.getElementById('recentlyplayeddiv');
            var fallbackContent = document.getElementById('fallbackContent');
            var websocket;

            function createWebSocket() {
                websocket = new WebSocket(websocketUrl);

                // Connection event
                websocket.addEventListener('open', handleWebSocketOpen);

                // Message event
                websocket.addEventListener('message', handleWebSocketMessage);

                // Close event (connection drops or fails to connect)
                websocket.addEventListener('close', handleWebSocketClose);
            }

            function handleWebSocketOpen(event) {
                console.log('WebSocket connection opened.');
                fallbackContent.style.display = 'none';
                streamdiv.style.display = 'revert';
                recentlyplayeddiv.style.display = 'revert';

                // Send the connection string
                var connectionData = { "subs": { "station:wbor": {} } };
                websocket.send(JSON.stringify(connectionData));
            }

            function handleWebSocketMessage(event) {
                try {
                    var data = JSON.parse(event.data);
                    console.log('Received data:', data);

                    // Check if it's a Now Playing update
                    if (data && data.pub && data.pub.data && data.pub.data.np && data.pub.data.np.now_playing && data.pub.data.np.now_playing.song) {
                        var currentSong = data.pub.data.np.now_playing.song;
                        var currentSongTitle = currentSong.title;
                        var currentSongArtist = currentSong.artist;

                        if (currentSongTitle === "Fetching song...") {
                            console.log('Did not receive a song: either WBOR audio encoder is down or new nowplaying metadata hasn\'t been sent yet.');
                            document.title = "WBOR 91.1 FM - Bowdoin College Polar Bear Radio";
                        } else {
                            // Concatenate "title" and "artist"
                            var concatenatedTitle = currentSongTitle + ' - ' + currentSongArtist;
                            console.log('Current Song Title:', concatenatedTitle);
                            document.title = concatenatedTitle;
                        }
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }

            function handleWebSocketClose(event) {
                console.log('WebSocket connection failed.');
                document.title = "WBOR 91.1 FM - Bowdoin College Polar Bear Radio";
                fallbackContent.style.display = 'block';
                streamdiv.style.display = 'none';
                recentlyplayeddiv.style.display = 'none';
                retry();
            }

            function retry() {
                console.log('Retrying in ' + retryInterval / 1000 + ' seconds...');
                setTimeout(createWebSocket, retryInterval);
            }

            // Create the initial WebSocket connection
            createWebSocket();
        }

    // Call the function initially and update it as needed
    updateTabTitle();
});
</script>