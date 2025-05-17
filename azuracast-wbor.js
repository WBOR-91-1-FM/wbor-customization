/* This file is version controlled! */
/* Ensure that if you make changes that they are updated here: */
/* https://github.com/WBOR-91-1-FM/wbor-customization/blob/main/azuracast-wbor.js */

document.addEventListener("DOMContentLoaded", function () {
  var websocketUrl = "wss://azura.wbor.org/api/live/nowplaying/websocket";
  var streamdiv = document.getElementById("streamdiv");
  var recentlyplayeddiv = document.getElementById("recentlyplayeddiv");
  var websocket; // Keep a reference to the current WebSocket

  var currentRetryInterval = 5000; // Initial retry interval: 5 seconds
  var maxRetryInterval = 60000; // Maximum retry interval: 60 seconds

  function createWebSocket() {
    console.log("Attempting WebSocket connection to:", websocketUrl);

    // If there's an existing WebSocket, close it before creating a new one
    if (
      websocket &&
      (websocket.readyState === WebSocket.OPEN ||
        websocket.readyState === WebSocket.CONNECTING)
    ) {
      console.log("Closing existing WebSocket before reconnecting.");
      websocket.onclose = null; // Prevent the old close handler from triggering a retry
      websocket.close();
    }

    var newWebsocket = new WebSocket(websocketUrl);

    newWebsocket.addEventListener("open", function (event) {
      console.log("WebSocket connection opened.");
      currentRetryInterval = 5000; // Reset retry interval on successful connection

      if (streamdiv) streamdiv.style.display = "revert";
      if (recentlyplayeddiv) recentlyplayeddiv.style.display = "revert";

      var connectionData = { subs: { "station:wbor": {} } };
      newWebsocket.send(JSON.stringify(connectionData));
    });

    newWebsocket.addEventListener("message", function (event) {
      try {
        var data = JSON.parse(event.data);

        if (
          data &&
          data.pub &&
          data.pub.data &&
          data.pub.data.np &&
          data.pub.data.np.now_playing &&
          data.pub.data.np.now_playing.song
        ) {
          var currentSong = data.pub.data.np.now_playing.song;
          var currentSongTitle = currentSong.title;
          var currentSongArtist = currentSong.artist;

          if (currentSongTitle === "Fetching song...") {
            console.log(
              "Did not receive a song: either WBOR audio encoder is down or new nowplaying metadata hasn't been sent yet."
            );
            document.title = "WBOR 91.1 FM - Bowdoin College Polar Bear Radio";
          } else {
            var concatenatedTitle =
              currentSongTitle + " - " + currentSongArtist + " | WBOR 91.1 FM";
            console.log("Current Song Title:", concatenatedTitle);
            document.title = concatenatedTitle;
          }
        }
      } catch (error) {
        console.error("Error parsing JSON from WebSocket:", error);
      }
    });

    newWebsocket.addEventListener("error", function (event) {
      console.error("WebSocket error observed:", event);
      // The 'close' event will usually follow, which will trigger the retry.
    });

    newWebsocket.addEventListener("close", function (event) {
      console.log(
        "WebSocket connection closed or failed to open. Reason:",
        event.code,
        event.reason
      );
      document.title = "WBOR 91.1 FM - Bowdoin College Polar Bear Radio";
      if (streamdiv) streamdiv.style.display = "none";
      if (recentlyplayeddiv) recentlyplayeddiv.style.display = "none";

      // Exponential backoff retry
      console.log(
        "Retrying WebSocket connection in " +
          currentRetryInterval / 1000 +
          " seconds..."
      );
      setTimeout(function () {
        websocket = createWebSocket(); // Re-assign the global websocket variable
      }, currentRetryInterval);

      // Increase retry interval for next time, up to a maximum
      currentRetryInterval = Math.min(
        currentRetryInterval * 2,
        maxRetryInterval
      );
    });

    return newWebsocket;
  }

  // Create the initial WebSocket connection
  websocket = createWebSocket();
});
