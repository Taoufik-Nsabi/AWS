import React from "react";
import LieuDetailsPage from "../moderation/LieuDetailsPage";

export default function RestaurantDetails() {
  return <LieuDetailsPage type="restaurants" title="Restaurants" editPath="/restaurants/update" />;
}
