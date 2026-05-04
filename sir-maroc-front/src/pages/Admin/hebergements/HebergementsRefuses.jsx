import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function HebergementsRefuses() {
  return (
    <LieuModerationPage
      type="hebergements"
      title="Hebergements"
      status="rejete"
      subtitle="Historique des etablissements refuses ou a reexaminer."
      detailsPath="/admin/hebergements/view"
      editPath="/admin/hebergements/edit"
    />
  );
}
