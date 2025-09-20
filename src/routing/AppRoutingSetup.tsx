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
import { TherapistPage } from "@/pages/public-profile/therapist";
import { ClientPage } from "@/pages/public-profile/client";
import { CoorporatePage } from "@/pages/public-profile/coorporate";
import { DriverProfilePage } from "@/pages/public-profile/driver-profile/crm";
import { BookingProfilePage } from "@/pages/public-profile/booking-profile";
import { VehicleProfilePage } from "@/pages/public-profile/vehicle-profile";
import { FuelPage } from "@/pages/public-profile/fuel";
import { UserPage } from "@/pages/public-profile/users";
import { DispatcherPage } from "@/pages/public-profile/dispatchers";
import { CoorProfilePage } from "@/pages/public-profile/coor-profile/crm";
import { UserProfilePage } from "@/pages/public-profile/user-profile/crm";
import { ReportPage } from "@/pages/public-profile/report";
import { OdometerPage } from "@/pages/public-profile/odometer";
import { TransactionPaymentPage } from "@/pages/public-profile/booking payment";
import { SessionPage } from "@/pages/public-profile/session";
import { QuotePage } from "@/pages/public-profile/daily-quotes";
import { BankPage } from "@/pages/public-profile/bank";

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route>
        <Route element={<Demo1Layout />}>
          <Route
            path="/"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <DefaultPage />
              </RequireAuth>
            }
          />
          <Route
            path="/therapists"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <TherapistPage />
              </RequireAuth>
            }
          />
          <Route
            path="/clients"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <ClientPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dispatchers"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <DispatcherPage />
              </RequireAuth>
            }
          />
          <Route
            path="/sessions"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <SessionPage />
              </RequireAuth>
            }
          />
          <Route
            path="/banks"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <BankPage />
              </RequireAuth>
            }
          />
          <Route
            path="/daily-qoutes"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <QuotePage />
              </RequireAuth>
            }
          />
          <Route
            path="/configs"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <ConfigPage />
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
