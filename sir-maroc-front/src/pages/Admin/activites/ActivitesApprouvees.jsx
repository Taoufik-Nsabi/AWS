import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function ActivitesApprouvees() {
  return (
    <LieuModerationPage
      type="activites"
      title="Activites"
      status="approuve"
      subtitle="Activites approuvees et visibles sur la plateforme."
      detailsPath="/admin/activites/view"
      editPath="/activites/update"
    />
  );
}
