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

# Christoffel's Kitchen: Menu Manager (MAST5112 POE Part 3)

A React Native mobile app that lets a chef add, edit, delete, search, filter and review the dishes on a restaurant menu. This is the final part of the Portfolio of Evidence and builds on the Part 2 application.

**Video demonstration:** [https://youtu.be/Ir9G-pSWwQM]

## Features

### Manage menu items
- **Add** a dish with a name, course, description and price.
- **Edit** any existing dish. The form loads the dish's details, the heading changes to "Edit dish" and the button changes to "Update dish". "Cancel editing" discards changes.
- **Delete** a dish. A confirmation popup appears first to prevent accidental deletion.
- All changes appear in the menu list immediately.

### Search and filter
- **Search** by dish name (not case-sensitive, updates as you type).
- **Filter** by course using the chips: All, Starters, Mains, Dessert.
- Search and filter can be used together.
- **Clear search and filter** resets both and shows the full menu.
- The list header shows how many dishes match, for example "Menu items (2 of 6)".

### Menu statistics
A statistics card at the top of the screen shows:
- the total number of menu items
- the average price of all menu items
- the number of items in each course

The statistics always cover the whole menu, even while a search or filter is active.

### Validation and feedback
- Dish name, course, description and price are all required.
- Price must be a number greater than 0 and is stored with two decimal places.
- Invalid fields are highlighted in red with a message under the field.
- Green success and red error banners confirm each action and disappear automatically.
- Separate empty-state messages for "no dishes yet" and "no dishes match your search or filter".

## Improvements since Part 2

| Area | Change |
|---|---|
| Reusable components | `FormField`, `FilterChip`, `StatBox`, `MenuCard` |
| Reusable functions | `validateDishForm`, `formatPrice`, `showFeedback`, `resetForm` |
| Code organisation | File split into labelled sections: constants and types, helper functions, components, main app, styles |
| Naming | Descriptive names for state, handlers and styles |
| Performance | `useMemo` used for the filtered list and the statistics |
| User experience | Delete confirmation, edit mode highlighting, auto-clearing feedback banners, consistent colours across all sections |

## Tech stack

- React Native with Expo
- TypeScript
- React hooks (`useState`, `useRef`, `useMemo`)
- Components used: `View`, `Text`, `TextInput`, `TouchableOpacity`, `FlatList`, `ScrollView`, `Modal`, `KeyboardAvoidingView`, `StatusBar`, `SafeAreaView`

## How to run

**Requirements:** [Node.js](https://nodejs.org) (LTS version) and npm.

1. Clone the repository:
   ```
   git clone <your-repository-url>
   ```
2. Go into the project folder:
   ```
   cd christoffel-kitchen-menu-manager
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the app:
   ```
   npx expo start
   ```
5. Open it:
   - Press `w` to open it in your browser, or
   - Scan the QR code with the **Expo Go** app on your phone (phone and computer on the same Wi-Fi).

If the web version asks for extra packages, run:
```
npx expo install react-dom react-native-web @expo/metro-runtime
```

## Project structure

```
christoffel-kitchen-menu-manager/
├── App.tsx          # All screens, components, logic and styles
├── package.json
└── ...
```

## Notes

- Menu items are stored in app state, so they reset when the app is reloaded or closed. There is no database.
- Courses used: Starters, Mains, Dessert.

## Author

[Antonio Zakassa], [ST10522875]
MAST5112 Portfolio of Evidence, Part 3
