// @flow
import RNCamera, { type Status as _CameraStatus, hasTorch } from './RNCamera';
import FaceDetector from './FaceDetector';
import { NativeModules } from 'react-native';

const { launchImageLibrary } = NativeModules.ImagePickerManager;

export type CameraStatus = _CameraStatus;
export { RNCamera, FaceDetector, hasTorch, launchImageLibrary };
