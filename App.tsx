import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Constants and types                                                 */
/* ------------------------------------------------------------------ */

const COURSES = ['Starters', 'Mains', 'Dessert'];

type MenuItem = {
  id: string;
  dishName: string;
  category: string;
  description: string;
  price: string;
};

type FormErrors = Partial<{
  dishName: string;
  category: string;
  description: string;
  price: string;
}>;

type Feedback = { text: string; type: 'success' | 'error' } | null;

/* ------------------------------------------------------------------ */
/* Reusable helper functions                                           */
/* ------------------------------------------------------------------ */

const formatPrice = (value: number | string): string => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'R0.00';
  }

  return `R${numericValue.toFixed(2)}`;
};

const sanitizePriceInput = (value: string): string => {
  if (!value) return '';

  let sanitized = value.replace(/[^0-9.]/g, '');

  if (!sanitized || sanitized === '.') {
    return sanitized === '.' ? '0.' : '';
  }

  const firstDotIndex = sanitized.indexOf('.');
  if (firstDotIndex === -1) {
    return sanitized;
  }

  const whole = sanitized.slice(0, firstDotIndex).replace(/\D/g, '');
  const fractional = sanitized.slice(firstDotIndex + 1).replace(/\./g, '');

  sanitized = `${whole}.${fractional}`;

  if (sanitized.startsWith('.')) {
    sanitized = `0${sanitized}`;
  }

  return sanitized;
};

const validateDishForm = (
  dishName: string,
  category: string | null,
  description: string,
  price: string
): FormErrors => {
  const errors: FormErrors = {};
  const trimmedDishName = dishName.trim();
  const trimmedDescription = description.trim();
  const trimmedPrice = price.trim();

  if (!trimmedDishName) {
    errors.dishName = 'Dish name is required.';
  }
  if (!category) {
    errors.category = 'Please select a category.';
  }
  if (!trimmedDescription) {
    errors.description = 'Description is required.';
  }
  if (!trimmedPrice) {
    errors.price = 'Price is required.';
  } else {
    const numericPrice = Number(trimmedPrice);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      errors.price = 'Enter a valid price greater than 0.';
    }
  }

  return errors;
};

/* ------------------------------------------------------------------ */
/* Reusable components                                                 */
/* ------------------------------------------------------------------ */

type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

const FormField = ({ label, error, children }: FormFieldProps) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

type ChipProps = { label: string; active: boolean; onPress: () => void };

const FilterChip = ({ label, active, onPress }: ChipProps) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

type StatBoxProps = { label: string; value: string };

const StatBox = ({ label, value }: StatBoxProps) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

type MenuCardProps = {
  item: MenuItem;
  isBeingEdited: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
};

const MenuCard = ({ item, isBeingEdited, onEdit, onDelete }: MenuCardProps) => (
  <View style={[styles.card, isBeingEdited && styles.cardEditing]}>
    <View style={styles.cardTopRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.categoryPillSmall}>{item.category}</Text>
        <Text style={styles.cardTitle}>{item.dishName}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
      <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => onEdit(item)}
        accessibilityLabel={`Edit ${item.dishName}`}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item)}
        accessibilityLabel={`Delete ${item.dishName}`}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

