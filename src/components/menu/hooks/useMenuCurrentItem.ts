// import { matchPath } from 'react-router';

// import { IMenuItemConfig, type TMenuConfig } from '../types';

// const useMenuCurrentItem = (
//   pathname: string,
//   items: TMenuConfig | null
// ): IMenuItemConfig | null => {
//   pathname = pathname.trim();

//   const findCurrentItem = (items: TMenuConfig | null): IMenuItemConfig | null => {
//     if (!items) return null;

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       if (item.path && matchPath(pathname, item.path)) {
//         return item ?? null;
//       } else if (item.children) {
//         const childItem = findCurrentItem(item.children as TMenuConfig);
//         if (childItem) {
//           return childItem;
//         }
//       }
//     }

//     return null;
//   };

//   return findCurrentItem(items);
// };

// export { useMenuCurrentItem };
// src/hooks/useMenuCurrentItem.ts
import { matchPath } from 'react-router';
import { TMenuConfig, IMenuItemConfig } from '../types.d';

/**
 * Recursively searches the menu items for an item whose path matches the provided pathname.
 * Defensive checks ensure that items exist before accessing their properties.
 *
 * @param items - The array of menu items.
 * @param pathname - The current pathname.
 * @returns The matching menu item or null if no match is found.
 */
const findCurrentItem = (
  items: TMenuConfig,
  pathname: string
): IMenuItemConfig | null => {
  if (!Array.isArray(items)) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Skip undefined or null items
    if (!item) continue;

    // Check if the item has a valid path and if it matches the current pathname
    if (item.path && matchPath(pathname, item.path)) {
      return item;
    }

    // If the item has children, ensure it's an array and recursively search them
    if (Array.isArray(item.children)) {
      const found = findCurrentItem(item.children, pathname);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Custom hook to get the current active menu item based on the pathname.
 *
 * @param items - The menu configuration array.
 * @param pathname - The current location pathname.
 * @returns The current active menu item or null if not found.
 */
const useMenuCurrentItem = (
  items: TMenuConfig,
  pathname: string
): IMenuItemConfig | null => {
  return findCurrentItem(items, pathname);
};

export { useMenuCurrentItem };
