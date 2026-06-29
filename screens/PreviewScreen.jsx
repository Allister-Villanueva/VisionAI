import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
// Import your helper utility
import { imageToBase64 } from '../lib/gemini'; 

export default function PreviewScreen({ route, navigation }) {
  const { photoUri } = route.params;

  // Modified analyze function to handle conversion and parameter passing
  async function handleAnalyze() {
    try {
      // 1. Convert the file URI to a base64 string
      const base64Image = await imageToBase64(photoUri);
      
      // 2. Temporary verification log required by the checkpoint
      console.log("Base64 string length:", base64Image.length);
      
      // 3. Pass base64Image, NOT photoUri, to the Result screen
      navigation.navigate('Result', { base64Image });
    } catch (error) {
      console.error("Error during base64 conversion:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>

        {/* Updated to call our async handler */}
        <TouchableOpacity style={[styles.button, styles.analyzeButton]} onPress={handleAnalyze}>
          <Text style={styles.buttonText}>Analyze</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Keep your existing styles exactly the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },
  image: { flex: 1, width: '100%' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 40, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  button: { flex: 1, marginHorizontal: 10, paddingVertical: 14, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  retakeButton: { backgroundColor: '#555555' },
  analyzeButton: { backgroundColor: '#2E5BBA' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});