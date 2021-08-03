

import { ApplicationConfig } from "TemplatesCommonLib/interfaces/applicationBase";
import { TelemetryInstance } from "../telemetry/telemetry";
interface BufferParams {
  location: __esri.Geometry,
  portal?: __esri.Portal,
  distance: number,
  units: string,
  view: __esri.MapView
}
interface esriWidgetProps extends __esri.WidgetProperties {
  config: ApplicationConfig;
  view?: __esri.MapView | __esri.SceneView;
  portal?: __esri.Portal;
  propertyName?: string;
  telemetry?: TelemetryInstance;
}
