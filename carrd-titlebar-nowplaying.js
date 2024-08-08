<script>
    document.addEventListener('DOMContentLoaded', function () {

        function updateTabTitle() {
            var websocketUrl = 'wss://azura.wbor.org/api/live/nowplaying/websocket';
            var retryInterval = 5000; // 5 seconds
            var streamdiv = document.getElementById('streamdiv');
            var recentlyplayeddiv = document.getElementById('recentlyplayeddiv');

            function createWebSocket() {
                var websocket = new WebSocket(websocketUrl);

                websocket.addEventListener('open', function (event) {
                    console.log('WebSocket connection opened.');
                    streamdiv.style.display = 'revert';
                    recentlyplayeddiv.style.display = 'revert';

                    var connectionData = { "subs": { "station:wbor": {} } };
                    websocket.send(JSON.stringify(connectionData));
                });

                websocket.addEventListener('message', function (event) {
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
                                var concatenatedTitle = currentSongTitle + ' - ' + currentSongArtist + ' | WBOR 91.1 FM';
                                console.log('Current Song Title:', concatenatedTitle);
                                document.title = concatenatedTitle;
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                });

                // Close event (connection drops or fails to connect)
                websocket.addEventListener('close', function (event) {
                    console.log('WebSocket connection failed.');
                    document.title = "WBOR 91.1 FM - Bowdoin College Polar Bear Radio";
                    streamdiv.style.display = 'none';
                    recentlyplayeddiv.style.display = 'none';
                    retry();
                });

                return websocket;
            }

            function retry() {
                console.log('Retrying in ' + retryInterval / 1000 + ' seconds...');
                setTimeout(function () {
                    updateTabTitle();
                }, retryInterval);
            }

            // Create the initial WebSocket connection
            var websocket = createWebSocket();

            // Clear the previous WebSocket connection when retrying
            function clearWebSocket() {
                websocket.removeEventListener('open', function () { });
                websocket.removeEventListener('message', function () { });
                websocket.removeEventListener('close', function () { });
                websocket.close();
            }
        }

updateTabTitle();
});
</script>
