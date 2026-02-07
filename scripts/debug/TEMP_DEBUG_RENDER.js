// VERSIÓN TEMPORAL SIMPLIFICADA PARA DEBUGGING

const renderCollectionItemSimple = ({ item: collection }) => {
  console.log('🔍 Simple render - collection name:', collection?.name);
  
  if (!collection) {
    return null;
  }

  return (
    <View style={{ padding: 16, margin: 8, backgroundColor: '#333', borderRadius: 8 }}>
      <Text style={{ color: '#fff', fontSize: 16 }}>
        Collection: {collection.name || 'No name'}
      </Text>
      <Text style={{ color: '#aaa', fontSize: 14 }}>
        User: {collection.username || 'No user'}
      </Text>
    </View>
  );
};

// Para usar temporalmente, reemplaza en el FlatList:
// renderItem={renderCollectionItemSimple}