// import { ReactNode } from 'react';
// import { useMenus } from '@/providers';
// import { useMenuCurrentItem } from '@/components';
// import { useLocation } from 'react-router';

// export interface IToolbarHeadingProps {
//   title?: string | ReactNode;
//   description?: string | ReactNode;
// }

// const ToolbarHeading = ({ title = '', description }: IToolbarHeadingProps) => {
//   const { getMenuConfig } = useMenus();
//   const { pathname } = useLocation();
//   const currentMenuItem = useMenuCurrentItem(pathname, getMenuConfig('primary'));

//   return (
//     <div className="flex flex-col justify-center gap-2">
//       <h1 className="text-xl font-medium leading-none text-gray-900">
//         {title || currentMenuItem?.title}
//       </h1>
//       {description && (
//         <div className="flex items-center gap-2 text-sm font-normal text-gray-700">
//           {description}
//         </div>
//       )}
//     </div>
//   );
// };

// export { ToolbarHeading };
import { ReactNode } from 'react';
import { useMenus } from '@/providers';
import { useMenuCurrentItem, type TMenuConfig } from '@/components';
import { useLocation } from 'react-router';
import { useAuthContext } from '@/auth';

export interface IToolbarHeadingProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
}

const ToolbarHeading = ({ title = '', description }: IToolbarHeadingProps) => {
  const { getMenuConfig } = useMenus();
  const { pathname } = useLocation();
  const { auth, getUserType } = useAuthContext();

  // Retrieve the raw menu config for "primary" and assert its type.
  const rawMenuConfig = getMenuConfig('primary') as
    | TMenuConfig
    | ((authToken: string, getUserType: (token: string) => string) => TMenuConfig);

  // Resolve the menu config: if rawMenuConfig is a function, call it with auth parameters; otherwise, use it directly.
  const menuConfig: TMenuConfig =
    typeof rawMenuConfig === 'function'
      ? rawMenuConfig(auth?.accessToken || '', getUserType)
      : rawMenuConfig;

  // Swap the argument order: first the resolved menu config, then the pathname.
  const currentMenuItem = useMenuCurrentItem(menuConfig, pathname);

  return (
    <div className="flex flex-col justify-center gap-2">
      <h1 className="text-xl font-medium leading-none text-gray-900">
        {title || currentMenuItem?.title}
      </h1>
      {description && (
        <div className="flex items-center gap-2 text-sm font-normal text-gray-700">
          {description}
        </div>
      )}
    </div>
  );
};

export { ToolbarHeading };