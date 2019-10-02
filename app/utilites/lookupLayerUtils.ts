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
import Collection = require('esri/core/Collection');
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';

import promiseUtils = require('esri/core/promiseUtils');
import * as geometryUtils from '../utilites/geometryUtils';
import Graphic from 'esri/Graphic';
import { TextSymbol } from 'esri/symbols';
import esri = __esri;
import { ApplicationConfig } from 'ApplicationBase/interfaces';
import FeatureEffect = require('esri/views/layers/support/FeatureEffect');

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
								}
							});
						} else {
							sublayer.createFeatureLayer().then((l: esri.FeatureLayer) => {
								view.map.add(l);
								returnLayers.push(l);
							});
						}
					});
			}
		}
	});

	if (hideFeaturesOnLoad) hideLookuplayers(returnLayers, props.view);

	return promiseUtils.resolve(returnLayers);
}
export async function getSearchGeometry(props: SearchGeometryProps): Promise<esri.Graphic> {
	const { results, view, config } = props;
	let graphic = _getResultGeometries(results);

	// add marker to map
	_addLocationGraphics(graphic, config, view);

	let returnGraphic = graphic;
	if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
		returnGraphic = new Graphic({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
	}
	return promiseUtils.resolve(returnGraphic);

}
async function _addLocationGraphics(graphic, config, view) {
	const { includeAddressText, includeAddressGraphic, lightColor, darkColor } = config;
	// add a custom graphic at geocoded location if we have something to display
	const theme = await geometryUtils.getBasemapTheme(view);
	const color = theme === "light" ? lightColor : darkColor;
	if (graphic && graphic.geometry) {
		const geometry =
			graphic.geometry && graphic.geometry.type === 'point' ? graphic.geometry : graphic.geometry.extent.center;
		let displayText = null;

		if (graphic && includeAddressText) {
			if (graphic.attributes && graphic.attributes.Match_addr) {
				// replace first comma with a new line character
				displayText = graphic.attributes.Match_addr.replace(',', '\n');
			} else if (graphic.attributes && graphic.attributes.name) {
				displayText = graphic.attributes.name;
			} else if (graphic.layer && graphic.layer.displayField && graphic.layer.displayField !== '') {
				displayText = graphic.attributes[graphic.layer.displayField] || null;
			} else if (graphic.layer && graphic.layer.fields) {
				// get the first string field?
				graphic.layer.fields.some((field) => {
					if (field.type === 'string') {
						displayText = graphic.attributes[field.name];
						return true;
					}
				});
			}
		}
		if (displayText) {
			view.graphics.add(
				new Graphic({
					geometry,
					symbol: new TextSymbol({
						font: {
							size: 12
						},
						text: displayText,
						color,
						xoffset: 8,
						yoffset: 4,
						horizontalAlignment: 'left'
					})
				})
			);
		}
		if (includeAddressGraphic) {
			view.graphics.add(
				new Graphic({
					geometry,
					symbol: new TextSymbol({
						color,
						text: '\ue61d', // esri-icon-map-pin
						font: {
							size: 20,
							family: 'calcite-web-icons'
						}
					})
				})
			);
		}
	}
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
