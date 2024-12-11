import { ICallbackSubmit, useForm } from "@/helper/form";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { useCallback, useState } from "react";
import * as yup from "yup";
import { useGoogleMaps } from "../../GoogleMapsProvider/GoogleMapsProvider";
import { onFetchArrayAsync, useLazyFetch } from "@/helper/fetch";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import Alert from "@/components/atoms/Alert/Alert";

const PlaceAddEdit: React.FC<{
  parentId?: string;
  onClose: () => void;
  onReload: () => void;
}> = ({ parentId, onClose, onReload }) => {
  const [alert, setAlert] = useState<{
    type: "danger" | "success";
    text: string;
  } | null>(null);
  const auth = useSelector(
    createSelector([(state: RootState) => state.auth], (auth) => auth.authData)
  );
  const isLoaded = useGoogleMaps();
  const [onCreatePlaces] = useLazyFetch({
    url: "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/places",
    method: "POST",
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance);
  }, []);

  // Function to calculate the center of the polygon
  const calculatePolygonCenter = (coordinates: [number, number][]) => {
    const totalPoints = coordinates.length;

    const { totalLat, totalLng } = coordinates.reduce(
      (acc, [lng, lat]) => {
        acc.totalLat += lat;
        acc.totalLng += lng;
        return acc;
      },
      { totalLat: 0, totalLng: 0 }
    );

    return {
      lat: totalLat / totalPoints,
      lng: totalLng / totalPoints,
    };
  };

  const validation = () => {
    return yup.object().shape({
      name: yup.string().required("Name is required!"),
      location: yup
        .object()
        .shape({
          lat: yup.number(),
          lng: yup.number(),
        })
        .required("Location is required!"),
      area: yup
        .array()
        .of(
          yup.object().shape({
            lat: yup.number(),
            lng: yup.number(),
          })
        )
        .min(3, "Area should be more than 2 coordinates"),
    });
  };

  const {
    handleSubmit,
    errors,
    values,
    handleReset,
    isSubmitting,
    isValid,
    handleChange,
    setFieldValue,
  } = useForm({
    initialValues: {
      name: "",
      location: {
        lat: -6.1944,
        lng: 106.8229,
      },
      area: [
        {
          lat: -6.1944,
          lng: 106.8229,
        },
      ],
    },
    validation: validation(),
  });

  const onSubmit: ICallbackSubmit = (values, { setSubmitting }) => {
    onCreatePlaces(
      {
        data: {
          name: values.name,
          lat: values.location.lat,
          lng: values.location.lng,
          ...(parentId ? { parent_id: parentId } : {}),
        },
      },
      auth?.token ?? "",
      (error, response) => {
        setSubmitting(false);
        if (!error) {
          onFetchArrayAsync(auth?.token ?? "")(
            [...values.area, values.area[0]].map(
              (item: { lat: number; lng: number }, key: number) => ({
                url: "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/place-areas",
                method: "POST",
                data: {
                  place_id: response?.data.result.id,
                  lat: item.lat,
                  lng: item.lng,
                  seq: key + 1,
                },
              })
            ),
            {
              success: () => {
                setAlert({
                  type: "success",
                  text: "Create success!",
                });
                onReload();
                onClose();
              },
              error: () => {
                setAlert({
                  type: "danger",
                  text: "Something went wrong!",
                });
              },
            }
          );
        } else {
          setAlert({
            type: "danger",
            text: "Something went wrong!",
          });
        }
      }
    );
  };

  return (
    <>
      {!!alert ? (
        <Alert color={alert.type} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      ) : null}

      <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)}>
        <div className={`form-group ${!!errors.name ? "has-error" : ""}`}>
          <label htmlFor="name" className="col-sm-2 control-label">
            Name
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Name"
              name="name"
              onChange={handleChange}
              value={values.name ?? ""}
              disabled={isSubmitting}
            />
            <span className="help-block">{errors.name}</span>
          </div>
        </div>
        <div className={`form-group ${!!errors.location ? "has-error" : ""}`}>
          <label htmlFor="center" className="col-sm-2 control-label">
            Location
          </label>
          <div className="col-sm-10">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "red",
                }}
                center={values.location}
                zoom={10}
                onLoad={onLoad}
                options={{
                  streetViewControl: false, // Removes Street View button
                  fullscreenControl: false, // Removes fullscreen button
                }}
              >
                <MarkerF
                  position={values.location}
                  draggable
                  onDragEnd={(e) =>
                    setFieldValue("location", {
                      lat: e.latLng?.lat() ?? 0,
                      lng: e.latLng?.lng() ?? 0,
                    })
                  }
                />
              </GoogleMap>
            ) : (
              <></>
            )}
            <span className="help-block">{errors.location}</span>
          </div>
        </div>
        <div className={`form-group ${!!errors.area ? "has-error" : ""}`}>
          <label htmlFor="center" className="col-sm-2 control-label">
            Area
          </label>
          <div className="col-sm-10">
            <button
              className="btn btn-default"
              type="button"
              onClick={() => {
                const updateGeofence = [
                  ...values.area,
                  values.area[values.area.length - 1],
                ];
                setFieldValue("area", updateGeofence);

                map?.data.forEach((feature) => {
                  map.data.remove(feature);
                });

                if (updateGeofence.length >= 3) {
                  map?.data.addGeoJson({
                    type: "FeatureCollection",
                    features: [
                      {
                        type: "Feature",
                        geometry: {
                          type: "Polygon",
                          coordinates: [
                            updateGeofence.map((item) => [item.lng, item.lat]),
                          ],
                        },
                      },
                    ],
                  });
                }
              }}
            >
              Add Coordinte
            </button>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "red",
                }}
                center={calculatePolygonCenter(
                  [...values.area, values.area[0]].map((item) => [
                    item.lng,
                    item.lat,
                  ])
                )}
                zoom={10}
                onLoad={onLoad}
                options={{
                  streetViewControl: false, // Removes Street View button
                  fullscreenControl: false, // Removes fullscreen button
                }}
              >
                {[...values.area].map((item, key) => (
                  <MarkerF
                    key={key}
                    position={item}
                    draggable
                    onDblClick={() => {
                      const updateGeofence = values.area.filter(
                        (_: { lat: number; lng: number }, i: number) => i != key
                      );
                      map?.data.forEach((feature) => {
                        map.data.remove(feature);
                      });
                      if (updateGeofence.length >= 3) {
                        map?.data.addGeoJson({
                          type: "FeatureCollection",
                          features: [
                            {
                              type: "Feature",
                              geometry: {
                                type: "Polygon",
                                coordinates: [
                                  [...updateGeofence, updateGeofence[0]].map(
                                    (item) => [item.lng, item.lat]
                                  ),
                                ],
                              },
                            },
                          ],
                        });
                      }
                      setFieldValue("area", updateGeofence);
                    }}
                    onDragEnd={(e) => {
                      const updateGeofence = values.area.map(
                        (j: any, target: number) =>
                          key === target
                            ? {
                                lat: e.latLng?.lat() ?? 0,
                                lng: e.latLng?.lng() ?? 0,
                              }
                            : { ...j }
                      );
                      setFieldValue("area", [...updateGeofence]);

                      map?.data.forEach((feature) => {
                        map.data.remove(feature);
                      });
                      if (updateGeofence.length >= 3) {
                        map?.data.addGeoJson({
                          type: "FeatureCollection",
                          features: [
                            {
                              type: "Feature",
                              geometry: {
                                type: "Polygon",
                                coordinates: [
                                  [...updateGeofence, updateGeofence[0]].map(
                                    (item) => [item.lng, item.lat]
                                  ),
                                ],
                              },
                            },
                          ],
                        });
                      }
                    }}
                  />
                ))}
              </GoogleMap>
            ) : (
              <></>
            )}
            <span className="help-block">{errors.area}</span>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <button
              type="button"
              className="btn btn-default"
              onClick={() => {
                map?.data.forEach((feature) => {
                  map.data.remove(feature);
                });
                handleReset();
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-default"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Loading" : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default PlaceAddEdit;
