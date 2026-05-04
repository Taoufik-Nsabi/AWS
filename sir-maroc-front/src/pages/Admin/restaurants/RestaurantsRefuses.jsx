import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function RestaurantsRefuses() {
  return (
    <LieuModerationPage
      type="restaurants"
      title="Restaurants"
      status="rejete"
      subtitle="Restaurants refuses ou a remettre en attente."
      detailsPath="/admin/restaurants/view"
      editPath="/restaurants/update"
    />
  );
}
