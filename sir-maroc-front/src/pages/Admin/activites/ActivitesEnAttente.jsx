import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function ActivitesEnAttente() {
  return (
    <LieuModerationPage
      type="activites"
      title="Activites"
      status="en_attente"
      subtitle="Moderation des activites en attente."
      detailsPath="/admin/activites/view"
      editPath="/activites/update"
    />
  );
}
