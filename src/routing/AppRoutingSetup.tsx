import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router";
import { DefaultPage } from "@/pages/dashboards";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import { ConfigPage } from "@/pages/public-profile/config-table";
import {
  TherapistPage,
  TherapistDetailPage,
} from "@/pages/public-profile/therapist";
import { ClientPage, ClientDetailPage } from "@/pages/public-profile/client";
import { DispatcherPage } from "@/pages/public-profile/dispatchers";
import { SessionPage } from "@/pages/public-profile/session";
import { QuotePage } from "@/pages/public-profile/daily-quotes";
import { BankPage } from "@/pages/public-profile/bank";
import { QuestionPage } from "@/pages/public-profile/question";
import { SessionDetailContent } from "@/pages/public-profile/session/blocks/SessionDetailContent";
import { SessionDetailPage } from "@/pages/public-profile/session/SessionDetailPage";

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
            path="/therapists/:id"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <TherapistDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <SessionDetailPage />
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
            path="/clients/:id"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <ClientDetailPage />
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
            path="/questions"
            element={
              <RequireAuth allowedRoles={["admin", "dispatch"]}>
                <QuestionPage />
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
