import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { analyzeImage, PROMPTS } from '../lib/gemini'; // Import PROMPTS map

export default function ResultScreen({ route, navigation }) {
  // Grab both the image data and the selected dynamic key
  const { base64Image, promptKey } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        setError(null);

        // 1. DYNAMIC LOOKUP: Target the rule block using the route param key
        const targetedPrompt = PROMPTS[promptKey];
        
        if (!targetedPrompt) {
          throw new Error("Invalid or missing analysis configuration type.");
        }

        // 2. Pass the customized instructions block into your service
        const result = await analyzeImage(base64Image, targetedPrompt);

        const rawText = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(rawText);
        setAnalysis(parsedData);
      } catch (err) {
        console.error("Analysis structural crash:", err);
        setError("Something went wrong while processing the image. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (base64Image && promptKey) {
      fetchAnalysis();
    } else {
      setError("Required parameters missing.");
      setLoading(false);
    }
  }, [base64Image, promptKey]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A3AFF" />
        <Text style={styles.loadingText}>Running {promptKey} evaluation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.actionButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Dynamic Screen Title Header based on Selected Persona */}
      <Text style={styles.mainTitle}>
        {promptKey === 'academic' && '🎓 Academic Review'}
        {promptKey === 'safety' && '⚠️ Safety Inspection'}
        {promptKey === 'inventory' && '📦 Inventory Log'}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, styles[promptKey]]}>Identified Assets/Objects</Text>
        {analysis?.objects?.map((item, index) => (
          <Text key={index} style={styles.bulletItem}>• {item}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, styles[promptKey]]}>Context</Text>
        <Text style={styles.bodyText}>{analysis?.context}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, styles[promptKey]]}>
          {promptKey === 'academic' && 'Observations'}
          {promptKey === 'safety' && 'Hazards Found'}
          {promptKey === 'inventory' && 'Condition Assessment'}
        </Text>
        <Text style={styles.bodyText}>{analysis?.activities}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, styles[promptKey]]}>
          {promptKey === 'academic' && 'Constructive Feedback'}
          {promptKey === 'safety' && 'Required Actions'}
          {promptKey === 'inventory' && 'Tracking Steps'}
        </Text>
        <Text style={styles.bodyText}>{analysis?.recommendations}</Text>
      </View>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: styles[promptKey].color }]} onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.actionButtonText}>Scan New Image</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Accent configuration shortcuts for section text headers
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFC' },
  contentContainer: { padding: 24, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFC', padding: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 24, textAlign: 'center', textTransform: 'capitalize' },
  loadingText: { marginTop: 14, fontSize: 16, color: '#555', fontWeight: '500', textTransform: 'capitalize' },
  errorText: { fontSize: 16, color: '#D32F2F', textAlign: 'center', marginBottom: 20 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  sectionHeader: { fontSize: 14, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyText: { fontSize: 15, color: '#444', lineHeight: 22 },
  bulletItem: { fontSize: 15, color: '#444', marginBottom: 4 },
  actionButton: { paddingVertical: 14, paddingHorizontal: 36, borderRadius: 30, alignSelf: 'center', marginTop: 20 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Dynamic header themes map matching promptKey names
  academic: { color: '#4A3AFF' },
  safety: { color: '#FF9F0A' },
  inventory: { color: '#34C759' }
});