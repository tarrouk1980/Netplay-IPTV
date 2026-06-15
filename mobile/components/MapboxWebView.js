import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const SCREEN_WIDTH = Dimensions.get('window').width;

function buildTileMapHtml({ lng, lat, zoom, markers }) {
  const markersJson = JSON.stringify(markers || []);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;overflow:hidden;background:#1a1a2e;}
#map{position:relative;width:100%;height:100%;overflow:hidden;}
.tile{position:absolute;width:256px;height:256px;image-rendering:pixelated;}
.marker{position:absolute;transform:translate(-50%,-100%);font-size:28px;pointer-events:none;z-index:10;}
</style>
</head>
<body>
<div id="map"></div>
<script>
var LNG=${lng}, LAT=${lat}, ZOOM=${zoom};
var markers=${markersJson};
var W=window.innerWidth, H=window.innerHeight;
var map=document.getElementById('map');

function lon2tile(lon,z){return Math.floor((lon+180)/360*Math.pow(2,z));}
function lat2tile(lat,z){return Math.floor((1-Math.log(Math.tan(lat*Math.PI/180)+1/Math.cos(lat*Math.PI/180))/Math.PI)/2*Math.pow(2,z));}
function tile2lon(x,z){return x/Math.pow(2,z)*360-180;}
function tile2lat(y,z){var n=Math.PI-2*Math.PI*y/Math.pow(2,z);return 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)));}

var cx=lon2tile(LNG,ZOOM), cy=lat2tile(LAT,ZOOM);
var offsetX=W/2-((LNG-tile2lon(cx,ZOOM))/(tile2lon(cx+1,ZOOM)-tile2lon(cx,ZOOM)))*256;
var offsetY=H/2-((LAT-tile2lat(cy,ZOOM))/(tile2lat(cy-1,ZOOM)-tile2lat(cy,ZOOM)))*256;

var tilesX=Math.ceil(W/256)+2, tilesY=Math.ceil(H/256)+2;
var startX=cx-Math.floor(tilesX/2), startY=cy-Math.floor(tilesY/2);

for(var ty=0;ty<tilesY;ty++){
  for(var tx=0;tx<tilesX;tx++){
    var tileX=startX+tx, tileY=startY+ty;
    var img=document.createElement('img');
    img.className='tile';
    img.src='https://tile.openstreetmap.org/'+ZOOM+'/'+tileX+'/'+tileY+'.png';
    img.style.left=(offsetX+tx*256-Math.floor(tilesX/2)*256+Math.floor(tilesX/2)*256-offsetX%256)+'px';
    img.style.top=(offsetY+ty*256-Math.floor(tilesY/2)*256+Math.floor(tilesY/2)*256-offsetY%256)+'px';
    img.style.left=(W/2+(tileX-cx)*256-((LNG-tile2lon(cx,ZOOM))/(tile2lon(cx+1,ZOOM)-tile2lon(cx,ZOOM)))*256)+'px';
    img.style.top=(H/2+(tileY-cy)*256-((LAT-tile2lat(cy,ZOOM))/(tile2lat(cy-1,ZOOM)-tile2lat(cy,ZOOM)))*256)+'px';
    map.appendChild(img);
  }
}

// Markers
markers.forEach(function(m){
  var mLng=m.coordinates[0], mLat=m.coordinates[1];
  var px=W/2+(mLng-LNG)/(tile2lon(cx+1,ZOOM)-tile2lon(cx,ZOOM))*256;
  var py=H/2-(mLat-LAT)/(tile2lat(cy-1,ZOOM)-tile2lat(cy,ZOOM))*256;
  var el=document.createElement('div');
  el.className='marker';
  el.textContent=m.label||'📍';
  el.style.left=px+'px';
  el.style.top=py+'px';
  map.appendChild(el);
});
</script>
</body>
</html>`;
}

export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
  route = null,
  heatmapZones = [],
}) {
  const height = style?.height || 220;
  const width = style?.width || SCREEN_WIDTH;
  const html = buildTileMapHtml({ lng: centerCoordinate[0], lat: centerCoordinate[1], zoom, markers });

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        source={{ html, baseUrl: 'https://tile.openstreetmap.org' }}
        style={{ width, height }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        scrollEnabled={false}
        overScrollMode="never"
        onShouldStartLoadWithRequest={() => true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12, backgroundColor: '#1a1a2e' },
});
