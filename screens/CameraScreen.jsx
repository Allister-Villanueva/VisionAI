import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({navigation}) {
  const cameraRef = useRef(null);
  // 1. Added the photo state tracking from section 2.4
  const [photo, setPhoto] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Updated capture function matching the guide's state update and logging
async function takePicture() {
  if (!cameraRef.current) return;
  try {
    const result = await cameraRef.current.takePictureAsync({ 
      quality: 0.1,      // 1. Maximize file compression
      scale: 0.5,        // 2. Scales the image size down to 50% width/height
      skipProcessing: false // Ensures modifications apply correctly
    });
    setPhoto(result.uri);
    navigation.navigate('Preview', { photoUri: result.uri });
  } catch (error) {
    console.error("Failed to take picture:", error);
  }
}
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      {/* 3. Button structure matching the guide */}
      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <Text style={styles.captureButtonText}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}

// 4. Exact style constraints from section 2.4
const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#2E5BBA',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  captureButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: '#center', padding: 20 },
  permissionText: { textAlign: 'center', marginBottom: 16, fontSize: 16 },
  permissionButton: { backgroundColor: '#2E5BBA', padding: 12, borderRadius: 8 },
  permissionButtonText: { color: '#fff', fontWeight: 'bold' },
});