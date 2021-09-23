/* eslint-disable no-console */
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, NativeModules } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { RNCamera } from 'react-native-camera';

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

export default class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    recordOptions: {
      mute: false,
      maxDuration: 5,
      quality: RNCamera.Constants.VideoQuality['288p'],
    },
    isRecording: false,
    canDetectBarcode: false,
    barcodes: [],
  };

  loadAlbum() {
    NativeModules.ImagePickerManager.launchImageLibrary(
      {
        mediaType: 'photo',
        videoQuality: 'high',
        quality: 1,
        maxWidth: 0,
        maxHeight: 0,
        includeBase64: false,
        cameraType: 'back',
        selectionLimit: 1,
        saveToPhotos: false,
        durationLimit: 0,
        detectBarcode: true,
      },
      (resp) => {
        console.log('barcodes from album', resp);
      },
    );
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  }

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1,
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1,
    });
  }

  setFocusDepth(depth) {
    this.setState({
      depth,
    });
  }

  takePicture = async function () {
    if (this.camera) {
      const data = await this.camera.takePictureAsync();
      console.warn('takePicture ', data);
    }
  };

  takeVideo = async function () {
    if (this.camera) {
      try {
        const promise = this.camera.recordAsync(this.state.recordOptions);

        if (promise) {
          this.setState({ isRecording: true });
          const data = await promise;
          this.setState({ isRecording: false });
          console.warn('takeVideo', data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  toggle = (value) => () => this.setState((prevState) => ({ [value]: !prevState[value] }));

  barcodeRecognized = ({ barcodes }) => {
    console.log('barcodes', barcodes);
    this.setState({ barcodes });
  };

  renderBarcodes = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.barcodes.map(this.renderBarcode)}
    </View>
  );

  renderBarcode = ({ bounds, data, type }) => (
    <React.Fragment key={data + bounds.origin.x}>
      <View
        style={[
          styles.text,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}
      >
        <Text style={[styles.textBlock]}>{`${data} ${type}`}</Text>
      </View>
    </React.Fragment>
  );

  renderCamera() {
    const { canDetectBarcode } = this.state;
    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        style={{
          flex: 1,
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        // onGoogleVisionBarcodesDetected={canDetectBarcode ? this.barcodeRecognized : null}
        // googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL}
        // googleVisionBarcodeMode={
        //   RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeMode.ALTERNATE
        // }
      >
        <View
          style={{
            flex: 0.5,
          }}
        >
          <View
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <TouchableOpacity style={styles.flipButton} onPress={this.loadAlbum.bind(this)}>
              <Text style={styles.flipText}> Album </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.toggle('canDetectBarcode')} style={styles.flipButton}>
              <Text style={styles.flipText}>
                {!canDetectBarcode ? 'Detect Barcode' : 'Detecting Barcode'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {!!canDetectBarcode && this.renderBarcodes()}
      </RNCamera>
    );
  }

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
