import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Định nghĩa icon Leaflet nếu cần
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});


// Component điều khiển bản đồ
const FlyToLocation = ({ center }) => {
  const map = useMap(); // Lấy đối tượng bản đồ từ hook
  map.flyTo(center, 14); // Di chuyển bản đồ đến vị trí mới với zoom = 14
  return null;
};

const MapComponent = () => {
  const [center, setCenter] = useState([10.7387, 106.7071]); // Tọa độ mặc định
  const [markerPosition, setMarkerPosition] = useState([10.7387, 106.7071]); // Marker tại default
  const [opacity, setOpacity] = useState(1); // Độ mờ bản đồ
  const [locationName, setLocationName] = useState(
    "Bệnh viện Quận 7, TP.HCM"
  ); 

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = event.target.search.value.trim();
    if (!query) {
      alert("Vui lòng nhập tên vị trí để tìm kiếm.");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=VN`
      );

      const data = await response.json();

      if (data.length === 0) {
        alert("Không tìm thấy vị trí.");
        return;
      }

      const { lat, lon, display_name } = data[0];
      const newCenter = [parseFloat(lat), parseFloat(lon)];
      setCenter(newCenter);
      setMarkerPosition(newCenter);
      setLocationName(display_name);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm vị trí:", error);
      alert("Có lỗi xảy ra khi tìm kiếm vị trí. Vui lòng thử lại.");
    }

    event.target.reset();
  };

  return (
    <div style={{ height: "100vh" }}>
      <style>
        {`
          .leaflet-bottom.leaflet-left {
            left: 10px;
            bottom: 10px;
          }
        `}
      </style>

      <form
        onSubmit={handleSearch}
        style={{
          position: "absolute",
          zIndex: 1000,
          padding: "10px",
          left: "50px", // Thêm khoảng cách từ cạnh phải 20px
          top: "10px", // Vị trí cách mép trên 10px
        }}
      >
        <input
          type="text"
          name="search"
          placeholder="Tìm kiếm vị trí..."
          style={{ padding: "5px", marginRight: "5px" }}
        />
        <button type="submit" style={{ padding: "5px" }}>
          Tìm kiếm
        </button>
      </form>


      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: "50px",
          right: "10px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <label htmlFor="opacity">Độ mờ của bản đồ:</label>
        <input
          type="range"
          id="opacity"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(e.target.value)}
          style={{ width: "100%" }}
        />
        <span>{Math.round(opacity * 100)}%</span>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
          opacity={opacity}
        />
        <FlyToLocation center={center} />
        <Marker position={markerPosition}>
          <Popup>{locationName}</Popup>
        </Marker>
      </MapContainer>
    </div>
    
  );
};

export default MapComponent;
