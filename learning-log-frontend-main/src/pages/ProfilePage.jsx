import { useProfile } from "../context/ProfileContext";

export default function ProfilePage() {
  const { profile, loading } = useProfile();

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!profile) return <p>No profile data</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>My Profile</h2>

      <div style={styles.card}>
        <p><b>Name:</b> {profile.name}</p>
        <p><b>Email:</b> {profile.email}</p>
        <p><b>Role:</b> {profile.role}</p>
      </div>
    </div>
  );
}

const styles = {
  card: {
    marginTop: "20px",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    border: "1px solid #ddd",
    width: "300px",
  },
};
