import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function HebergementsEnAttente() {
  return (
    <LieuModerationPage
      type="hebergements"
      title="Hebergements"
      status="en_attente"
      subtitle="Gestion des nouvelles demandes d'inscription."
      detailsPath="/admin/hebergements/view"
      editPath="/admin/hebergements/edit"
    />
  );
}
