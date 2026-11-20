/** Launch thresholds from the master plan. Pure functions so pages, admin and API share them. */
export const MIN_PROS_FOR_CITY_HUB = 3;
export const MIN_PROS_FOR_SERVICE_CITY = 2;

export const cityHubIsIndexable = (activePros: number) => activePros >= MIN_PROS_FOR_CITY_HUB;
export const serviceCityIsIndexable = (prosOfferingService: number, hasLocalContent: boolean) =>
  prosOfferingService >= MIN_PROS_FOR_SERVICE_CITY && hasLocalContent;
