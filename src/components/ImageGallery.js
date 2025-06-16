// src/components/ImageGallery.js
import React, { useState } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Dimensions,
  ScrollView
} from 'react-native';
import { useTheme } from '../theme/theme';

/**
 * A component for displaying multiple images with navigation controls
 * 
 * @param {Array} images - Array of image URIs to display
 * @param {number} height - Height of the gallery (default: 200)
 * @param {boolean} showThumbnails - Whether to show thumbnails below the main image
 * @param {boolean} allowFullscreen - Whether to allow fullscreen view on image press
 * @param {Function} onImagePress - Function to call when an image is pressed
 */
export default function ImageGallery({ 
  images = [], 
  height = 200,
  showThumbnails = true,
  allowFullscreen = false,
  onImagePress
}) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  
  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <View 
        style={[
          styles.noImageContainer, 
          { 
            height, 
            backgroundColor: colors.border 
          }
        ]}
      >
        <Text style={[styles.noImageText, { color: colors.textSecondary }]}>
          No Images
        </Text>
      </View>
    );
  }
  
  // If only one image, show it without navigation
  if (images.length === 1) {
    return (
      <TouchableOpacity
        activeOpacity={allowFullscreen ? 0.8 : 1}
        onPress={allowFullscreen && onImagePress ? () => onImagePress(images[0], 0) : null}
      >
        <Image 
          source={{ uri: images[0] }} 
          style={[styles.mainImage, { height }]} 
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }
  
  // Navigate to previous image
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  // Navigate to next image
  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // Handle thumbnail press
  const handleThumbnailPress = (index) => {
    setCurrentIndex(index);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.mainImageContainer}>
        <TouchableOpacity
          activeOpacity={allowFullscreen ? 0.8 : 1}
          onPress={allowFullscreen && onImagePress ? () => onImagePress(images[currentIndex], currentIndex) : null}
          style={{ flex: 1 }}
        >
          <Image 
            source={{ uri: images[currentIndex] }} 
            style={[styles.mainImage, { height }]} 
            resizeMode="cover"
          />
        </TouchableOpacity>
        
        {/* Navigation arrows */}
        <TouchableOpacity 
          style={[styles.navButton, styles.leftButton, { backgroundColor: colors.overlay }]} 
          onPress={goToPrevious}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.rightButton, { backgroundColor: colors.overlay }]} 
          onPress={goToNext}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
        
        {/* Image counter */}
        <View style={[styles.counter, { backgroundColor: colors.overlay }]}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{images.length}
          </Text>
        </View>
      </View>
      
      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <View style={styles.thumbnailsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsContent}
            nestedScrollEnabled={true}
          >
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleThumbnailPress(index)}
                style={[
                  styles.thumbnailButton,
                  currentIndex === index && { borderColor: colors.primary, borderWidth: 2 }
                ]}
              >
                <Image 
                  source={{ uri: image }} 
                  style={styles.thumbnail} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mainImageContainer: {
    position: 'relative',
    width: '100%',
  },
  mainImage: {
    width: '100%',
    borderRadius: 8,
  },
  noImageContainer: {
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  counter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailsContainer: {
    marginTop: 8,
    height: 60,
  },
  thumbnailsContent: {
    paddingHorizontal: 4,
  },
  thumbnailButton: {
    marginHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
});
