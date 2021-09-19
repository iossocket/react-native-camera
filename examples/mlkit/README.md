# React Native Camera MLKit Example

An example project demonstrating the use of MLKit features of react-native-camera.

### Setup

1. Run `npm install`.

1. Run `npm install` in root folder of this repo.

3. Build project (you will likely need to manage signing if you are building for ios device)

### Description

`App.js`, passing extral param `detectBarcode` will enable this feature
```
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
    )
  }
```

### Implementation
`android/src/main/java/org/reactnative/imagepicker/ImagePickerModule.java`

```
    void onAssetsObtained(final List<Uri> fileUris) {
        try {
            ...
            final Uri fileUri = fileUris.get(0);
            if (!isImageType(fileUri, reactContext)) {
                callback.invoke(getErrorMap(errOthers, "image only"));
                callback = null;
                return;
            }
            InputImage inputImage = InputImage.fromFilePath(reactContext, fileUri);
            barcodeDetector.getDetector().process(inputImage)
                    .addOnSuccessListener(new OnSuccessListener<List<Barcode>>() {
                        @Override
                        public void onSuccess(List<Barcode> barcodes) {
                            WritableArray barcodeArray = Arguments.createArray();
                            for (Barcode barcode: barcodes) {
                                String barcodeStr = barcode.getRawValue();
                                barcodeArray.pushString(barcodeStr);
                            }
                            WritableMap resp = getImageResponseMap(fileUri, options, reactContext);
                            resp.putArray("barcodes", barcodeArray);
                            callback.invoke(resp);
                            callback = null;
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(Exception e) {
                            callback.invoke(getErrorMap(errOthers, e.getMessage()));
                            callback = null;
                        }
                    });
        } catch (RuntimeException exception) {
            callback.invoke(getErrorMap(errOthers, exception.getMessage()));
        } catch (IOException exception) {
            callback.invoke(getErrorMap(errOthers, exception.getMessage()));
        }
    }
```