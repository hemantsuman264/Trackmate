import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";

// Connect to backend
const socket = io("http://localhost:3000");

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapPage = () => {
  const [position, setPosition] = useState([0, 0]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const userId = localStorage.getItem("userId") || crypto.randomUUID();
  const username = localStorage.getItem("username") || "You";
  console.log(userId);

  useEffect(() => {
    localStorage.setItem("userId", userId);
    //localStorage.setItem("username", response.data.username);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        socket.emit("sendLocation", { coords, userId, username });
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to access your location.");
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [userId, username]);

  useEffect(() => {
    socket.on("receiveLocation", ({ coords, userId: senderId, username }) => {
      if (senderId === userId) return;

      setOtherUsers((prev) => {
        const filtered = prev.filter((user) => user.userId !== senderId);
        return [...filtered, { coords, userId: senderId, username }];
      });
    });

    socket.on("updateOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("receiveLocation");
      socket.off("updateOnlineUsers");
    };
  }, [userId]);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      {/* Online Users Panel */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "#fff",
          padding: "10px",
          borderRadius: "8px",
          maxHeight: "200px",
          overflowY: "auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          zIndex: 1000,
        }}
      >
        <h4>Online Users</h4>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {onlineUsers.map((user) => (
            <li key={user.userId}>
              {user.username === username ? `${user.username} (You)` : user.username || user.userId}
            </li>
          ))}
        </ul>
      </div>

      <MapContainer center={position} zoom={13} style={{ height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Your marker */}
        <Marker position={position}>
          <Popup>{username} (You)</Popup>
        </Marker>

        {/* Other users */}
        {otherUsers.map((user) => (
          <Marker key={user.userId} position={user.coords}>
            <Popup>{user.username || "Another user"}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
