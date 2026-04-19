import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPopup() {
  const [seconds, setSeconds] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 1) {
          navigate("/");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3>You have been logged out</h3>
        <p>Redirecting to login in {seconds} seconds...</p>

        <button style={styles.button} onClick={() => navigate("/")}>
          Login Now
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: "20px 35px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  },
  button: {
    marginTop: "10px",
    background: "#007bff",
    color: "white",
    padding: "10px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  },
};