/* ------------------------------------------------------------------ */
/* Main app                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const scrollRef = useRef<ScrollView>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal state
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // App state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  const isEditing = editingId !== null;

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  /* ---------- derived data ---------- */

  const visibleItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCourse = !activeCourse || item.category === activeCourse;
      const matchesSearch =
        !query || item.dishName.toLowerCase().includes(query);
      return matchesCourse && matchesSearch;
    });
  }, [menuItems, searchText, activeCourse]);

  const stats = useMemo(() => {
    const total = menuItems.length;
    const sum = menuItems.reduce((acc, item) => acc + Number(item.price), 0);
    const average = total > 0 ? sum / total : 0;
    const perCourse = COURSES.map((course) => ({
      course,
      count: menuItems.filter((item) => item.category === course).length,
    }));
    return { total, average, perCourse };
  }, [menuItems]);

  const filtersActive = searchText.trim() !== '' || activeCourse !== null;

  /* ---------- helpers ---------- */

  const showFeedback = (text: string, type: 'success' | 'error') => {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    setFeedback({ text, type });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3000);
  };

  const resetForm = () => {
    setDishName('');
    setCategory(null);
    setDescription('');
    setPrice('');
    setErrors({});
    setEditingId(null);
  };

  const clearFilters = () => {
    setSearchText('');
    setActiveCourse(null);
  };

  /* ---------- actions ---------- */

  const handleSaveDish = () => {
    const newErrors = validateDishForm(dishName, category, description, price);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showFeedback('Please fix the highlighted fields and try again.', 'error');
      return;
    }

    const cleanedItem = {
      dishName: dishName.trim(),
      category: category || '',
      description: description.trim(),
      price: Number(price).toFixed(2),
    };

    if (editingId) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...cleanedItem } : item
        )
      );
      showFeedback(`"${cleanedItem.dishName}" was updated.`, 'success');
    } else {
      const newItem: MenuItem = { id: Date.now().toString(), ...cleanedItem };
      setMenuItems((prev) => [...prev, newItem]);
      showFeedback(`"${newItem.dishName}" was added to the menu.`, 'success');
    }

    resetForm();
  };

  const handleStartEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setDishName(item.dishName);
    setCategory(item.category);
    setDescription(item.description);
    setPrice(item.price);
    setErrors({});
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) {
      return;
    }

    setMenuItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));

    if (editingId === itemToDelete.id) {
      resetForm();
    }

    showFeedback(`"${itemToDelete.dishName}" was deleted.`, 'success');
    setItemToDelete(null);
  };

  /* ---------- render ---------- */

  const renderItem = ({ item }: { item: MenuItem }) => (
    <MenuCard
      item={item}
      isBeingEdited={item.id === editingId}
      onEdit={handleStartEdit}
      onDelete={setItemToDelete}
    />
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
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Feedback message */}
          {feedback ? (
            <Text
              style={[
                styles.feedbackText,
                feedback.type === 'success'
                  ? styles.feedbackSuccess
                  : styles.feedbackError,
              ]}
            >
              {feedback.text}
            </Text>
          ) : null}

          {/* Menu statistics */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionHeading}>Menu statistics</Text>
            <View style={styles.statsRow}>
              <StatBox label="Total items" value={String(stats.total)} />
              <StatBox
                label="Average price"
                value={stats.total > 0 ? formatPrice(stats.average) : 'R0.00'}
              />
            </View>
            <View style={styles.statsRow}>
              {stats.perCourse.map(({ course, count }) => (
                <StatBox key={course} label={course} value={String(count)} />
              ))}
            </View>
          </View>

          {/* Add / edit dish form */}
          <View style={[styles.form, isEditing && styles.formEditing]}>
            <Text style={styles.formHeading}>
              {isEditing ? 'Edit dish' : 'Add dish'}
            </Text>

            <FormField label="Dish name" error={errors.dishName}>
              <TextInput
                style={[styles.input, errors.dishName && styles.inputError]}
                placeholder="e.g. Butternut soup"
                placeholderTextColor="#A69C89"
                value={dishName}
                onChangeText={setDishName}
              />
            </FormField>

            <FormField label="Category" error={errors.category}>
              <TouchableOpacity
                style={[styles.dropdown, errors.category && styles.inputError]}
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
            </FormField>

            <FormField label="Description" error={errors.description}>
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
            </FormField>

            <FormField label="Price (R)" error={errors.price}>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="0.00"
                placeholderTextColor="#A69C89"
                value={price}
                onChangeText={(value) => setPrice(sanitizePriceInput(value))}
                keyboardType="decimal-pad"
              />
            </FormField>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDish}>
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update dish' : 'Save dish'}
              </Text>
            </TouchableOpacity>

            {isEditing ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancel editing</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Menu list with search and filter */}
          <View style={styles.listSection}>
            <Text style={styles.listHeader}>
              Menu items ({visibleItems.length}
              {filtersActive ? ` of ${menuItems.length}` : ''})
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Search by dish name"
              placeholderTextColor="#A69C89"
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
            />

            <View style={styles.chipRow}>
              <FilterChip
                label="All"
                active={activeCourse === null}
                onPress={() => setActiveCourse(null)}
              />
              {COURSES.map((course) => (
                <FilterChip
                  key={course}
                  label={course}
                  active={activeCourse === course}
                  onPress={() =>
                    setActiveCourse(activeCourse === course ? null : course)
                  }
                />
              ))}
            </View>

            {filtersActive ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>
                  Clear search and filter
                </Text>
              </TouchableOpacity>
            ) : null}

            {menuItems.length === 0 ? (
              <Text style={styles.emptyText}>
                No dishes have been added yet. Use the form above to add your
                first dish.
              </Text>
            ) : visibleItems.length === 0 ? (
              <Text style={styles.emptyText}>
                No dishes match your search or filter. Clear them to see the
                full menu.
              </Text>
            ) : (
              <FlatList
                data={visibleItems}
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
        <TouchableWithoutFeedback onPress={() => setCategoryPickerVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        visible={itemToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setItemToDelete(null)}
      >
        <TouchableWithoutFeedback onPress={() => setItemToDelete(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Delete dish?</Text>
                <Text style={styles.modalMessage}>
                  "{itemToDelete?.dishName}" will be removed from the menu. This
                  cannot be undone.
                </Text>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setItemToDelete(null)}
                  >
                    <Text style={styles.cancelButtonText}>Keep dish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalDeleteButton}
                    onPress={handleConfirmDelete}
                  >
                    <Text style={styles.saveButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const OLIVE = '#3E4B32';
const OLIVE_DARK = '#2F3A26';
const TERRACOTTA = '#B85C38';
const CREAM = '#F1EADC';
const CARD_BG = '#F7F2E7';
const TEXT_DARK = '#2B2A22';
const TEXT_MUTED = '#7A7362';
const ERROR_RED = '#C0392B';
const SUCCESS_GREEN = '#3F7D3A';
const BORDER = '#E4DCC8';

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

  /* feedback */
  feedbackText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
  },
  feedbackSuccess: {
    color: SUCCESS_GREEN,
    backgroundColor: '#E6F0E2',
  },
  feedbackError: {
    color: ERROR_RED,
    backgroundColor: '#F8E3E0',
  },

  /* statistics */
  statsSection: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FDFBF6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: OLIVE_DARK,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  /* form */
  form: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  formEditing: {
    borderColor: TERRACOTTA,
    borderWidth: 2,
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
    borderColor: ERROR_RED,
  },
  errorText: {
    color: ERROR_RED,
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
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D8CDB4',
  },
  cancelButtonText: {
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: '600',
  },

  /* list, search and filter */
  listSection: {
    marginTop: 26,
  },
  listHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8CDB4',
    backgroundColor: '#FDFBF6',
  },
  chipActive: {
    backgroundColor: OLIVE,
    borderColor: OLIVE,
  },
  chipText: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 12,
  },
  clearButtonText: {
    color: TERRACOTTA,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },

  /* cards */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardEditing: {
    borderColor: TERRACOTTA,
    borderWidth: 2,
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: OLIVE,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ERROR_RED,
  },
  deleteButtonText: {
    color: ERROR_RED,
    fontSize: 13,
    fontWeight: '700',
  },

  /* modals */
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
  modalMessage: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 16,
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
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8CDB4',
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: ERROR_RED,
  },
});
