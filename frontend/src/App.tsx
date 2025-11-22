import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { UserDashboard } from "./pages/user/UserDashboard";
import { AccountManagementPage } from "./pages/account/AccountManagementPage";
import { StudentDailyReportPage } from "./pages/diary/StudentDailyReportPage";
import { DailyReportManagementPage } from "./pages/diary/DailyReportManagementPage";
import { StudentQuestionPage } from "./pages/questions/StudentQuestionPage";
import { QuestionManagementPage } from "./pages/questions/QuestionManagementPage";
import { PlanTemplatePage } from "./pages/plans/PlanTemplatePage";
import { TrainingManagementPage } from "./pages/training/TrainingManagementPage";
import { StudentTrainingPage } from "./pages/training/StudentTrainingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/accounts" element={<AccountManagementPage />} />
        <Route path="/admin/diary" element={<DailyReportManagementPage />} />
        <Route path="/admin/questions" element={<QuestionManagementPage />} />
        <Route path="/admin/plans" element={<PlanTemplatePage />} />
        <Route path="/admin/training" element={<TrainingManagementPage />} />
        <Route path="/teacher/dashboard" element={<UserDashboard />} />
        <Route path="/teacher/accounts" element={<AccountManagementPage />} />
        <Route path="/teacher/diary" element={<DailyReportManagementPage />} />
        <Route path="/teacher/questions" element={<QuestionManagementPage />} />
        <Route path="/teacher/plans" element={<PlanTemplatePage />} />
        <Route path="/teacher/training" element={<TrainingManagementPage />} />
        <Route path="/student/dashboard" element={<UserDashboard />} />
        <Route path="/student/diary" element={<StudentDailyReportPage />} />
        <Route path="/student/questions" element={<StudentQuestionPage />} />
        <Route path="/student/training" element={<StudentTrainingPage />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
