import React from "react";

export default function Profile() {
  const token = localStorage.getItem("token");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mon Profil 👤</h1>

      <p>Token JWT :</p>
      <pre style={{ background: "#eee", padding: "10px" }}>
        {token}
      </pre>
    </div>
  );
}