import type { City, District, Neighborhood } from "@/types/api";
import { unwrap } from "@/services/client";

export const locationService = {
  getCities(): Promise<City[]> {
    return unwrap((client) => client.get<City[]>("/api/location/cities"));
  },

  getDistrictsByCity(cityId: number): Promise<District[]> {
    return unwrap((client) =>
      client.get<District[]>(`/api/location/cities/${cityId}/districts`),
    );
  },

  getNeighborhoodsByDistrict(districtId: number): Promise<Neighborhood[]> {
    return unwrap((client) =>
      client.get<Neighborhood[]>(
        `/api/location/districts/${districtId}/neighborhoods`,
      ),
    );
  },
};
