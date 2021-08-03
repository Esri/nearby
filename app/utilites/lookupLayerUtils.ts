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
import Graphic from 'esri/Graphic';
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';
import FeatureEffect from 'esri/views/layers/support/FeatureEffect';
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
	const hasLookupLayers = lookupLayers && lookupLayers?.length > 0 ? true : false;


	const searchableLayers: Collection<esri.Layer> = !hasLookupLayers ? view.map.layers : new Collection();
	const returnLayers = [];

	// Get all the map layers
	if (hasLookupLayers) {
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
					layer && searchableLayers.add(_configureFeatureLayer(layer));
				}
			}
		});
	}

	// Include the search layer in the lookup layers if specified
	searchableLayers.forEach((layer: esri.FeatureLayer | esri.MapImageLayer | esri.GroupLayer) => {
		if (layer && layer.type) {

			if (layer.type === 'feature') {
				returnLayers.push(_configureFeatureLayer(layer));
			} else if (layer.type === "group") {
				const flattendGroup = _getLayersFromGroupLayer(layer);
				if (flattendGroup?.length > 0) {
					flattendGroup.forEach(b => {
						if (b?.type === "imagery" || b?.type === "tile") return;
						searchableLayers.add(b);
					});
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
	const { results } = props;

	let graphic = _getResultGeometries(results);

	let returnGraphic = graphic;
	if (graphic?.geometry?.type === "polyline" || graphic?.geometry?.type === 'polygon') {
		returnGraphic = new Graphic({ geometry: graphic?.geometry?.extent?.center, attributes: graphic?.attributes });
	}
	return resolve(returnGraphic);

}
export function createGoToProps(target, config) {
	const { searchScale, enableSearchScale, level } = config;

	const goToProps = {
		target
	} as __esri.GoToTarget2D;
	if (level) {
		goToProps.zoom = level;
	} else if (searchScale && enableSearchScale) {
		goToProps.scale = searchScale;
	}
	return goToProps;
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
function _configureFeatureLayer(layer): esri.FeatureLayer {
	const flayer = layer as esri.FeatureLayer;
	if (flayer.popupEnabled) {
		flayer.outFields = ["*"];
	}
	return flayer;
}
function _getLayersFromGroupLayer(group): __esri.Layer[] {
	let layers = [];
	group.layers.filter(layer => {
		if (layer.group) {
			const innerGroup = this._getLayersFromGroupLayer(layer.group);
			layers = [...layers, innerGroup];
		} else {
			layers.push(layer);
		}
	});
	return layers;
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
export function getSymbol(config, color) {
	const { mapPinSize, mapPinIcon } = config;
	let marker = null;

	switch (mapPinIcon) {
		case "pushpin":
			marker = {
				"type": "CIMPointSymbol",
				"symbolLayers": [{
					"type": "CIMVectorMarker",
					"enable": true,
					"anchorPoint": { "x": 0, "y": -0.5 },
					"anchorPointUnits": "Relative",
					"dominantSizeAxis3D": "Y",
					"size": mapPinSize,
					"billboardMode3D": "FaceNearPlane",
					"frame": {
						"xmin": 0,
						"ymin": 0,
						"xmax": 21,
						"ymax": 21
					},
					"markerGraphics": [
						{
							"type": "CIMMarkerGraphic",
							"geometry": {
								"rings": [
									[
										[
											15.09,
											21
										],
										[
											15.09,
											19.69
										],
										[
											13.78,
											18.37
										],
										[
											13.78,
											10.5
										],
										[
											15.09,
											9.19
										],
										[
											15.09,
											7.88
										],
										[
											11.16,
											7.88
										],
										[
											11.16,
											1.31
										],
										[
											10.5,
											0
										],
										[
											9.84,
											1.31
										],
										[
											9.84,
											7.88
										],
										[
											5.91,
											7.88
										],
										[
											5.91,
											9.19
										],
										[
											7.22,
											10.5
										],
										[
											7.22,
											18.38
										],
										[
											5.91,
											19.69
										],
										[
											5.91,
											21
										],
										[
											15.09,
											21
										]
									]
								]
							},
							"symbol": {
								"type": "CIMPolygonSymbol",
								"symbolLayers": [
									{
										"type": "CIMSolidStroke",
										"enable": true,
										"capStyle": "Round",
										"joinStyle": "Round",
										"lineStyle3D": "Strip",
										"miterLimit": 10,
										"width": 0,
										"color": [110, 110, 110, 255]
									},
									{
										"type": "CIMSolidFill",
										"enable": true,
										"color": color.toJSON()
									}
								]
							}
						}
					],
					"scaleSymbolsProportionally": true,
					"respectFrame": true
				}
				]
			}
			break;
		case "location":
			marker = {
				"type": "CIMPointSymbol",
				"symbolLayers": [
					{
						"type": "CIMVectorMarker",
						"enable": true,
						"anchorPoint": {
							"x": 0,
							"y": -0.5
						},
						"anchorPointUnits": "Relative",
						"dominantSizeAxis3D": "Y",
						"size": mapPinSize,
						"billboardMode3D": "FaceNearPlane",
						"frame": {
							"xmin": 0,
							"ymin": 0,
							"xmax": 21,
							"ymax": 21
						},
						"markerGraphics": [
							{
								"type": "CIMMarkerGraphic",
								"geometry": {
									"rings": [
										[
											[
												16.06,
												5.58
											],
											[
												10.5,
												0
											],
											[
												4.94,
												5.58
											],
											[
												4.94,
												16.73
											],
											[
												5.03,
												17.69
											],
											[
												5.3,
												18.54
											],
											[
												5.75,
												19.27
											],
											[
												6.37,
												19.88
											],
											[
												7.17,
												20.37
											],
											[
												8.14,
												20.72
											],
											[
												9.25,
												20.93
											],
											[
												10.5,
												21
											],
											[
												11.75,
												20.93
											],
											[
												12.86,
												20.72
											],
											[
												13.83,
												20.37
											],
											[
												14.63,
												19.88
											],
											[
												15.25,
												19.27
											],
											[
												15.7,
												18.54
											],
											[
												15.97,
												17.69
											],
											[
												16.06,
												16.73
											],
											[
												16.06,
												5.58
											]
										]
									]
								},
								"symbol": {
									"type": "CIMPolygonSymbol",
									"symbolLayers": [
										{
											"type": "CIMSolidStroke",
											"enable": true,
											"capStyle": "Round",
											"joinStyle": "Round",
											"lineStyle3D": "Strip",
											"miterLimit": 10,
											"width": 0,
											"color": [
												110,
												110,
												110,
												255
											]
										},
										{
											"type": "CIMSolidFill",
											"enable": true,
											"color": color.toJSON()
										}
									]
								}
							}
						],
						"scaleSymbolsProportionally": true,
						"respectFrame": true
					}
				]
			}
			break;
		case "square":
			marker = {
				"type": "CIMPointSymbol",
				"symbolLayers": [
					{
						"type": "CIMVectorMarker",
						"enable": true,
						"anchorPoint": {
							"x": 0,
							"y": -0.5
						},
						"anchorPointUnits": "Relative",
						"dominantSizeAxis3D": "Y",
						"size": mapPinSize,
						"billboardMode3D": "FaceNearPlane",
						"frame": {
							"xmin": 0,
							"ymin": 0,
							"xmax": 21,
							"ymax": 21
						},
						"markerGraphics": [
							{
								"type": "CIMMarkerGraphic",
								"geometry": {
									"rings": [
										[
											[
												15.09,
												21
											],
											[
												16.09,
												20.8
											],
											[
												16.95,
												20.23
											],
											[
												17.52,
												19.38
											],
											[
												17.72,
												18.38
											],
											[
												17.72,
												9.19
											],
											[
												17.52,
												8.19
											],
											[
												16.95,
												7.33
											],
											[
												16.09,
												6.76
											],
											[
												15.09,
												6.56
											],
											[
												13.78,
												6.56
											],
											[
												10.5,
												0
											],
											[
												7.22,
												6.56
											],
											[
												5.91,
												6.56
											],
											[
												4.91,
												6.76
											],
											[
												4.05,
												7.33
											],
											[
												3.48,
												8.19
											],
											[
												3.28,
												9.19
											],
											[
												3.28,
												18.38
											],
											[
												3.48,
												19.38
											],
											[
												4.05,
												20.23
											],
											[
												4.91,
												20.8
											],
											[
												5.91,
												21
											],
											[
												15.09,
												21
											]
										]
									]
								},
								"symbol": {
									"type": "CIMPolygonSymbol",
									"symbolLayers": [
										{
											"type": "CIMSolidStroke",
											"enable": true,
											"capStyle": "Round",
											"joinStyle": "Round",
											"lineStyle3D": "Strip",
											"miterLimit": 10,
											"width": 0,
											"color": [
												110,
												110,
												110,
												255
											]
										},
										{
											"type": "CIMSolidFill",
											"enable": true,
											"color": color.toJSON()
										}
									]
								}
							}
						],
						"scaleSymbolsProportionally": true,
						"respectFrame": true
					}
				]
			}
			break;
		case "teardrop":
			marker = {
				"type": "CIMPointSymbol",
				"symbolLayers": [
					{
						"type": "CIMVectorMarker",
						"enable": true,
						"anchorPoint": {
							"x": 0,
							"y": -0.5
						},
						"anchorPointUnits": "Relative",
						"dominantSizeAxis3D": "Y",
						"size": mapPinSize,
						"billboardMode3D": "FaceNearPlane",
						"frame": {
							"xmin": 0,
							"ymin": 0,
							"xmax": 21,
							"ymax": 21
						},
						"markerGraphics": [
							{
								"type": "CIMMarkerGraphic",
								"geometry": {
									"rings": [
										[
											[
												17.17,
												14.33
											],
											[
												16.97,
												12.96
											],
											[
												16.38,
												11.37
											],
											[
												12.16,
												3.98
											],
											[
												11.2,
												1.94
											],
											[
												10.5,
												0
											],
											[
												9.8,
												1.96
											],
											[
												8.84,
												4.02
											],
											[
												4.61,
												11.41
											],
											[
												4.02,
												12.98
											],
											[
												3.83,
												14.33
											],
											[
												3.96,
												15.63
											],
											[
												4.34,
												16.88
											],
											[
												4.95,
												18.03
											],
											[
												5.78,
												19.04
											],
											[
												6.8,
												19.88
											],
											[
												7.95,
												20.49
											],
											[
												9.2,
												20.87
											],
											[
												10.5,
												21
											],
											[
												11.8,
												20.87
											],
											[
												13.05,
												20.5
											],
											[
												14.2,
												19.88
											],
											[
												15.22,
												19.05
											],
											[
												16.05,
												18.03
											],
											[
												16.66,
												16.88
											],
											[
												17.04,
												15.63
											],
											[
												17.17,
												14.33
											]
										]
									]
								},
								"symbol": {
									"type": "CIMPolygonSymbol",
									"symbolLayers": [
										{
											"type": "CIMSolidStroke",
											"enable": true,
											"capStyle": "Round",
											"joinStyle": "Round",
											"lineStyle3D": "Strip",
											"miterLimit": 10,
											"width": 0,
											"color": [
												110,
												110,
												110,
												255
											]
										},
										{
											"type": "CIMSolidFill",
											"enable": true,
											"color": color.toJSON()
										}
									]
								}
							}
						],
						"scaleSymbolsProportionally": true,
						"respectFrame": true
					}
				]
			}
			break;
		case "pin":
			marker = {
				"type": "CIMPointSymbol",
				"symbolLayers": [
					{
						"type": "CIMVectorMarker",
						"enable": true,
						"anchorPoint": {
							"x": 0,
							"y": -0.5
						},
						"anchorPointUnits": "Relative",
						"dominantSizeAxis3D": "Y",
						"size": mapPinSize,
						"billboardMode3D": "FaceNearPlane",
						"frame": {
							"xmin": 0,
							"ymin": 0,
							"xmax": 21,
							"ymax": 21
						},
						"markerGraphics": [
							{
								"type": "CIMMarkerGraphic",
								"geometry": {
									"rings": [
										[
											[
												15.2,
												16.3
											],
											[
												15.13,
												15.47
											],
											[
												14.9,
												14.66
											],
											[
												14.54,
												13.91
											],
											[
												14.05,
												13.24
											],
											[
												13.44,
												12.65
											],
											[
												12.74,
												12.19
											],
											[
												11.97,
												11.86
											],
											[
												11.15,
												11.67
											],
											[
												11.15,
												1.3
											],
											[
												10.5,
												0
											],
											[
												9.85,
												1.3
											],
											[
												9.85,
												11.67
											],
											[
												9.03,
												11.86
											],
											[
												8.26,
												12.19
											],
											[
												7.56,
												12.65
											],
											[
												6.95,
												13.24
											],
											[
												6.46,
												13.91
											],
											[
												6.1,
												14.66
											],
											[
												5.87,
												15.47
											],
											[
												5.8,
												16.3
											],
											[
												5.89,
												17.22
											],
											[
												6.16,
												18.1
											],
											[
												6.59,
												18.91
											],
											[
												7.18,
												19.63
											],
											[
												7.89,
												20.21
											],
											[
												8.7,
												20.64
											],
											[
												9.58,
												20.91
											],
											[
												10.5,
												21
											],
											[
												11.42,
												20.91
											],
											[
												12.3,
												20.64
											],
											[
												13.11,
												20.21
											],
											[
												13.82,
												19.62
											],
											[
												14.41,
												18.91
											],
											[
												14.84,
												18.1
											],
											[
												15.11,
												17.22
											],
											[
												15.2,
												16.3
											]
										]
									]
								},
								"symbol": {
									"type": "CIMPolygonSymbol",
									"symbolLayers": [
										{
											"type": "CIMSolidStroke",
											"enable": true,
											"capStyle": "Round",
											"joinStyle": "Round",
											"lineStyle3D": "Strip",
											"miterLimit": 10,
											"width": 0,
											"color": [
												110,
												110,
												110,
												255
											]
										},
										{
											"type": "CIMSolidFill",
											"enable": true,
											"color": color.toJSON()
										}
									]
								}
							}
						],
						"scaleSymbolsProportionally": true,
						"respectFrame": true
					}
				]
			}
			break;
		case "home":
			marker = {
				"type": "CIMPointSymbol",
				"symbolLayers": [
					{
						"type": "CIMVectorMarker",
						"enable": true,
						"anchorPointUnits": "Relative",
						"dominantSizeAxis3D": "Y",
						"size": mapPinSize,
						"billboardMode3D": "FaceNearPlane",
						"frame": {
							"xmin": 0,
							"ymin": 0,
							"xmax": 21,
							"ymax": 21
						},
						"markerGraphics": [
							{
								"type": "CIMMarkerGraphic",
								"geometry": {
									"rings": [
										[
											[
												18,
												11
											],
											[
												17,
												11
											],
											[
												17,
												5
											],
											[
												18,
												5
											],
											[
												18,
												4
											],
											[
												3,
												4
											],
											[
												3,
												5
											],
											[
												4,
												5
											],
											[
												4,
												11
											],
											[
												3,
												11
											],
											[
												3,
												12
											],
											[
												10.5,
												18
											],
											[
												18,
												12
											],
											[
												18,
												11
											]
										],
										[
											[
												6,
												11
											],
											[
												6,
												8
											],
											[
												9,
												8
											],
											[
												9,
												11
											],
											[
												6,
												11
											]
										],
										[
											[
												12,
												5
											],
											[
												15,
												5
											],
											[
												15,
												11
											],
											[
												12,
												11
											],
											[
												12,
												5
											]
										]
									]
								},
								"symbol": {
									"type": "CIMPolygonSymbol",
									"symbolLayers": [
										{
											"type": "CIMSolidStroke",
											"enable": true,
											"capStyle": "Round",
											"joinStyle": "Round",
											"lineStyle3D": "Strip",
											"miterLimit": 10,
											"width": 0,
											"color": [
												0,
												0,
												0,
												255
											]
										},
										{
											"type": "CIMSolidFill",
											"enable": true,
											"color": color.toJSON()
										}
									]
								}
							}
						],
						"scaleSymbolsProportionally": true,
						"respectFrame": true
					}
				]

			}
			break;
	}
	return marker as any;
}