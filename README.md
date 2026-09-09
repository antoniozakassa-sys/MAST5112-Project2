# Christoffel's Kitchen — Menu Manager (Part 2: Working App)

A single-screen React Native (Expo) app that lets the chef add and view menu
items. Built to match the Part 1 UI designs — olive-and-terracotta "kitchen"
theme, "Christoffel's Kitchen / Menu manager" header, card-based dish list.

## Design continuity with Part 1

| Part 1 design element              | Part 2 implementation                                   |
|-------------------------------------|-----------------------------------------------------------|
| Deep olive header + "Christoffel's Kitchen / Menu manager" | Same header bar, colors, and copy |
| Terracotta "Save dish" button       | Same button, same color and label |
| Category dropdown (Starters/Mains/Dessert) | Same dropdown, opens a modal picker |
| Cream/beige rounded cards for dishes | Same card style for the menu list |
| "Add dish" form fields (Dish name, Category, Description, Price) | Identical field set and order |

## Part 2 

**1. User Interface** **
- Clear title/subtitle in the header ("Christoffel's Kitchen" / "Menu manager")
- Uses core React Native components: `TextInput`, `TouchableOpacity`,
  `FlatList`, `Modal`, `ScrollView`, `SafeAreaView`
- Readable typography, consistent spacing, layout matches the Part 1 mockups

**2. Capture Menu Info** **
- Fields for Dish Name, Description, Course/Category, Price
- Category captured via a dropdown-style selector (modal), matching the Part 1 design

**3. **Display Menu Items**
- Added dishes render as cards (category tag, name, description, price)
- Multiple dishes can be added; the list updates automatically via React state
- Item count shown in the section header

**4.**User Experience** **
- Required-field validation (including price must be a positive number) with
  inline error messages
- Confirmation message appears briefly after a successful save, and the form
  clears
- Friendly empty-state message when no dishes have been added yet
- Consistent styling (cards, header, buttons) throughout the screen


