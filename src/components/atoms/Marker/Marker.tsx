import { OverlayView } from "@react-google-maps/api";

const Marker: React.FC<{
  position: { lat: number; lng: number };
  text?: string;
}> = ({ position, text }) => {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} // Correct pane for user interaction
    >
      <div
        style={{
          position: "absolute",
          background: "#FF5722", // Bubble background color
          color: "white",
          padding: "10px 15px",
          borderRadius: "20px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "bold",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
          display: "inline-block",
          transform: "translate(-50%, -100%)", // Align bottom center of the marker
        }}
      >
        <div>{text}</div>
        <div
          style={{
            position: "absolute",
            width: "0",
            height: "0",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "-10px",
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "10px solid #FF5722", // Matches bubble color
          }}
        />
      </div>
    </OverlayView>
  );
};

export default Marker;
