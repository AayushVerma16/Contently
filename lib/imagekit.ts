// Types
type Transformation = 
  | { width?: number; height?: number; focus?: string; cropMode?: string; effect?: never; background?: never; overlayText?: never }
  | { effect: string; width?: never; height?: never; focus?: never; cropMode?: never; background?: never; overlayText?: never }
  | { background?: string; width?: never; height?: never; focus?: never; cropMode?: never; effect?: never; overlayText?: never }
  | {
      overlayText: string;
      overlayTextFontSize?: number;
      overlayTextColor?: string;
      gravity?: string;
      overlayTextPadding?: number;
      overlayBackground?: string;
      width?: never; height?: never; focus?: never; cropMode?: never; effect?: never; background?: never;
    };

// Helper to build ImageKit transformation URLs
export const buildTransformationUrl = (src: string, transformations: Transformation[] = []): string => {
    if (!transformations.length) return src;
  
    // Convert transformation objects to URL parameters
    const transformParams = transformations
      .map((transform) => {
        const params: string[] = [];
  
        // Handle resizing transformations
        if ('width' in transform && transform.width) params.push(`w-${transform.width}`);
        if ('height' in transform && transform.height) params.push(`h-${transform.height}`);
        if ('focus' in transform && transform.focus) params.push(`fo-${transform.focus}`);
        if ('cropMode' in transform && transform.cropMode) params.push(`cm-${transform.cropMode}`);
  
        // Handle effects
        if ('effect' in transform && transform.effect) params.push(`e-${transform.effect}`);
  
        // Handle background
        if ('background' in transform && transform.background) params.push(`bg-${transform.background}`);
  
        // Handle text overlays using layer syntax
        if ('overlayText' in transform && transform.overlayText) {
          const layerParams: string[] = [
            `l-text`,
            `i-${encodeURIComponent(transform.overlayText)}`,
            `tg-bold`,
            `lx-20,ly-20`,
          ];
  
          if (transform.overlayTextFontSize)
            layerParams.push(`fs-${transform.overlayTextFontSize}`);
          if (transform.overlayTextColor)
            layerParams.push(`co-${transform.overlayTextColor}`);
          if (transform.gravity) {
            // Map common gravity values to ImageKit positioning
            const gravityMap: Record<string, string> = {
              center: "center",
              north_west: "top_left",
              north_east: "top_right",
              south_west: "bottom_left",
              south_east: "bottom_right",
              north: "top",
              south: "bottom",
              west: "left",
              east: "right",
            };
            const mappedGravity =
              gravityMap[transform.gravity] || transform.gravity;
            layerParams.push(`lfo-${mappedGravity}`);
          }
          if (transform.overlayTextPadding)
            layerParams.push(`pa-${transform.overlayTextPadding}`);
          if (transform.overlayBackground)
            layerParams.push(`bg-${transform.overlayBackground}`);
  
          layerParams.push("l-end");
          return layerParams.join(",");
        }
  
        return params.join(",");
      })
      .filter((param) => param.length > 0)
      .join(":");
  
    // Insert transformation parameters into URL
    if (src.includes("/tr:")) {
      // Already has transformations, append to existing
      return src.replace("/tr:", `/tr:${transformParams}:`);
    } else {
      // Add new transformations
      const urlParts = src.split("/");
      const fileIndex = urlParts.length - 1;
      urlParts.splice(fileIndex, 0, `tr:${transformParams}`);
      return urlParts.join("/");
    }
  };
  
  // Upload file to ImageKit using your server-side API
  export const uploadToImageKit = async (file: File, fileName: string): Promise<{
    success: boolean;
    data?: {
      fileId: string;
      name: string;
      url: string;
      width: number;
      height: number;
      size: number;
    };
    error?: string;
  }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
  
      const response = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
  
      const result = await response.json();
  
      return {
        success: true,
        data: {
          fileId: result.fileId,
          name: result.name,
          url: result.url,
          width: result.width,
          height: result.height,
          size: result.size,
        },
      };
    } catch (error) {
      console.error("ImageKit upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      return {
        success: false,
        error: errorMessage,
      };
    }
  };