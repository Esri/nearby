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
import Collection from 'esri/core/Collection';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';

import { resolve } from 'esri/core/promiseUtils';
import { getBasemapTheme } from '../utilites/geometryUtils';
import Graphic from 'esri/Graphic';
import { TextSymbol } from 'esri/symbols';
import { ApplicationConfig } from 'ApplicationBase/interfaces';
import FeatureEffect = require('esri/views/layers/support/FeatureEffect');
import esri = __esri;
interface ConfigureLayerProperties {
	id: string;
	fields: string[];
	featureCollection?: any;
	type: string;
}
interface LookupLayerProps {
	view: esri.MapView;
	lookupLayers: ConfigureLayerProperties[];
	hideFeaturesOnLoad: boolean;
}

interface SearchGeometryProps {
	view: esri.MapView;
	config: ApplicationConfig;
	results: any;
}

export async function getLookupLayers(props: LookupLayerProps): Promise<__esri.FeatureLayer[]> {
	const { view, hideFeaturesOnLoad, lookupLayers } = props;
	const searchableLayers: Collection<esri.Layer> = !lookupLayers ? view.map.layers : new Collection();

	const returnLayers = [];
	// Get all the map layers
	if (lookupLayers) {
		// get any predefined layers otherwise we'll use all map layers
		lookupLayers.forEach((layerItem) => {
			if (layerItem.id) {
				if (layerItem.type === 'DynamicLayer') {
					const sublayerId = layerItem.id.lastIndexOf('.');
					if (sublayerId !== -1) {
						const id = layerItem.id.slice(0, sublayerId);
						const layer = view.map.findLayerById(id) as esri.MapImageLayer;
						if (layer && searchableLayers.indexOf(layer) === -1) {
							searchableLayers.add(layer);
						}
					}
				} else {
					// feature layer
					let layer = view.map.findLayerById(layerItem.id) as esri.FeatureLayer;
					if (!layer) {
						//maybe its a feature collection
						const sublayerId = layerItem.id.lastIndexOf('_');
						if (sublayerId !== -1) {
							const id = layerItem.id.slice(0, sublayerId);
							layer = view.map.findLayerById(id) as esri.FeatureLayer;
						}
					}
					// disable clustering 
					if (layer && layer.get("featureReduction")) {
						layer.set("featureReduction", null);
					}
					layer && searchableLayers.add(layer);
				}
			}
		});
	}
	// Include the search layer in the lookup layers if specified
	searchableLayers.forEach((layer: esri.FeatureLayer | esri.MapImageLayer) => {
		if (layer && layer.type) {
			if (layer.type === 'feature') {
				const flayer = layer as esri.FeatureLayer;
				if (flayer.popupEnabled) {
					flayer.outFields = ["*"];
					returnLayers.push(flayer);
				}
				// disable clustering 
				if (flayer && flayer.get("featureReduction")) {
					flayer.set("featureReduction", null);
				}
			} else if (layer.type === 'map-image') {
				// if sub layers have been enabled during config
				// only add those. Otherwise add all dynamic sub layers

				const mapLayer = layer as esri.MapImageLayer;
				const checkSubLayer = lookupLayers && lookupLayers.length && lookupLayers.length > 0 ? true : false;
				mapLayer.sublayers &&
					mapLayer.sublayers.forEach((sublayer) => {
						if (checkSubLayer) {
							const configId = `${sublayer.layer.id}.${sublayer.id}`;
							lookupLayers.forEach((l) => {
								if (l.id && l.id === configId) {
									sublayer.createFeatureLayer().then((l: esri.FeatureLayer) => {
										view.map.add(l);
										returnLayers.push(l);
									});
									sublayer.visible = false;
								}
							});
						} else {
							sublayer.createFeatureLayer().then((l: esri.FeatureLayer) => {
								view.map.add(l);
								returnLayers.push(l);
							});
							sublayer.visible = false;
						}
					});
			}
		}
	});

	if (hideFeaturesOnLoad) hideLookuplayers(returnLayers, props.view);

	return resolve(returnLayers);
}
export async function getSearchGeometry(props: SearchGeometryProps): Promise<esri.Graphic> {
	const { results, view, config } = props;
	let graphic = _getResultGeometries(results);

	let returnGraphic = graphic;
	if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
		returnGraphic = new Graphic({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
	}
	return resolve(returnGraphic);

}

function _getResultGeometries(results): esri.Graphic {
	let feature = null;
	results.results.some((searchResults) => {
		return searchResults.results.some((r) => {
			if (r.feature) {
				feature = r.feature;
				if (r.name && feature.attributes) {
					feature.attributes.name = r.name;
				}
				return true;
			} else {
				return false;
			}
		});
	});
	return feature;
}
export function hideLookuplayers(layers: esri.FeatureLayer[], view: esri.MapView) {
	const noMap = document.body.classList.contains('no-map');
	if (noMap) {
		return;
	}
	layers.forEach((layer) => {
		view.whenLayerView(layer).then((layerView) => {
			//hide layers
			layerView.filter = null;
			layerView.effect = new FeatureEffect({
				excludedEffect: "opacity(0%)",
				filter: new FeatureFilter({ where: '1=0' })
			});
		});
	});
}
export function clearLookupLayers(layers: esri.FeatureLayer[], view: esri.MapView) {
	layers.forEach((layer) => {
		view.whenLayerView(layer).then((layerView) => {
			//hide layers
			layerView.filter = null;
			layerView.effect = new FeatureEffect({
				excludedEffect: null,
				filter: null
			});
		});
	});
}
