import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import React, { useCallback, useState } from "react";
import {
  datadummy,
  type ICoordinate,
  type IBuilding,
  type IData,
  type IStory,
} from "./PlacesOld.constants";

const defaultCenter = {
  lat: -6.1944,
  lng: 106.8229,
};
const mapContainerStyle = {
  width: "100%",
  height: "500px",
  backgroundColor: "red",
};

const Places = () => {
  const [hover, setHover] = useState<{
    name: string;
    location: { lat: number; lng: number };
  } | null>(null);
  const [selected, setSelected] = useState<IData | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | null>(
    null
  );
  const [selectedStory, setSelectedStory] = useState<IStory | null>(null);
  const [overlay, setOverlay] = useState<any>(null);
  const [map, setMap] = useState<null>(null);
  const [showPin, setshowpin] = useState(false);
  const [marker, setMarker] = useState(defaultCenter);

  const onLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance);
  }, []);

  const getBoundsFromPolygon = (polygon: ICoordinate[]) => {
    // Extract latitudes and longitudes
    const lats = polygon.map((p) => p[1]);
    const lngs = polygon.map((p) => p[0]);

    // Find min/max for latitudes and longitudes
    const south = Math.min(...lats); // Minimum latitude
    const north = Math.max(...lats); // Maximum latitude
    const west = Math.min(...lngs); // Minimum longitude
    const east = Math.max(...lngs); // Maximum longitude

    // Return the bounds
    return { north, south, west, east };
  };

  const onMouseEnter = (data: {
    name: string;
    location: { lat: number; lng: number };
  }) => {
    setHover(data);
  };
  const onMouseLeave = () => {
    setHover(null);
  };

  const onSelect = (data: IData) => {
    if (!!data.area && !!map) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
      map.data.addGeoJson({
        type: "FeatureCollection",
        features: [data.area],
      });
    }
    setSelected(data);
    setMarker(data.location);
    setHover(null);
  };
  const onSelectBuilding = (data: IBuilding) => {
    if (!!data.area && !!map) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
      map.data.addGeoJson({
        type: "FeatureCollection",
        features: [data.area],
      });
    }
    setSelectedBuilding(data);
  };

  const onSelectStory = (data: IStory) => {
    if (!!selected?.area && !!selectedBuilding && !!data && !!map) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
      if (!!overlay) {
        overlay.setMap(null);
      }
      if (selectedBuilding?.area?.geometry.coordinates) {
        const newoverlay = new window.google.maps.GroundOverlay(
          data.floorplan,
          getBoundsFromPolygon(selectedBuilding?.area?.geometry.coordinates[0])
        );
        newoverlay.setMap(map); // Attach the overlay to the map
        setOverlay(newoverlay);
      }
    }
    setSelectedStory(data);
  };

  const onRemoveSelected = (v: number) => {
    if (v === 0) {
      if (!!map) {
        map.data.forEach((feature) => {
          map.data.remove(feature);
        });
      }
      setSelected(null);
      setSelectedBuilding(null);
      setSelectedStory(null);
      if (!!overlay) {
        overlay.setMap(null);
        setOverlay(null);
      }
    }
    if (v === 1) {
      if (!!map) {
        map.data.forEach((feature) => {
          map.data.remove(feature);
        });
      }
      setSelectedBuilding(null);
      if (!!map && !!selected) {
        map.data.addGeoJson({
          type: "FeatureCollection",
          features: [selected.area],
        });
      }
      setSelectedStory(null);
      if (!!overlay) {
        console.log("yooo");
        overlay.setMap(null);
        setOverlay(null);
      }
    }
  };

  const toggleShowpin = () => {
    setshowpin(!showPin);
    //setSelected(null);
    setSelectedBuilding(null);
    setSelectedStory(null);
    if (!!overlay) {
      overlay.setMap(null);
      setOverlay(null);
    }
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selected === null ? defaultCenter : selected?.location}
          zoom={selected === null ? 10 : 20}
          onLoad={onLoad}
        >
          {showPin ? (
            <Marker
              position={marker}
              draggable
              onDragEnd={(e) =>
                setMarker({
                  lat: e.latLng?.lat() ?? 0,
                  lng: e.latLng?.lng() ?? 0,
                })
              }
            />
          ) : null}
          {hover ? (
            <InfoWindow
              position={hover.location}
              options={{
                disableAutoPan: true,
              }}
            >
              <div>
                <p>{hover.name}</p>
              </div>
            </InfoWindow>
          ) : null}
          {selectedBuilding !== null && selectedStory === null
            ? selected?.buildings?.map((b, i) => (
                <Marker key={i} position={b.location} />
              ))
            : null}
          {selected !== null &&
          selectedBuilding === null &&
          selectedStory === null ? (
            <Marker position={selected.location} />
          ) : null}
        </GoogleMap>
      </div>
      <div className="col-md-4">
        <button
          className="btn btn-default"
          type="button"
          onClick={() => toggleShowpin()}
        >
          {showPin ? "Hide coordinate" : "Show coordinate"}
        </button>
        <br />
        {showPin ? (
          <>
            <input type="text" value={`${marker.lng + ", " + marker.lat}`} />
          </>
        ) : (
          <>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-default"
                onClick={() => onRemoveSelected(0)}
              >
                All
              </button>
              {[selected, selectedBuilding]
                .filter((i) => i !== null)
                .map((s, i) => (
                  <React.Fragment key={i}>
                    <button type="button" className="btn btn-default">
                      <i className="glyphicon glyphicon-triangle-right"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={() => onRemoveSelected(i + 1)}
                    >
                      {s?.name}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <br />
            {selected === null ? (
              <>
                Location:
                <div className="list-group">
                  {datadummy.map((item, key) => (
                    <button
                      key={key}
                      className={`list-group-item`}
                      onMouseEnter={() => onMouseEnter(item)}
                      onMouseLeave={onMouseLeave}
                      onClick={() => onSelect(item)}
                    >
                      <h4 className="list-group-item-heading">{item.name}</h4>
                    </button>
                  ))}
                </div>
              </>
            ) : !!selected.buildings && selectedBuilding === null ? (
              <>
                Building:
                <div className="list-group">
                  {selected.buildings.map((item, key) => (
                    <button
                      key={key}
                      className={`list-group-item`}
                      onMouseEnter={() => onMouseEnter(item)}
                      onMouseLeave={onMouseLeave}
                      onClick={() => onSelectBuilding(item)}
                    >
                      <h4 className="list-group-item-heading">{item.name}</h4>
                    </button>
                  ))}
                </div>
              </>
            ) : !!selectedBuilding?.stories ? (
              <>
                Story:
                <div className="list-group">
                  {selectedBuilding.stories
                    .sort((a, b) =>
                      a.sortOrder > b.sortOrder
                        ? 1
                        : a.sortOrder < b.sortOrder
                        ? -1
                        : 0
                    )
                    .map((item, key) => (
                      <button
                        key={key}
                        className={`list-group-item ${
                          item.id === selectedStory?.id ? "active" : ""
                        }`}
                        onMouseLeave={onMouseLeave}
                        onClick={() => onSelectStory(item)}
                      >
                        <h4 className="list-group-item-heading">{item.name}</h4>
                      </button>
                    ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
export default Places;
