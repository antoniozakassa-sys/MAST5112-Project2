import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';

const COURSES = ['Starters', 'Mains', 'Dessert'];

export default function App() {
  // Form state
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Dropdown state
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  // App state
  const [menuItems, setMenuItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState('');

  const validate = () => {
    const newErrors = {};

    if (!dishName.trim()) {
      newErrors.dishName = 'Dish name is required.';
    }
    if (!category) {
      newErrors.category = 'Please select a category.';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!price.trim()) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Enter a valid price greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDish = () => {
    setConfirmation('');

    if (!validate()) {
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      dishName: dishName.trim(),
      category,
      description: description.trim(),
      price: Number(price).toFixed(2),
    };

    setMenuItems((prev) => [...prev, newItem]);

    // Reset form
    setDishName('');
    setCategory(null);
    setDescription('');
    setPrice('');
    setErrors({});

    setConfirmation(`"${newItem.dishName}" was added to the menu.`);
    setTimeout(() => setConfirmation(''), 2500);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryPillSmall}>{item.category}</Text>
          <Text style={styles.cardTitle}>{item.dishName}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
        <Text style={styles.cardPrice}>R{item.price}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Christoffel's Kitchen</Text>
        <Text style={styles.headerSubtitle}>Menu manager</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Add Dish Form */}
          <View style={styles.form}>
            <Text style={styles.formHeading}>Add dish</Text>

            <Text style={styles.label}>Dish name</Text>
            <TextInput
              style={[styles.input, errors.dishName && styles.inputError]}
              placeholder="e.g. Butternut soup"
              placeholderTextColor="#A69C89"
              value={dishName}
              onChangeText={setDishName}
            />
            {errors.dishName ? (
              <Text style={styles.errorText}>{errors.dishName}</Text>
            ) : null}

            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                errors.category && styles.inputError,
              ]}
              onPress={() => setCategoryPickerVisible(true)}
            >
              <Text
                style={
                  category ? styles.dropdownTextSelected : styles.dropdownText
                }
              >
                {category || 'Select category'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            {errors.category ? (
              <Text style={styles.errorText}>{errors.category}</Text>
            ) : null}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              placeholder="Short description"
              placeholderTextColor="#A69C89"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : null}

            <Text style={styles.label}>Price (R)</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="0.00"
              placeholderTextColor="#A69C89"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            {errors.price ? (
              <Text style={styles.errorText}>{errors.price}</Text>
            ) : null}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDish}>
              <Text style={styles.saveButtonText}>Save dish</Text>
            </TouchableOpacity>

            {confirmation ? (
              <Text style={styles.confirmationText}>{confirmation}</Text>
            ) : null}
          </View>

          {/* Menu List */}
          <View style={styles.listSection}>
            <Text style={styles.listHeader}>
              Menu items ({menuItems.length})
            </Text>

            {menuItems.length === 0 ? (
              <Text style={styles.emptyText}>
                No dishes have been added yet. Use the form above to add your
                first dish.
              </Text>
            ) : (
              <FlatList
                data={menuItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryPickerVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select category</Text>
            {COURSES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(c);
                  setCategoryPickerVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const OLIVE = '#3E4B32';
const OLIVE_DARK = '#2F3A26';
const TERRACOTTA = '#B85C38';
const CREAM = '#F1EADC';
const CARD_BG = '#F7F2E7';
const TEXT_DARK = '#2B2A22';
const TEXT_MUTED = '#7A7362';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
  },
  header: {
    backgroundColor: OLIVE,
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#D9D3C2',
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4DCC8',
  },
  formHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D8CDB4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT_DARK,
    backgroundColor: '#FDFBF6',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#D8CDB4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FDFBF6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#A69C89',
    fontSize: 15,
  },
  dropdownTextSelected: {
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: '600',
  },
  chevron: {
    color: TEXT_MUTED,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#C0392B',
  },
  errorText: {
    color: '#C0392B',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: TERRACOTTA,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmationText: {
    color: '#3F7D3A',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  listSection: {
    marginTop: 26,
  },
  listHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 12,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4DCC8',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryPillSmall: {
    color: TERRACOTTA,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  cardDescription: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginTop: 4,
  },
  cardPrice: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    width: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE7D6',
  },
  modalOptionText: {
    fontSize: 15,
    color: TEXT_DARK,
  },
});
