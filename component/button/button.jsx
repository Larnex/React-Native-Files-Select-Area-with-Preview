import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Pdf from 'react-native-pdf';
import Svg, {G, Rect} from 'react-native-svg';

const PDFExample = () => {
  const [region, setRegion] = useState({x: 0, y: 0, width: 0, height: 0});
  const [pdfViewDimensions, setPdfViewDimensions] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [pageDimensions, setPageDimensions] = useState({width: 0, height: 0});

  console.log('🚀 ~ PDFExample ~ pdfViewDimensions:', pdfViewDimensions);
  const [contentOffset, setContentOffset] = useState({top: 0, bottom: 0});

  const startPosition = useRef({x: 0, y: 0});

  const pdfRef = useRef(null);
  const svgRef = useRef(null);
  const panResponder = useRef(null);

  useEffect(() => {
    console.log('Page dimensions updated:', pageDimensions);
    setRegion({
      x: 0,
      y: 0,
      width: pageDimensions.width,
      height: pageDimensions.height,
    });
  }, [pageDimensions]);

  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        const startY = constrainToPdfBounds(locationY);
        startPosition.current = {x: locationX, y: startY};
        handleRegionChanged(locationX, startY, 0, 0);
      },
      onPanResponderMove: (evt, gestureState) => {
        const {locationX, locationY} = evt.nativeEvent;
        let width = locationX - startPosition.current.x;
        let height = constrainToPdfBounds(locationY) - startPosition.current.y;
        handleRegionChanged(
          startPosition.current.x,
          startPosition.current.y,
          width,
          height,
        );
      },
      onPanResponderRelease: evt => {
        console.log(
          'Release at:',
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY,
        );
      },
    });
  }, [region, contentOffset]);

  const constrainToPdfBounds = value => {
    const scaledHeight =
      (pageDimensions.height / pageDimensions.width) * pdfViewDimensions.width;
    const topOffset = (pdfViewDimensions.height - scaledHeight) / 2;
    return Math.min(Math.max(value, topOffset), topOffset + scaledHeight);
  };

  const handleLoadComplete = (numberOfPages, filePath, dimensions) => {
    setPageDimensions(dimensions);
  };

  const handleRegionChanged = (x, y, width, height) => {
    setRegion({x, y, width, height});
  };

  const handlePageChanged = (page, numberOfPages) => {
    console.log('Page changed to:', page, 'Total pages:', numberOfPages);
    const {width, height} = pageDimensions;
    setRegion({x: 0, y: 0, width, height});
    console.log('Region initialized to full page:', region);
  };

  const handleSaveRegion = () => {
    const {width, height} = pageDimensions;
    const pdfRegion = {
      x: region.x / width,
      y: region.y / height,
      width: region.width / width,
      height: region.height / height,
    };
    console.log('Saving region:', pdfRegion);
  };

  return (
    <View
      style={{flex: 1}}
      onLayout={e => setPdfViewDimensions(e.nativeEvent.layout)}>
      <Pdf
        ref={pdfRef}
        onLoadComplete={handleLoadComplete}
        source={{
          uri: 'file:///Users/bohdan/Documents/example.pdf',
          cache: true,
        }}
        fitPolicy={1}
        onPageChanged={handlePageChanged}
        style={{
          flex: 1,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height - 150,
        }}>
        <Svg
          ref={svgRef}
          style={{
            position: 'absolute',
            left: pdfViewDimensions.x,
            width: pdfViewDimensions.width,
            height: pdfViewDimensions.height,
          }}
          {...panResponder.current?.panHandlers}>
          <G>
            <Rect
              x={region.x}
              y={region.y}
              width={region.width}
              height={region.height}
              fill="rgba(0, 0, 0, 0.5)"
              stroke="black"
              strokeWidth={2}
            />
          </G>
        </Svg>
      </Pdf>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          PDF Width: {pdfViewDimensions.width}
        </Text>
        <Text style={styles.infoText}>
          PDF Height: {pdfViewDimensions.height}
        </Text>
        <Text style={styles.infoText}>
          Selected Area (X): {region.x.toFixed(2)}
        </Text>
        <Text style={styles.infoText}>
          Selected Area (Y): {region.y.toFixed(2)}
        </Text>
        <Text style={styles.infoText}>
          Selected Width: {region.width.toFixed(2)}
        </Text>
        <Text style={styles.infoText}>
          Selected Height: {region.height.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity onPress={handleSaveRegion}>
        <Text>Save Region</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PDFExample;
