/**
 * Central query key registry.
 * Root prefixes ('cards', 'my-info', 'location') enable prefix invalidation:
 * e.g. invalidateQueries({ queryKey: ['cards'] }) refreshes every card query.
 */
export const queryKeys = {
  cards: {
    all: ["cards"] as const,
    list: () => [...queryKeys.cards.all, "list"] as const,
    detail: (cardId: number) => [...queryKeys.cards.all, "detail", cardId] as const,
    phones: (cardId: number) => [...queryKeys.cards.all, cardId, "phones"] as const,
    emails: (cardId: number) => [...queryKeys.cards.all, cardId, "emails"] as const,
    addresses: (cardId: number) => [...queryKeys.cards.all, cardId, "addresses"] as const,
    socialMedias: (cardId: number) => [...queryKeys.cards.all, cardId, "social-medias"] as const,
    documents: (cardId: number) => [...queryKeys.cards.all, cardId, "documents"] as const,
  },

  myInfo: {
    all: ["my-info"] as const,
    phones: () => [...queryKeys.myInfo.all, "phones"] as const,
    emails: () => [...queryKeys.myInfo.all, "emails"] as const,
    addresses: () => [...queryKeys.myInfo.all, "addresses"] as const,
    socialMedias: () => [...queryKeys.myInfo.all, "social-medias"] as const,
    documents: () => [...queryKeys.myInfo.all, "documents"] as const,
    document: (id: number) => [...queryKeys.myInfo.documents(), id] as const,
  },

  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
  },

  location: {
    cities: () => ["location", "cities"] as const,
    districts: (cityId: number) => ["location", "districts", cityId] as const,
    neighborhoods: (districtId: number) =>
      ["location", "neighborhoods", districtId] as const,
  },

  socialPlatforms: () => ["social-platforms"] as const,

  publicCard: {
    all: ["public-card"] as const,
    byKey: (urlKey: string) => [...queryKeys.publicCard.all, urlKey] as const,
  },
} as const;
