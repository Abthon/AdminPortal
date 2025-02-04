// import { useLocation } from 'react-router';

// import { useMenuCurrentItem } from '@/components/menu';
// import { useMenus } from '@/providers';

// import { IToolbarPageTitleProps } from './types';

// const ToolbarPageTitle = ({ text }: IToolbarPageTitleProps) => {
//   const { pathname } = useLocation();
//   const { getMenuConfig } = useMenus();
//   const menuConfig = getMenuConfig('primary');
//   const menuItem = useMenuCurrentItem(pathname, menuConfig);

//   return (
//     <h1 className="text-xl font-medium leading-none text-gray-900">{text ?? menuItem?.title}</h1>
//   );
// };

// export { ToolbarPageTitle };
import { useLocation } from 'react-router';
import { useMenuCurrentItem, type TMenuConfig } from '@/components/menu';
import { useMenus } from '@/providers';
import { useAuthContext } from '@/auth';
import { IToolbarPageTitleProps } from './types';

const ToolbarPageTitle = ({ text }: IToolbarPageTitleProps) => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const { auth, getUserType } = useAuthContext();

  // Retrieve the raw menu configuration for "primary"
  const rawMenuConfig = getMenuConfig('primary') as 
    | TMenuConfig 
    | ((authToken: string, getUserType: (token: string) => string) => TMenuConfig);

  // Resolve the menu configuration: if rawMenuConfig is a function, call it; otherwise, use it directly.
  const menuConfig: TMenuConfig =
    typeof rawMenuConfig === 'function'
      ? rawMenuConfig(auth?.accessToken || '', getUserType)
      : rawMenuConfig;

  // Call useMenuCurrentItem with the menu configuration (first) and then the pathname.
  const menuItem = useMenuCurrentItem(menuConfig, pathname);

  return (
    <h1 className="text-xl font-medium leading-none text-gray-900">
      {text ?? menuItem?.title}
    </h1>
  );
};

export { ToolbarPageTitle };
