// src/components/AppIcons.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Ionicons, 
  FontAwesome5,
  Feather
} from '@expo/vector-icons';
import { useTheme } from '../theme/theme';

/**
 * A collection of icon components for use throughout the app
 */

// Home screen icons
export const AddIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="add" size={size} color={color || colors.text} style={style} />;
};

export const SortIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="sort" size={size} color={color || colors.text} style={style} />;
};

export const SearchIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <Ionicons name="search" size={size} color={color || colors.text} style={style} />;
};

export const BackupIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="backup" size={size} color={color || colors.text} style={style} />;
};

export const StatsIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <Ionicons name="stats-chart" size={size} color={color || colors.text} style={style} />;
};

// Collection and item management icons
export const EditIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="edit" size={size} color={color || colors.text} style={style} />;
};

export const DeleteIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="delete" size={size} color={color || colors.text} style={style} />;
};

export const ShareIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="share" size={size} color={color || colors.text} style={style} />;
};

export const TagIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name="tag-multiple" size={size} color={color || colors.text} style={style} />;
};

export const FilterIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <Feather name="filter" size={size} color={color || colors.text} style={style} />;
};

export const ClearIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="clear" size={size} color={color || colors.text} style={style} />;
};

export const CameraIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="camera-alt" size={size} color={color || colors.text} style={style} />;
};

export const GalleryIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="photo-library" size={size} color={color || colors.text} style={style} />;
};

// Navigation and action icons
export const CloseIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="close" size={size} color={color || colors.text} style={style} />;
};

export const SaveIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="save" size={size} color={color || colors.text} style={style} />;
};

export const InfoIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="info" size={size} color={color || colors.text} style={style} />;
};

export const SettingsIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <Ionicons name="settings" size={size} color={color || colors.text} style={style} />;
};

// Theme icons
export const DarkModeIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <MaterialIcons name="nightlight-round" size={size} color={color || colors.text} style={style} />;
};

export const LightModeIcon = ({ size = 24, color, style }) => {
  const { colors } = useTheme();
  return <Ionicons name="sunny" size={size} color={color || colors.text} style={style} />;
};

// Button with icon wrapper
export const IconButton = ({ icon, size = 24, color, onPress, style, backgroundColor }) => {
  const { colors } = useTheme();
  return (
    <View 
      style={[
        styles.iconButton, 
        { backgroundColor: backgroundColor || colors.primary },
        style
      ]}
    >
      {React.cloneElement(icon, { size, color: color || '#FFFFFF' })}
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
