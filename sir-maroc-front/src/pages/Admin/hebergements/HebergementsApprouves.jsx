import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function HebergementsApprouves() {
  return (
    <LieuModerationPage
      type="hebergements"
      title="Hebergements"
      status="approuve"
      subtitle="Liste des etablissements visibles sur la plateforme."
      detailsPath="/admin/hebergements/view"
      editPath="/admin/hebergements/edit"
    />
  );
}
