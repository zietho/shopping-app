/*
  # Update seeded demo data to Austrian German

  ## Summary
  Translates all English seed data to Austrian German for the demo accounts.

  ## Changes

  ### Lists
  - "Weekly Groceries" → "Wöchentlicher Einkauf"

  ### Items
  All items in the demo list updated to Austrian German names:
  - Milk → Milch
  - Bread → Semmeln
  - Eggs → Eier
  - Butter → Butter (unchanged)
  - Cheese → Käse
  - Yogurt → Joghurt
  - Apples → Äpfel
  - Bananas → Bananen
  - Tomatoes → Paradeiser (Austrian)
  - Potatoes → Erdäpfel (Austrian)

  ### Templates
  - "Quick Breakfast" → "Schnelles Frühstück"
  - "Weekly Basics" → "Wocheneinkauf Basis"
  And their items translated to Austrian German.
*/

UPDATE lists
SET name = 'Wöchentlicher Einkauf'
WHERE name = 'Weekly Groceries';

UPDATE items
SET name = 'Milch'
WHERE name = 'Milk';

UPDATE items
SET name = 'Semmeln'
WHERE name = 'Bread';

UPDATE items
SET name = 'Eier'
WHERE name = 'Eggs';

UPDATE items
SET name = 'Käse'
WHERE name = 'Cheese';

UPDATE items
SET name = 'Joghurt'
WHERE name = 'Yogurt';

UPDATE items
SET name = 'Äpfel'
WHERE name = 'Apples';

UPDATE items
SET name = 'Bananen'
WHERE name = 'Bananas';

UPDATE items
SET name = 'Paradeiser'
WHERE name = 'Tomatoes';

UPDATE items
SET name = 'Erdäpfel'
WHERE name = 'Potatoes';

UPDATE templates
SET name = 'Schnelles Frühstück'
WHERE name = 'Quick Breakfast';

UPDATE templates
SET name = 'Wocheneinkauf Basis'
WHERE name = 'Weekly Basics';

UPDATE template_items
SET name = 'Milch'
WHERE name = 'Milk';

UPDATE template_items
SET name = 'Semmeln'
WHERE name = 'Bread';

UPDATE template_items
SET name = 'Eier'
WHERE name = 'Eggs';

UPDATE template_items
SET name = 'Butter'
WHERE name = 'Butter';

UPDATE template_items
SET name = 'Käse'
WHERE name = 'Cheese';

UPDATE template_items
SET name = 'Joghurt'
WHERE name = 'Yogurt';

UPDATE template_items
SET name = 'Orangensaft'
WHERE name = 'Orange Juice';

UPDATE template_items
SET name = 'Nudeln'
WHERE name = 'Pasta';

UPDATE template_items
SET name = 'Reis'
WHERE name = 'Rice';

UPDATE template_items
SET name = 'Paradeiser'
WHERE name = 'Tomatoes';

UPDATE template_items
SET name = 'Äpfel'
WHERE name = 'Apples';

UPDATE template_items
SET name = 'Hühnerfleisch'
WHERE name = 'Chicken';

UPDATE template_items
SET name = 'Zwiebeln'
WHERE name = 'Onions';

UPDATE template_items
SET name = 'Knoblauch'
WHERE name = 'Garlic';
