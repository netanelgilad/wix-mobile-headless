import { media as wixMedia } from "@wix/api-client";

function getImageUrlForMedia(media, width, height) {
  return wixMedia.getScaledToFillImageUrl(media, width, height, {});
}

export function WixMediaImage({ media, height = 320, width = 640, children }) {
  const url = getImageUrlForMedia(media || "", width, height);
  return children({ url });
}
