import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router";
import { DefaultPage, Demo1DarkSidebarPage } from "@/pages/dashboards";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import { VehiclePage } from "@/pages/public-profile/vehicle-type";
import { VechileRegistrationPage } from "@/pages/public-profile/vehicle-registration";
import { BookingPage } from "@/pages/public-profile/booking";
import { ConfigPage } from "@/pages/public-profile/config-table";
import { DriverPage } from "@/pages/public-profile/driver";
import { CoorporatePage } from "@/pages/public-profile/coorporate";
import { DriverProfilePage } from "@/pages/public-profile/driver-profile/crm";
import { BookingProfilePage } from "@/pages/public-profile/booking-profile";
import { VehicleProfilePage } from "@/pages/public-profile/vehicle-profile";
import { DepositPage } from "@/pages/public-profile/deposit";
import { BankPage } from "@/pages/public-profile/bank";
import { FuelPage } from "@/pages/public-profile/fuel";
import { UserPage } from "@/pages/public-profile/users";
import { DispatcherPage } from "@/pages/public-profile/dispatchers";
import { CoorProfilePage } from "@/pages/public-profile/coor-profile/crm";
import { UserProfilePage } from "@/pages/public-profile/user-profile/crm";
import { ReportPage } from "@/pages/public-profile/report";
const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />
          <Route
            path="/drivers"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <DriverPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vehicle-types"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <VehiclePage />
              </RequireAuth>
            }
          />
          <Route
            path="/vehicle-type/:id"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <VechileRegistrationPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <VechileRegistrationPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vehicle/:id"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <VehicleProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/coorporates"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <CoorporatePage />
              </RequireAuth>
            }
          />
          <Route
            path="/coorporates/:id"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <CoorProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookings"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <BookingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/configs"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <ConfigPage />
              </RequireAuth>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <UserPage />
              </RequireAuth>
            }
          />
          <Route
            path="/users/:id"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <UserProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/dispatchers"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <DispatcherPage />
              </RequireAuth>
            }
          />
          <Route
            path="/fuels"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <FuelPage />
              </RequireAuth>
            }
          />
          <Route
            path="/driver/:id"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <DriverProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <BookingProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/deposits"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <DepositPage />
              </RequireAuth>
            }
          />
          <Route
            path="/banks"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <BankPage />
              </RequireAuth>
            }
          />
          <Route
            path="/report"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <ReportPage />
              </RequireAuth>
            }
          />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
