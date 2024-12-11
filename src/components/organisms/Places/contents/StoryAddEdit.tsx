import { ICallbackSubmit, useForm } from "@/helper/form";
import { useCallback, useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { useGoogleMaps } from "../../GoogleMapsProvider/GoogleMapsProvider";
import { useLazyFetch } from "@/helper/fetch";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import Alert from "@/components/atoms/Alert/Alert";
import { IBuilding, ICoordinate } from "../Places.constants";
import { GoogleMap } from "@react-google-maps/api";
import RotatedOverlay from "@/components/atoms/RotatedOverlay/RotatedOverlay";
import ReCAPTCHA from "react-google-recaptcha";

const StoryAddEdit: React.FC<{
  lastSequence: number;
  buildingData: IBuilding;
  onClose: () => void;
  onReload: () => void;
}> = ({ buildingData, onClose, onReload, lastSequence }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [alert, setAlert] = useState<{
    type: "danger" | "success";
    text: string;
  } | null>(null);

  const auth = useSelector(
    createSelector([(state: RootState) => state.auth], (auth) => auth.authData)
  );

  const isLoaded = useGoogleMaps();

  const [onCreateStories] = useLazyFetch({
    url: "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/stories",
    method: "POST",
  });
  const [onCreateUpload] = useLazyFetch({
    url: "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/upload",
    method: "POST",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

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

  const onLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance);
  }, []);

  const validation = () => {
    return yup.object().shape({
      name: yup.string().required("Name is required!"),
      floorplan: yup.mixed().nullable().required("File is required"),
      rotate: yup.number().required("Rotate is required!"),
      recaptcha: yup.string().nullable().required("reCaptcha is required!"),
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
      floorplan: null,
      rotate: 0,
      recaptcha: null,
    },
    validation: validation(),
  });

  const onSubmit: ICallbackSubmit = (values, { setSubmitting }) => {
    onCreateUpload(
      {
        data: {
          file: values.floorplan,
          recaptcha: values.recaptcha,
        },
      },
      auth?.token ?? "",
      (error, response) => {
        setSubmitting(false);
        if (!error) {
          onCreateStories(
            {
              data: {
                place_id: buildingData.id,
                name: values.name,
                floorplan: response?.data.result.file_name,
                rotate: values.rotate,
                seq: lastSequence + 1,
              },
            },
            auth?.token ?? "",
            (error) => {
              if (!error) {
                setAlert({
                  type: "success",
                  text: "Create success!",
                });
                onReload();
                onClose();
              } else {
                setAlert({
                  type: "danger",
                  text: "Something went wrong!",
                });
              }
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

  useEffect(() => {
    if (!!map) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
      if (!!!values.floorplan) {
        map.data.addGeoJson({
          type: "FeatureCollection",
          features: [buildingData.area],
        });
      }
    }
  }, [buildingData, map, values.floorplan]);

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
        <div className={`form-group ${!!errors.floorplan ? "has-error" : ""}`}>
          <label htmlFor="floorplan" className="col-sm-2 control-label">
            Floorplan
          </label>
          <div className="col-sm-10">
            <input
              type="file"
              style={{ display: "none" }}
              ref={inputRef}
              onChange={(e) => {
                if (e.currentTarget.files) {
                  const [file] = e.currentTarget.files;

                  if (file) {
                    setFieldValue("floorplan", file);
                  }
                } else {
                  setFieldValue("floorplan", null);
                }
              }}
            />
            <button
              id="floorplan"
              className="btn btn-default"
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              Browse
            </button>
            {values.floorplan !== null ? (
              <img
                src={URL.createObjectURL(values.floorplan)}
                width={"100%"}
                height={"200px"}
                style={{ objectFit: "cover" }}
              />
            ) : null}
            <span className="help-block">{errors.floorplan}</span>
          </div>
        </div>
        <div className={`form-group ${!!errors.rotate ? "has-error" : ""}`}>
          <label htmlFor="rotate" className="col-sm-2 control-label">
            Rotate
          </label>
          <div className="col-sm-10">
            <input
              type="number"
              className="form-control"
              id="rotate"
              placeholder="Rotate"
              name="rotate"
              onChange={handleChange}
              value={values.rotate ?? ""}
              disabled={isSubmitting}
            />
            <span className="help-block">{errors.rotate}</span>
          </div>
        </div>
        <div className={`form-group`}>
          <label className="col-sm-2 control-label">Preview</label>
          <div className="col-sm-10">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "red",
                }}
                center={calculatePolygonCenter(
                  buildingData?.area?.geometry?.coordinates[0] as [
                    number,
                    number
                  ][]
                )}
                zoom={20}
                onLoad={onLoad}
                options={{
                  streetViewControl: false, // Removes Street View button
                  fullscreenControl: false, // Removes fullscreen button
                }}
              >
                {!!values.floorplan && !!map ? (
                  <RotatedOverlay
                    map={map}
                    bounds={getBoundsFromPolygon(
                      buildingData?.area?.geometry?.coordinates[0] as [
                        number,
                        number
                      ][]
                    )}
                    image={URL.createObjectURL(values.floorplan)} // Replace with your image URL
                    rotation={values.rotate} // Rotation angle in degrees
                  />
                ) : null}
              </GoogleMap>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className={`form-group ${!!errors.recaptcha ? "has-error" : ""}`}>
          <div className="col-sm-offset-2 col-sm-10">
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(value) => {
                setFieldValue("recaptcha", value);
              }}
            />
            <span className="help-block">{errors.recaptcha}</span>
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

export default StoryAddEdit;
