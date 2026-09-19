import { useQuery } from "@tanstack/react-query";
import { locationService } from "@/services/locationService";
import { platformService } from "@/services/platformService";
import { publicCardService } from "@/services/publicCardService";
import { queryKeys } from "@/hooks/queries/queryKeys";

const STATIC_DATA_STALE_TIME_MS = 24 * 60 * 60 * 1000;

export function useCities() {
  return useQuery({
    queryKey: queryKeys.location.cities(),
    queryFn: locationService.getCities,
    staleTime: STATIC_DATA_STALE_TIME_MS,
  });
}

export function useDistricts(cityId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.location.districts(cityId ?? 0),
    queryFn: () => {
      if (cityId === undefined) {
        throw new Error("useDistricts requires a cityId");
      }

      return locationService.getDistrictsByCity(cityId);
    },
    enabled: cityId !== undefined,
    staleTime: STATIC_DATA_STALE_TIME_MS,
  });
}

export function useNeighborhoods(districtId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.location.neighborhoods(districtId ?? 0),
    queryFn: () => {
      if (districtId === undefined) {
        throw new Error("useNeighborhoods requires a districtId");
      }

      return locationService.getNeighborhoodsByDistrict(districtId);
    },
    enabled: districtId !== undefined,
    staleTime: STATIC_DATA_STALE_TIME_MS,
  });
}

export function useSocialPlatforms() {
  return useQuery({
    queryKey: queryKeys.socialPlatforms(),
    queryFn: platformService.getAll,
    staleTime: STATIC_DATA_STALE_TIME_MS,
  });
}

export function usePublicCard(urlKey: string | undefined) {
  return useQuery({
    queryKey: queryKeys.publicCard.byKey(urlKey ?? ""),
    queryFn: () => {
      if (urlKey === undefined) {
        throw new Error("usePublicCard requires a urlKey");
      }

      return publicCardService.getPublicCard(urlKey);
    },
    enabled: urlKey !== undefined && urlKey.length > 0,
  });
}
