import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function ActivitesRefusees() {
  return (
    <LieuModerationPage
      type="activites"
      title="Activites"
      status="rejete"
      subtitle="Activites refusees ou a reexaminer."
      detailsPath="/admin/activites/view"
      editPath="/activites/update"
    />
  );
}
