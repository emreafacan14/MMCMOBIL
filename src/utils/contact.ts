import type { CardAddress } from "@/types/api";

interface PrimaryPickable {
  isPrimary: boolean;
  displayOrder: number;
}

/** Returns the primary item first, then the rest by display order. */
export function sortByPrimary<T extends PrimaryPickable>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) {
      return a.isPrimary ? -1 : 1;
    }

    return a.displayOrder - b.displayOrder;
  });
}

export function getPrimaryItem<T extends PrimaryPickable>(
  items: T[],
): T | undefined {
  return sortByPrimary(items)[0];
}

export function initialsOf(name: string, surname: string): string {
  const firstInitial = name.trim().charAt(0);
  const secondInitial = surname.trim().charAt(0);

  return `${firstInitial}${secondInitial}`.toUpperCase();
}

/** "Mahalle, İlçe, İl" one-liner for card previews. */
export function formatAddressLine(address: CardAddress): string {
  return [address.neighborhoodName, address.districtName, address.cityName]
    .filter((part) => part.length > 0)
    .join(", ");
}
