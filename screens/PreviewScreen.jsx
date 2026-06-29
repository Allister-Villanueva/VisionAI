import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { imageToBase64 } from '../lib/gemini'; 

export default function PreviewScreen({ route, navigation }) {
  const { photoUri } = route.params;

  // Refactored to accept the specific mode chosen by the user
  async function handleAnalyze(promptKey) {
    try {
      const base64Image = await imageToBase64(photoUri);
      console.log(`Base64 ready for ${promptKey} analysis. Length:`, base64Image.length);
      
      // Pass BOTH the base64 string AND the selected prompt key
      navigation.navigate('Result', { base64Image, promptKey });
    } catch (error) {
      console.error("Error during base64 conversion:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />

      {/* Using a ScrollView for the control panel to fit all buttons neatly */}
      <ScrollView style={styles.controlPanel} contentContainerStyle={styles.panelContent}>
        <View style={styles.analysisGroup}>
          <TouchableOpacity style={[styles.button, styles.academicButton]} onPress={() => handleAnalyze('academic')}>
            <Text style={styles.buttonText}>🎓 Academic Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.safetyButton]} onPress={() => handleAnalyze('safety')}>
            <Text style={styles.buttonText}>⚠️ Safety Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.inventoryButton]} onPress={() => handleAnalyze('inventory')}>
            <Text style={styles.buttonText}>📦 Inventory Analysis</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.retakeText}>Retake Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, width: '100%' },
  controlPanel: { 
    maxHeight: 280, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  panelContent: { padding: 20, alignItems: 'stretch' },
  analysisGroup: { marginBottom: 12 },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  academicButton: { backgroundColor: '#4A3AFF' },
  safetyButton: { backgroundColor: '#FF9F0A' },
  inventoryButton: { backgroundColor: '#34C759' },
  retakeButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#8E8E93', marginBottom: 0 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  retakeText: { color: '#8E8E93', fontWeight: '600', fontSize: 15 }
});