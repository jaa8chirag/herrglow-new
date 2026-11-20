import { cache } from "react";
import * as core from "@herrglow/core";

/** Request-scoped memoisation so generateMetadata() and the page share one query. */
export const getSettings = cache(core.getSettings);
export const getCategories = cache(core.getCategories);
export const getLiveCities = cache(core.getLiveCities);
export const getServicePage = cache(core.getServicePage);
export const getCategoryPage = cache(core.getCategoryPage);
export const getCityHub = cache(core.getCityHub);
export const getServiceCity = cache(core.getServiceCity);
export const getAreaPage = cache(core.getAreaPage);
export const getProPage = cache(core.getProPage);
export const getBlog = cache(core.getBlog);
export const findPage = cache(core.findPage);
export const getMediaKeys = cache(core.mediaKeySet);
export const getMegaMenu = cache(core.getMegaMenu);
