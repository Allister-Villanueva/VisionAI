import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { analyzeImage } from '../lib/gemini';

export default function ResultScreen({ route, navigation }) {
  const { base64Image } = route.params || {};

  // 1. Core structural states requested by the guide
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function fetchAnalysis() {
      // Prompt designed to strictly enforce the requested JSON shape response
      const systemPrompt = `
        Analyze this image and respond ONLY with a raw JSON object matching this exact shape:
        {
          "objects": ["item1", "item2"],
          "context": "description of the setting/environment",
          "activities": "description of actions occurring",
          "recommendations": "practical next steps or suggestions"
        }
        Do not wrap the response in markdown blocks like \`\`\`json. Return only pure parseable JSON text.
      `;

      try {
        setLoading(true);
        setError(null);

        // Call the service function built in Phase 4
        const result = await analyzeImage(base64Image, systemPrompt);

        // Extracting target string along Gemini's content hierarchy path
        const rawText = result.candidates[0].content.parts[0].text;
        
        // Parse into our structured application state
        const parsedData = JSON.parse(rawText);
        setAnalysis(parsedData);
      } catch (err) {
        console.error("Analysis structural crash:", err);
        setError("Something went wrong while processing the image. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (base64Image) {
      fetchAnalysis();
    } else {
      setError("No image data received.");
      setLoading(false);
    }
  }, [base64Image]);

  // RENDER STATE A: Loading Interface
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E5BBA" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  // RENDER STATE B: Friendly Error Screen
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

  // RENDER STATE C: Core Four-Section Content Output
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.mainTitle}>Vision AI Analysis</Text>

      {/* Section 1: Objects (Bullet List) */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Detected Objects</Text>
        {analysis?.objects?.map((item, index) => (
          <Text key={index} style={styles.bulletItem}>• {item}</Text>
        ))}
      </View>

      {/* Section 2: Context */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Context</Text>
        <Text style={styles.bodyText}>{analysis?.context}</Text>
      </View>

      {/* Section 3: Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Activities</Text>
        <Text style={styles.bodyText}>{analysis?.activities}</Text>
      </View>

      {/* Section 4: Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Recommendations</Text>
        <Text style={styles.bodyText}>{analysis?.recommendations}</Text>
      </View>

      {/* Return Action button */}
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.actionButtonText}>Scan Another Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    padding: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E5BBA',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  bulletItem: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
    paddingLeft: 4,
  },
  actionButton: {
    backgroundColor: '#2E5BBA',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});