import React from "react";
import LieuModerationPage from "../moderation/LieuModerationPage";

export default function RestaurantsEnAttente() {
  return (
    <LieuModerationPage
      type="restaurants"
      title="Restaurants"
      status="en_attente"
      subtitle="Moderation des restaurants en attente."
      detailsPath="/admin/restaurants/view"
      editPath="/restaurants/update"
    />
  );
}
