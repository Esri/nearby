/*
  Copyright 2017 Esri

  Licensed under the Apache License, Version 2.0 (the "License");

  you may not use this file except in compliance with the License.

  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software

  distributed under the License is distributed on an "AS IS" BASIS,

  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

  See the License for the specific language governing permissions and

  limitations under the License.​
*/
import Graphic from 'esri/Graphic';
import { getBackgroundColorTheme } from 'esri/views/support/colorUtils';
import SpatialReference from 'esri/geometry/SpatialReference';
import { geodesicBuffer, buffer, geodesicLength, distance } from 'esri/geometry/geometryEngine';
import { Polyline } from 'esri/geometry';
import esri = __esri;

interface BufferParams {
	location: esri.Geometry;
	distance: number;
	unit: __esri.BufferParameters["unit"];
}
interface DistanceParams extends BufferParams {
	features: Graphic[];
}
export async function getDistances(params: DistanceParams) {
	const { location, unit } = params;
	const locale = document.documentElement.lang || "en";
	let geodesic = false;
	if (location && location.type && location.type === "point") {

		const sr: SpatialReference = (location?.spatialReference) ? location.spatialReference : null;
		const feature = params.features && params.features.length && params.features.length > 0 ? params.features[0] : null;
		const sr2: SpatialReference = feature.geometry && feature.geometry.spatialReference ? feature.geometry.spatialReference : null;
		const type = (feature.geometry && feature.geometry.type) ? feature.geometry.type : null;
		if (type === "point" && (sr.wkid === sr2.wkid)) {

			const srValid = sr.isGeographic || sr.isWebMercator;
			const sr2Valid = sr.isGeographic || sr.isWebMercator;
			if (srValid && sr2Valid) {
				geodesic = true;
			}
		}
	}

	params.features.forEach(feature => {
		let measureDistance;
		if (geodesic) {
			const pt1 = location as esri.Point;
			const pt2 = feature.geometry as esri.Point;

			var polyLine = new Polyline({
				paths: [[[pt1.x, pt1.y], [pt2.x, pt2.y]]],
				spatialReference: pt1.spatialReference
			});

			measureDistance = geodesicLength(polyLine, unit);

		}
		else {
			measureDistance = distance(location, feature.geometry, unit);
		}

		if (feature && feature.attributes) {
			feature.attributes.lookupDistance = measureDistance !== null ? measureDistance.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
		}
	});
}
export async function getBasemapTheme(view: esri.MapView): Promise<string> {
	return await getBackgroundColorTheme(view);
}
export function bufferGeometry(params: BufferParams) {
	const { location, distance, unit } = params;
	const spatialReference =
		location.spatialReference ||
		new SpatialReference({
			wkid: 102100
		});
	if (spatialReference.isWGS84 || spatialReference.isWebMercator) {
		return geodesicBuffer(location, distance, unit);
	} else {
		return buffer(location, distance, unit);
	}
}


