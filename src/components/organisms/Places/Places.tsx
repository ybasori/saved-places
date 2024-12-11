import { GoogleMap } from "@react-google-maps/api";
import React, { useCallback, useEffect, useState } from "react";
import { type ICoordinate, type IData } from "./Places.constants";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { onFetchArrayAsync, useLazyFetch } from "@/helper/fetch";
import { createSelector } from "@reduxjs/toolkit";
import Modal from "@/components/atoms/Modal/Modal";
import PlaceAddEdit from "./contents/PlaceAddEdit";
import { useGoogleMaps } from "../GoogleMapsProvider/GoogleMapsProvider";
import Marker from "@/components/atoms/Marker/Marker";
import StoryAddEdit from "./contents/StoryAddEdit";
import RotatedOverlay from "@/components/atoms/RotatedOverlay/RotatedOverlay";

const Places = () => {
  const auth = useSelector(
    createSelector([(state: RootState) => state.auth], (auth) => auth.authData)
  );
  const isLoaded = useGoogleMaps();
  const [onGetPlaces] = useLazyFetch({
    url: "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/places",
    method: "GET",
  });
  const [onGetStories] = useLazyFetch({
    url: "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/stories",
    method: "GET",
  });

  const [modalAdd, setModalAdd] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<IData[]>([]);

  const [hover, setHover] = useState<{
    name: string;
    location: { lat: number; lng: number };
  } | null>(null);
  const [overlay, setOverlay] = useState<any>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [oneTime, setOneTime] = useState(true);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [selectedBuildingKey, setSelectedBuildingKey] = useState<number | null>(
    null
  );
  const [selectedStoryKey, setSelectedStoryKey] = useState<number | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
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

  const onMouseEnter = (data: { name: string; lat: string; lng: string }) => {
    setHover({
      name: data.name,
      location: {
        lat: Number(data.lat),
        lng: Number(data.lng),
      },
    });
  };
  const onMouseLeave = () => {
    setHover(null);
  };

  const onSelect = (key: number) => {
    if (!!savedPlaces[key].area && !!map) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
      map.data.addGeoJson({
        type: "FeatureCollection",
        features: [savedPlaces[key].area],
      });
    }
    setHover(null);
    setSelectedKey(key);

    getPlaces(savedPlaces[key].id, (result) => {
      setSavedPlaces(
        savedPlaces.map((i, j) => (key === j ? { ...i, buildings: result } : i))
      );
    });
  };
  const onSelectBuilding = (selected: number) => {
    setSelectedBuildingKey(selected);
    if (
      selectedKey !== null &&
      !!savedPlaces?.[selectedKey]?.buildings?.[selected].area &&
      !!map
    ) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
      map.data.addGeoJson({
        type: "FeatureCollection",
        features: [savedPlaces[selectedKey].buildings?.[selected].area],
      });

      onGetStories(
        {
          query: {
            filter: {
              place_id: savedPlaces?.[selectedKey]?.buildings?.[selected].id,
            },
          },
        },
        auth?.token ?? null,
        (error, response) => {
          if (!!!error) {
            setSavedPlaces(
              savedPlaces.map((i, j) =>
                selectedKey === j
                  ? {
                      ...i,
                      buildings: i.buildings?.map((k, l) =>
                        l === selected
                          ? { ...k, stories: response?.data.result.data }
                          : k
                      ),
                    }
                  : i
              )
            );
          }
        }
      );
    }
  };

  const onSelectStory = (key: number) => {
    if (
      selectedKey !== null &&
      !!savedPlaces[selectedKey]?.area &&
      selectedBuildingKey !== null &&
      !!savedPlaces[selectedKey]?.buildings?.[selectedBuildingKey] &&
      key !== null &&
      !!map
    ) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
    }
    setSelectedStoryKey(key);
  };

  const onRemoveSelected = (v: number) => {
    if (v === 0) {
      if (!!map) {
        map.data.forEach((feature) => {
          map.data.remove(feature);
        });
      }
      setSelectedKey(null);
      setSelectedBuildingKey(null);
      setSelectedStoryKey(null);
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
      setSelectedBuildingKey(null);
      if (!!map && !!selectedKey) {
        map.data.addGeoJson({
          type: "FeatureCollection",
          features: [savedPlaces[selectedKey].area],
        });
      }
      setSelectedStoryKey(null);
      if (!!overlay) {
        overlay.setMap(null);
        setOverlay(null);
      }
    }
  };

  const getPlaces = useCallback(
    (parent_id: string, cb: (sp: any) => void) => {
      onGetPlaces(
        {
          query: {
            filter: { parent_id },
          },
        },
        auth?.token ?? null,
        (error, response) => {
          if (!error) {
            const sp = response?.data.result.data;
            onFetchArrayAsync(auth?.token ?? "")(
              sp.map((item: { id: string }) => ({
                url: "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/place-areas",
                method: "GET",
                data: {
                  filter: {
                    place_id: item.id,
                  },
                },
              })),
              {
                success: (response) => {
                  sp.forEach((el: { id: string }, index: number) => {
                    sp[index].area = {
                      type: "Feature",
                      geometry: {
                        type: "Polygon",
                        coordinates: [[]],
                      },
                    };
                    response.forEach((r) => {
                      r.data.result.data
                        .map((i: { seq: string }) => ({
                          ...i,
                          seq: Number(i.seq),
                        }))
                        .sort(
                          (a: { seq: number }, b: { seq: number }) =>
                            a.seq - b.seq
                        )
                        .forEach(
                          (dt: {
                            place_id: string;
                            lng: string;
                            lat: string;
                          }) => {
                            if (el.id === dt.place_id) {
                              sp[index].area.geometry.coordinates = [
                                [
                                  ...sp[index].area.geometry.coordinates[0],
                                  [Number(dt.lng), Number(dt.lat)],
                                ],
                              ];
                            }
                          }
                        );
                    });
                  });
                  cb(sp);
                },
                error: () => {
                  cb(sp);
                },
              }
            );
          }
        }
      );
    },
    [auth?.token, onGetPlaces]
  );

  useEffect(() => {
    if (oneTime) {
      setOneTime(false);
      getPlaces("null", (result) => {
        setSavedPlaces(result);
      });
    }
  }, [oneTime, getPlaces]);

  return (
    <div className="row">
      <div className="col-md-8">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "500px",
              backgroundColor: "red",
            }}
            center={
              selectedKey === null
                ? {
                    lat: -6.1944,
                    lng: 106.8229,
                  }
                : {
                    lat: Number(savedPlaces[selectedKey].lat),
                    lng: Number(savedPlaces[selectedKey].lng),
                  }
            }
            zoom={selectedKey === null ? 10 : 20}
            onLoad={onLoad}
          >
            {hover ? (
              <Marker position={hover.location} text={hover.name} />
            ) : null}
            {!!map &&
            selectedKey !== null &&
            selectedBuildingKey !== null &&
            selectedStoryKey === null ? (
              <>
                <Marker
                  position={{
                    lat: Number(
                      savedPlaces[selectedKey].buildings?.[selectedBuildingKey]
                        .lat
                    ),
                    lng: Number(
                      savedPlaces[selectedKey].buildings?.[selectedBuildingKey]
                        .lng
                    ),
                  }}
                  text={
                    savedPlaces[selectedKey].buildings?.[selectedBuildingKey]
                      .name
                  }
                />
              </>
            ) : null}
            {!!map &&
            selectedKey !== null &&
            selectedBuildingKey !== null &&
            selectedStoryKey !== null ? (
              <>
                <RotatedOverlay
                  map={map}
                  bounds={getBoundsFromPolygon(
                    savedPlaces[selectedKey].buildings?.[selectedBuildingKey]
                      ?.area?.geometry?.coordinates[0] as [number, number][]
                  )}
                  image={
                    savedPlaces[selectedKey].buildings?.[selectedBuildingKey]
                      .stories?.[selectedStoryKey].floorplan ?? ""
                  } // Replace with your image URL
                  rotation={Number(
                    savedPlaces[selectedKey].buildings?.[selectedBuildingKey]
                      .stories?.[selectedStoryKey].rotate ?? "0"
                  )} // Rotation angle in degrees
                />
              </>
            ) : null}
            {selectedKey !== null &&
            selectedBuildingKey === null &&
            selectedStoryKey === null ? (
              <Marker
                position={{
                  lat: Number(savedPlaces[selectedKey].lat),
                  lng: Number(savedPlaces[selectedKey].lng),
                }}
                text={savedPlaces[selectedKey].name}
              />
            ) : null}
          </GoogleMap>
        ) : (
          <></>
        )}
      </div>
      <div className="col-md-4">
        <>
          <div className="row">
            <div className="col-md-12">
              {selectedKey === null ? (
                <>
                  <h3 className="pull-left">Location</h3>

                  <button
                    className="btn btn-default pull-right mt-5"
                    type="button"
                    onClick={() => setModalAdd(!modalAdd)}
                  >
                    Create Location
                  </button>
                </>
              ) : selectedKey !== null && selectedBuildingKey === null ? (
                <>
                  <h3 className="pull-left">Building</h3>
                  <button
                    className="btn btn-default pull-right mt-5"
                    type="button"
                    onClick={() => setModalAdd(!modalAdd)}
                  >
                    Create Building
                  </button>
                </>
              ) : selectedKey !== null &&
                selectedBuildingKey !== null &&
                !!savedPlaces[selectedKey].buildings?.[selectedBuildingKey] ? (
                <>
                  <h3 className="pull-left">Story</h3>
                  <button
                    className="btn btn-default pull-right mt-5"
                    type="button"
                    onClick={() => setModalAdd(!modalAdd)}
                  >
                    Create Story
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="btn-group pull-left">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() => onRemoveSelected(0)}
                >
                  All
                </button>
                {[
                  selectedKey !== null ? savedPlaces[selectedKey] : null,
                  selectedKey !== null && selectedBuildingKey !== null
                    ? savedPlaces[selectedKey]?.buildings?.[selectedBuildingKey]
                    : null,
                ]
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
            </div>
          </div>
          <br />
          {selectedKey === null ? (
            <>
              <table className="table table-hover">
                <tbody>
                  {[...savedPlaces].map((item, key) => (
                    <tr
                      key={key}
                      onMouseEnter={() => onMouseEnter(item)}
                      onMouseLeave={onMouseLeave}
                    >
                      <td onClick={() => onSelect(key)}>{item.name}</td>
                      <td>
                        <div className="btn-group pull-right">
                          <button
                            type="button"
                            className="btn btn-default"
                            onClick={() => onSelect(key)}
                          >
                            View
                          </button>
                          <button type="button" className="btn btn-default">
                            Edit
                          </button>
                          <button type="button" className="btn btn-default">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Modal
                isOpen={modalAdd}
                toggle={() => setModalAdd(!modalAdd)}
                backdrop="static"
                size="lg"
              >
                <PlaceAddEdit
                  onClose={() => setModalAdd(!modalAdd)}
                  onReload={() => setOneTime(true)}
                />
              </Modal>
            </>
          ) : selectedKey !== null && selectedBuildingKey === null ? (
            <>
              {!!savedPlaces[selectedKey].buildings ? (
                <table className="table table-hover">
                  <tbody>
                    {savedPlaces[selectedKey].buildings.map((item, key) => (
                      <tr
                        key={key}
                        onMouseEnter={() => onMouseEnter(item)}
                        onMouseLeave={onMouseLeave}
                      >
                        <td onClick={() => onSelect(key)}>{item.name}</td>
                        <td>
                          <div className="btn-group pull-right">
                            <button
                              type="button"
                              className="btn btn-default"
                              onClick={() => onSelectBuilding(key)}
                            >
                              View
                            </button>
                            <button type="button" className="btn btn-default">
                              Edit
                            </button>
                            <button type="button" className="btn btn-default">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              <Modal
                isOpen={modalAdd}
                toggle={() => setModalAdd(!modalAdd)}
                backdrop="static"
                size="lg"
              >
                <PlaceAddEdit
                  parentId={savedPlaces[selectedKey].id}
                  onClose={() => setModalAdd(!modalAdd)}
                  onReload={() => {
                    getPlaces(savedPlaces[selectedKey].id, (result) => {
                      setSavedPlaces(
                        savedPlaces.map((i, j) =>
                          selectedKey === j ? { ...i, buildings: result } : i
                        )
                      );
                    });
                  }}
                />
              </Modal>
            </>
          ) : selectedKey !== null &&
            selectedBuildingKey !== null &&
            !!savedPlaces[selectedKey].buildings?.[selectedBuildingKey] ? (
            <>
              <table className="table table-hover">
                <tbody>
                  {savedPlaces[selectedKey].buildings[
                    selectedBuildingKey
                  ].stories
                    ?.sort((a, b) =>
                      a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0
                    )
                    .map((item, key) => (
                      <tr key={key}>
                        <td
                          onMouseLeave={onMouseLeave}
                          onClick={() => onSelectStory(key)}
                        >
                          {item.name}
                        </td>
                        <td>
                          <div className="btn-group pull-right">
                            <button
                              type="button"
                              className="btn btn-default"
                              onClick={() => onSelectStory(key)}
                            >
                              View
                            </button>
                            <button type="button" className="btn btn-default">
                              Edit
                            </button>
                            <button type="button" className="btn btn-default">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Modal
                isOpen={modalAdd}
                toggle={() => setModalAdd(!modalAdd)}
                backdrop="static"
                size="lg"
              >
                <StoryAddEdit
                  lastSequence={Number(
                    savedPlaces[selectedKey].buildings[
                      selectedBuildingKey
                    ].stories?.sort((a, b) => Number(a.seq) - Number(b.seq))[
                      savedPlaces[selectedKey].buildings[selectedBuildingKey]
                        .stories.length - 1
                    ].seq ?? "0"
                  )}
                  buildingData={
                    savedPlaces[selectedKey].buildings[selectedBuildingKey]
                  }
                  onClose={() => setModalAdd(!modalAdd)}
                  onReload={() => null}
                />
              </Modal>
            </>
          ) : null}
        </>
      </div>
    </div>
  );
};
export default Places;
