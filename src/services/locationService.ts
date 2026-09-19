import type { City, District, Neighborhood } from "@/types/api";
import { handleApiResponse } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export const locationService = {
  getCities(): Promise<City[]> {
    return handleApiResponse((client) =>
      client.get<City[]>(API_ENDPOINTS.LOCATION.CITIES),
    );
  },

  getDistrictsByCity(cityId: number): Promise<District[]> {
    return handleApiResponse((client) =>
      client.get<District[]>(API_ENDPOINTS.LOCATION.DISTRICTS(cityId)),
    );
  },

  getNeighborhoodsByDistrict(districtId: number): Promise<Neighborhood[]> {
    return handleApiResponse((client) =>
      client.get<Neighborhood[]>(
        API_ENDPOINTS.LOCATION.NEIGHBORHOODS(districtId),
      ),
    );
  },
};
