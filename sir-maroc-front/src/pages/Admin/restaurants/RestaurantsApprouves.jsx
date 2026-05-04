import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function RestaurantsApprouves() {
  return (
    <LieuModerationPage
      type="restaurants"
      title="Restaurants"
      status="approuve"
      subtitle="Restaurants approuves et visibles sur la plateforme."
      detailsPath="/admin/restaurants/view"
      editPath="/restaurants/update"
    />
  );
}
