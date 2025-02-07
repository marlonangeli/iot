'use client'

import {useState} from 'react'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {Icon} from 'leaflet'

const sensorIcon = new Icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 25]
})

const trackerIcon = new Icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 25]
})

const devices = [
  {id: 1, name: 'Sensor de temperatura 1', type: 'sensor', lat: 51.505, lng: -0.09},
  {id: 2, name: 'GPS 1', type: 'tracker', lat: 51.51, lng: -0.1},
  {id: 3, name: 'Sensor de umidade 1', type: 'sensor', lat: 51.515, lng: -0.09},
  {id: 4, name: 'Sensor de ambiente 1', type: 'sensor', lat: 51.52, lng: -0.1},
]

export default function MapPage() {
  const [center,] = useState({lat: 51.505, lng: -0.09})
  const [zoom,] = useState(13)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mapa</h1>

      <div style={{height: '500px', width: '100%'}}>
        <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{height: '100%', width: '100%'}}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {devices.map((device) => (
            <Marker
              key={device.id}
              position={[device.lat, device.lng]}
              icon={device.type === 'sensor' ? sensorIcon : trackerIcon}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{device.name}</h3>
                  <p>Tipo: {device.type}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

