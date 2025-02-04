// import { matchPath } from 'react-router';
// import { TMenuConfig } from '../types.d';

// const useMenuChildren = (
//   pathname: string,
//   items: TMenuConfig,
//   level: number
// ): TMenuConfig | null => {
//   const hasActiveChild = (items: TMenuConfig): boolean => {
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       if (item.path && matchPath(pathname, item.path)) {
//         return true;
//       } else if (item.children) {
//         if (hasActiveChild(item.children as TMenuConfig)) {
//           return true;
//         }
//       }
//     }

//     return false;
//   };

//   const getChildren = (
//     items: TMenuConfig,
//     level: number = 0,
//     currentLevel: number = 0
//   ): TMenuConfig | null => {
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       if (item.children) {
//         // Check if we're at the desired level and if any child is active
//         if (level === currentLevel && hasActiveChild(item.children)) {
//           return item.children;
//         }

//         // Recursively check the children, incrementing the current level
//         const children = getChildren(item.children, level, currentLevel + 1);

//         // If valid children were found, return them
//         if (children) {
//           return children;
//         }
//       } else if (level === currentLevel && item.path && matchPath(pathname, item.path)) {
//         // If it's a leaf node and matches the path, return the current items
//         return items;
//       }
//     }

//     // Return null if no match was found at this level
//     return null;
//   };

//   return getChildren(items, level);
// };

// export { useMenuChildren };
// src/hooks/useMenuChildren.ts
import { matchPath } from 'react-router';
import { TMenuConfig, IMenuItemConfig } from '../types.d';

const useMenuChildren = (
  pathname: string,
  items: TMenuConfig,
  level: number
): TMenuConfig | null => {
  // Helper function to check if any child (or descendant) item is active.
  const hasActiveChild = (items: TMenuConfig): boolean => {
    if (!Array.isArray(items)) return false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue; // Skip undefined items

      if (item.path && matchPath(pathname, item.path)) {
        return true;
      } else if (Array.isArray(item.children)) {
        if (hasActiveChild(item.children)) {
          return true;
        }
      }
    }
    return false;
  };

  // Recursively traverse the menu items to get children at the desired level.
  const getChildren = (
    items: TMenuConfig,
    level: number = 0,
    currentLevel: number = 0
  ): TMenuConfig | null => {
    if (!Array.isArray(items)) return null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue; // Skip if the item is undefined

      // Check if the item has children and is an array
      if (Array.isArray(item.children)) {
        // If we're at the desired level and any child is active, return this children array.
        if (level === currentLevel && hasActiveChild(item.children)) {
          return item.children;
        }

        // Otherwise, recursively check the children, increasing the current level.
        const children = getChildren(item.children, level, currentLevel + 1);
        if (children) {
          return children;
        }
      } else if (
        level === currentLevel &&
        item.path &&
        matchPath(pathname, item.path)
      ) {
        // If it's a leaf node, and matches the path, return the current items.
        return items;
      }
    }
    return null;
  };

  return getChildren(items, level);
};

export { useMenuChildren };
