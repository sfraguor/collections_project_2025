// src/components/FullscreenImageViewer.js
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Text,
  StatusBar,
  Dimensions
} from 'react-native';
import { useTheme } from '../theme/theme';
import { CloseIcon } from './AppIcons';

/**
 * A fullscreen image viewer component with zoom and navigation
 * 
 * @param {Array} images - Array of image URIs to display
 * @param {number} initialIndex - Initial image index to display
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when the modal is closed
 */
export default function FullscreenImageViewer({
  images = [],
  initialIndex = 0,
  visible = false,
  onClose
}) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Update current index when initialIndex or visible changes
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, visible]);
  
  if (!visible || !images || images.length === 0) return null;
  
  // Navigate to previous image
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  // Navigate to next image
  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Close button */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <CloseIcon color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        {/* Image counter */}
        {images.length > 1 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {currentIndex + 1}/{images.length}
            </Text>
          </View>
        )}
        
        {/* Main image */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageContainer}
          onPress={onClose}
        >
          <Image
            source={{ uri: images[currentIndex] }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        {/* Navigation buttons (only if multiple images) */}
        {images.length > 1 && (
          <>
            <TouchableOpacity 
              style={[styles.navButton, styles.leftButton]} 
              onPress={goToPrevious}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.rightButton]} 
              onPress={goToNext}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    left: 20,
  },
  rightButton: {
    right: 20,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 36,
  },
});
