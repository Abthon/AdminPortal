import { IScrollspyMenuItems, ScrollspyMenu } from "@/partials/menu";

const BookingSidebar = () => {
  const items: IScrollspyMenuItems = [
    {
      title: "Ride Detail",
      target: "ride-detail",
      active: true,
    },
    {
      title: "Corporate Detail",
      target: "coor-detail",
    },
    // {
    //   title: "Pick up Information",
    //   target: "pickup-info",
    // },
    // {
    //   title: "Drop off Information",
    //   target: "dropoff-info",
    // },
    {
      title: "Distance & Price Information",
      target: "distance-price-info",
    },
    {
      title: "Timing Information",
      target: "time-info",
    },
    {
      title: "Path Information",
      target: "path-info",
      // active: false,
    },
    // {
    //   title: "Authentication",
    //   children: [
    //     {
    //       title: "Email",
    //       target: "auth_email",
    //       active: false,
    //     },
    //     {
    //       title: "Password",
    //       target: "auth_password",
    //     },
    //     {
    //       title: "Social Sign in",
    //       target: "auth_social_sign_in",
    //     },
    //     {
    //       title: "Single Sign On(SSO)",
    //       target: "auth_social_sign_in_sso",
    //     },
    //     {
    //       title: "Two-Factor auth(2FA)",
    //       target: "auth_two_factor",
    //     },
    //   ],
    // },
    // {
    //   title: "Advanced Settings",
    //   children: [
    //     {
    //       title: "Preferences",
    //       target: "advanced_settings_preferences",
    //     },
    //     {
    //       title: "Appearance",
    //       target: "advanced_settings_appearance",
    //     },
    //     {
    //       title: "Notifications",
    //       target: "advanced_settings_notifications",
    //     },
    //     {
    //       title: "Address",
    //       target: "advanced_settings_address",
    //     },
    //   ],
    // },
    // {
    //   title: "External Services",
    //   children: [
    //     {
    //       title: "Manage API",
    //       target: "external_services_manage_api",
    //     },
    //     {
    //       title: "Integrations",
    //       target: "external_services_integrations",
    //     },
    //   ],
    // },
    // {
    //   title: "Delete Account",
    //   target: "delete_account",
    // },
  ];

  return <ScrollspyMenu items={items} />;
};

export { BookingSidebar };
