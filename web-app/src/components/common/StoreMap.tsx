import { GoogleMap, Marker, withGoogleMap, withScriptjs } from 'react-google-maps';

export default function StoreMap() {
  const Map = () => {
    return (
      <div>
        <GoogleMap
            defaultZoom={15}
            defaultCenter={{ lat: 21.027763, lng: 105.834160 }}
          >
            <Marker
              position={{ lat: 21.027763, lng: 105.834160 }}
          />
        </GoogleMap>
      </div>
    );
  }

  const WrappedMap: any = withScriptjs(withGoogleMap(Map));

  return (
    <div className="map">
      <WrappedMap 
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&callback=initMap`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `300px`, margin: `auto`}} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
  )
}