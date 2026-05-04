import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseError } from "../../../utils/apiError";
import "../../../styles/admin/AdminUsers.css";

const API_BASE = "http://localhost:8080";

function getUserInitials(user) {
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
}

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(await parseError(response));
        }

        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;

    return (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search) ||
      (user.phoneNumber || "").toLowerCase().includes(search) ||
      (user.origin || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="admin-page-container users-page">
      <div className="admin-page-header">
        <h1 className="admin-title">Utilisateurs</h1>
        <p className="admin-subtitle">Liste des comptes de la plateforme.</p>
      </div>

      <div className="users-toolbar">
        <input
          type="search"
          className="users-search"
          placeholder="Rechercher par nom, email, role, telephone ou origine"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <div className="users-alert error">{error}</div>}

      <div className="users-card">
        {loading ? (
          <div className="users-empty">Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-empty">Aucun utilisateur trouve.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Telephone</th>
                <th>Origine</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="users-avatar"
                      />
                    ) : (
                      <div className="users-avatar users-avatar-fallback">
                        {getUserInitials(user)}
                      </div>
                    )}
                  </td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || "-"}</td>
                  <td>{user.origin || "-"}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="users-secondary-btn"
                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                    >
                      Modifier
                    </button>
                    {" "}
                    <button
                      className="users-action-btn"
                      onClick={() => navigate(`/admin/users/${user.id}/annonces`)}
                    >
                      Voir ses annonces
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
